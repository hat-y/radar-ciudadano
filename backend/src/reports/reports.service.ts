// Modulos Externos
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Modulos Internos
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsStream } from './event.stream';
import { GeospatialService } from './geospatial.service';
import { NotificationService } from './notification.service';
import {
  Report,
  ReportStatus,
  ReportSeverity,
  CrimeType,
} from './entities/report.entity';
import { Location } from '../locations/entities/location.entity';
import * as ngeohash from 'ngeohash';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    private readonly streamService: ReportsStream,
    private readonly geospatialService: GeospatialService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Determina la severidad según el tipo de delito
   */
  private determineSeverity(crimeType: CrimeType): ReportSeverity {
    const criticalCrimes = [
      CrimeType.ASESINATO,
      CrimeType.SECUESTRO,
      CrimeType.ABUSO_SEXUAL,
    ];

    const highCrimes = [
      CrimeType.ROBO,
      CrimeType.ROBO_VEHICULO,
      CrimeType.ROBO_DOMICILIO,
      CrimeType.LESIONES,
      CrimeType.VIOLENCIA_GENERO,
      CrimeType.NARCOTRAFICO,
      CrimeType.EXTORSION,
    ];

    const mediumCrimes = [
      CrimeType.HURTO,
      CrimeType.AMENAZAS,
      CrimeType.VANDALISMO,
      CrimeType.TRAFICO_ARMAS,
      CrimeType.CORRUPCION,
    ];

    if (criticalCrimes.includes(crimeType)) {
      return ReportSeverity.CRITICA;
    } else if (highCrimes.includes(crimeType)) {
      return ReportSeverity.ALTA;
    } else if (mediumCrimes.includes(crimeType)) {
      return ReportSeverity.MEDIA;
    } else {
      return ReportSeverity.BAJA;
    }
  }

  async create(dto: CreateReportDto): Promise<Report> {
    // 1. Encontrar el barrio basado en las coordenadas
    const neighborhood = this.geospatialService.findNearestNeighborhood(
      dto.lat,
      dto.lng,
    );

    // 2. Determinar severidad automáticamente si no se especificó
    const severity = dto.severity || this.determineSeverity(dto.crimeType);

    // 3. Buscar o crear Location
    const geoHash = ngeohash.encode(dto.lat, dto.lng, 12);

    let location = await this.locationRepo.findOne({
      where: { geoHash },
    });

    if (!location) {
      location = this.locationRepo.create({
        lat: dto.lat,
        lng: dto.lng,
        geoHash,
        neighborhoodName: neighborhood?.nombre_barrio,
        localidad: neighborhood?.localidad,
        provincia: neighborhood?.provincia,
        departamento: neighborhood?.departamento,
      });
      location = await this.locationRepo.save(location);
    }

    // 4. Crear Report vinculado a Location
    const report = this.reportRepo.create({
      ...dto,
      severity,
      locationId: location.id,
      neighborhoodName: neighborhood?.nombre_barrio,
      localidad: neighborhood?.localidad,
      provincia: neighborhood?.provincia,
      departamento: neighborhood?.departamento,
      status: ReportStatus.PENDING,
    });

    const savedReport = await this.reportRepo.save(report);

    // 5. Emitir evento SSE cuando se crea un reporte
    this.streamService.emitCreated(savedReport);

    // 6. Notificar a usuarios suscritos al barrio (async, no bloquear la respuesta)
    if (savedReport.neighborhoodName) {
      this.notificationService
        .notifyNeighborhoodSubscribers(savedReport)
        .catch((err) => console.error('Failed to send notifications:', err));
    }

    return savedReport;
  }

  async findAll(): Promise<Report[]> {
    return this.reportRepo.find({
      relations: ['location', 'evidences'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Report> {
    const report = await this.reportRepo.findOne({
      where: { id },
      relations: ['location', 'evidences'],
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  /**
   * Buscar reportes por radio usando Haversine
   */
  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number = 5,
  ): Promise<Report[]> {
    const reports = await this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.location', 'location')
      .where(
        `(
          2 * 6371 * asin(sqrt(
            power(sin(radians((report.lat - :lat)/2)), 2) +
            cos(radians(:lat)) * cos(radians(report.lat)) *
            power(sin(radians((report.lng - :lng)/2)), 2)
          ))
        ) <= :radius`,
        { lat, lng, radius: radiusKm },
      )
      .orderBy(
        `2 * 6371 * asin(sqrt(
          power(sin(radians((report.lat - :lat)/2)), 2) +
          cos(radians(:lat)) * cos(radians(report.lat)) *
          power(sin(radians((report.lng - :lng)/2)), 2)
        ))`,
        'ASC',
      )
      .setParameters({ lat, lng })
      .getMany();

    return reports;
  }

  async update(id: number, dto: UpdateReportDto): Promise<Report> {
    const report = await this.findOne(id);
    Object.assign(report, dto);
    const updated = await this.reportRepo.save(report);

    this.streamService.emitUpdated(updated);

    return updated;
  }

  async remove(id: number): Promise<void> {
    const report = await this.findOne(id);
    await this.reportRepo.softRemove(report);

    this.streamService.emitDeleted(id);
  }
}
