import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { EvidenceType } from '../entities/evidence.entity';

export class CreateEvidenceDto {
  @IsNumber()
  reportId: number;

  @IsEnum(EvidenceType)
  type: EvidenceType;

  @IsString()
  fileUrl: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  @Min(0)
  fileSize: number;

  @IsString()
  @IsOptional()
  description?: string;
}
