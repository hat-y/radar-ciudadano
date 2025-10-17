import { PartialType } from '@nestjs/swagger';
import { CreateNeighborhoodDto } from './create-neighborhood.dto';

/**
 * DTO para actualizar un barrio existente
 * Todos los campos son opcionales
 */
export class UpdateNeighborhoodDto extends PartialType(CreateNeighborhoodDto) {}
