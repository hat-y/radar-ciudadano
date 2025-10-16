import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateReportDto {
  @IsNumber() lat: number;
  @IsNumber()
  lng: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;
}
