// Modulos Externos
import { BadRequestException, Injectable } from '@nestjs/common';

// Modulos Internos
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsStream } from './event.stream';
import { GeospatialService } from './geospatial.service';
import { NotificationService } from './notification.service';
import {
  Gravedad,
  SearchReportRequestDto,
} from './dto/search-report-request.dto';

@Injectable()
export class ReportsService {
  private reports: any[] = [];

  constructor(
    private readonly streamService: ReportsStream,
    private readonly geospatialService: GeospatialService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateReportDto) {
    // Encontrar el barrio basado en las coordenadas
    const neighborhood = this.geospatialService.findNearestNeighborhood(
      dto.lat,
      dto.lng,
    );

    const report = {
      id: this.reports.length + 1,
      ...dto,
      neighborhoodName: neighborhood?.nombre_barrio || null,
      localidad: neighborhood?.localidad || null,
      provincia: neighborhood?.provincia || null,
      departamento: neighborhood?.departamento || null,
      status: 'pending',
      createdAt: new Date(),
    };

    this.reports.push(report);

    // Emitir evento SSE cuando se crea un reporte
    this.streamService.emitCreated(report);

    // Notificar a usuarios suscritos al barrio (async, no bloquear la respuesta)
    if (report.neighborhoodName) {
      this.notificationService
        .notifyNeighborhoodSubscribers(report)
        .catch((err) => console.error('Failed to send notifications:', err));
    }

    return report;
  }

  /*
   * Buscar por radio el reporte
   * */
  findNearby(lat: number, lng: number, radiusKm: number) {
    const R = 6371;
    const toRad = (v: number) => (v * Math.PI) / 180;

    return this.reports.filter((r) => {
      const dLat = toRad(r.lat - lat);
      const dLng = toRad(r.lng - lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) * Math.cos(toRad(r.lat)) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c <= radiusKm;
    });
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    const index = this.reports.findIndex((report) => report.id === id);
    if (index !== -1) {
      this.reports[index] = { ...this.reports[index], ...updateReportDto };

      // Emitir evento SSE cuando se actualiza un reporte
      this.streamService.emitUpdated(this.reports[index]);

      return this.reports[index];
    }
    return null;
  }

  remove(id: number) {
    const index = this.reports.findIndex((report) => report.id === id);
    if (index !== -1) {
      const removed = this.reports.splice(index, 1);

      // Emitir evento SSE cuando se elimina un reporte
      this.streamService.emitDeleted(id);

      return removed[0];
    }
    return null;
  }
  async search(dto: SearchReportRequestDto): Promise<Reporte[]> {
    const qb = this.reportRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.ubicacion', 'u');

    // Texto libre
    if (dto.q) {
      qb.andWhere('(r.descripcion ILIKE :q)', { q: `%${dto.q}%` });
    }

    // Filtros directos
    if (dto.categoriaId)
      qb.andWhere('r.categoriaId = :c', { c: dto.categoriaId });
    if (dto.gravedad)
      qb.andWhere('r.gravedad = :g', { g: dto.gravedad as Gravedad });

    // Rango temporal
    const from = this.parseDate(dto.fechaFrom);
    const to = this.parseDate(dto.fechaTo);
    if (from) qb.andWhere('r.fechaHoraReporte >= :from', { from });
    if (to) qb.andWhere('r.fechaHoraReporte <= :to', { to });
    if (from && to && from > to)
      throw new BadRequestException('fechaFrom > fechaTo');

    // Filtro geográfico (Haversine en SQL). Requiere lat,lng y radiusKm.
    if (this.hasGeo(dto)) {
      const radius = dto.radiusKm ?? 5;
      qb.andWhere(
        `
        (2 * 6371 * asin(sqrt(
          power(sin(radians((u.latitud - :lat)/2)), 2) +
          cos(radians(:lat)) * cos(radians(u.latitud)) *
          power(sin(radians((u.longitud - :lng)/2)), 2)
        ))) <= :radiusKm
      `,
        { lat: dto.lat, lng: dto.lng, radiusKm: radius },
      );
    }

    // Orden
    const sort = this.resolveSort(dto.sortBy);
    qb.addOrderBy(sort.column, sort.direction);

    // Sin paginación: devuelve todos los match
    return qb.getMany();
  }

  // Helpers
  private parseDate(v?: string): Date | undefined {
    if (!v) return undefined;
    const d = new Date(v);
    if (isNaN(d.getTime())) throw new BadRequestException('Fecha inválida');
    return d;
  }

  private hasGeo(dto: SearchReportRequestDto): boolean {
    return (
      dto.lat != null &&
      dto.lng != null &&
      (dto.radiusKm == null || dto.radiusKm > 0)
    );
  }

  private resolveSort(sortBy?: SearchReportRequestDto['sortBy']): {
    column: string;
    direction: 'ASC' | 'DESC';
  } {
    const map: Record<string, { col: string; dir: 'ASC' | 'DESC' }> = {
      fechaHoraReporte: { col: 'r.fechaHoraReporte', dir: 'ASC' },
      '-fechaHoraReporte': { col: 'r.fechaHoraReporte', dir: 'DESC' },
      gravedad: { col: 'r.gravedad', dir: 'ASC' },
      '-gravedad': { col: 'r.gravedad', dir: 'DESC' },
      id: { col: 'r.id', dir: 'ASC' },
      '-id': { col: 'r.id', dir: 'DESC' },
    };
    return map[sortBy ?? '-fechaHoraReporte'] ?? map['-fechaHoraReporte'];
  }
}
