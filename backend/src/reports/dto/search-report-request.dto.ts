import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  IsIn,
} from 'class-validator';

export enum Gravedad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

export class SearchReportRequestDto {
  @IsOptional()
  @IsString()
  q?: string;

  // Filtros directos
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @IsEnum(Gravedad)
  gravedad?: Gravedad;

  // Rango temporal (epoch ms o ISO; parsea en el service)
  @IsOptional()
  @IsString()
  fechaFrom?: string; // ISO o epoch string

  @IsOptional()
  @IsString()
  fechaTo?: string; // ISO o epoch string

  // Filtro geográfico simple
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(50)
  radiusKm?: number; // default lógico: 5 si no viene

  // Orden (opcional, sin paginar)
  @IsOptional()
  @IsString()
  @IsIn([
    'fechaHoraReporte',
    '-fechaHoraReporte',
    'gravedad',
    '-gravedad',
    'id',
    '-id',
  ])
  sortBy?:
    | 'fechaHoraReporte'
    | '-fechaHoraReporte'
    | 'gravedad'
    | '-gravedad'
    | 'id'
    | '-id';
}
