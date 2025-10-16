// Modulos Externos
import { Injectable } from '@nestjs/common';

// Modulos Internos
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  private reports: any[] = [];

  create(dto: CreateReportDto) {
    const report = {
      id: this.reports.length + 1,
      ...dto,
      createdAt: new Date(),
    };
    this.reports.push(report);
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
      return this.reports[index];
    }
    return null;
  }

  remove(id: number) {
    const index = this.reports.findIndex((report) => report.id === id);
    if (index !== -1) {
      const removed = this.reports.splice(index, 1);
      return removed[0];
    }
    return null;
  }
}
