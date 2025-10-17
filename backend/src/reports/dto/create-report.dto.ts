import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { CrimeType, ReportSeverity } from '../entities/report.entity';

export class CreateReportDto {
  @IsNumber()
  @IsLatitude()
  lat: number;

  @IsNumber()
  @IsLongitude()
  lng: number;

  @IsString()
  description: string;

  @IsEnum(CrimeType)
  crimeType: CrimeType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(ReportSeverity)
  severity?: ReportSeverity;

  @IsOptional()
  @IsString()
  category?: string; // Deprecated, mantener compatibilidad
}
