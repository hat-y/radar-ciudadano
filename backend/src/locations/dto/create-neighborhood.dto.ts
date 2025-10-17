import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Clase helper para validar coordenadas [lng, lat]
 */
class CoordinatePair {
  @IsNumber()
  @IsNotEmpty()
  lng!: number;

  @IsNumber()
  @IsNotEmpty()
  lat!: number;
}

/**
 * DTO para crear un nuevo barrio con su polígono
 */
export class CreateNeighborhoodDto {
  @ApiProperty({
    description: 'Nombre del barrio (único)',
    example: 'Centro',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Polígono del barrio como array de coordenadas [lng, lat]',
    example: [
      [-58.1772, -26.1853],
      [-58.1753, -26.1856],
      [-58.1740, -26.1848],
      [-58.1772, -26.1853], // Primer punto se repite al final
    ],
  })
  @IsArray()
  @ArrayMinSize(3, { message: 'El polígono debe tener al menos 3 coordenadas' })
  @IsNotEmpty()
  polygon!: number[][];

  @ApiPropertyOptional({
    description: 'Provincia donde se encuentra el barrio',
    example: 'Formosa',
  })
  @IsString()
  @IsOptional()
  provincia?: string;

  @ApiPropertyOptional({
    description: 'Departamento donde se encuentra el barrio',
    example: 'Formosa',
  })
  @IsString()
  @IsOptional()
  departamento?: string;

  @ApiPropertyOptional({
    description: 'Localidad donde se encuentra el barrio',
    example: 'Formosa',
  })
  @IsString()
  @IsOptional()
  localidad?: string;

  @ApiPropertyOptional({
    description: 'Metadata adicional del barrio (área, población, descripción, etc.)',
    example: {
      area: 2.5,
      population: 15000,
      description: 'Barrio céntrico de Formosa Capital',
    },
  })
  @IsObject()
  @IsOptional()
  metadata?: {
    area?: number;
    population?: number;
    description?: string;
    [key: string]: any;
  };
}
