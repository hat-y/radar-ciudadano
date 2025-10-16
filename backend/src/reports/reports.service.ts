// Modulos Externos
import { Injectable } from '@nestjs/common';

// Modulos Internos
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsStream } from './event.stream';
import { GeospatialService } from './geospatial.service';
import { NotificationService } from './notification.service';

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

  findAll() {
    return this.reports;
  }

  findOne(id: number) {
    return this.reports.find((report) => report.id === id);
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
}
