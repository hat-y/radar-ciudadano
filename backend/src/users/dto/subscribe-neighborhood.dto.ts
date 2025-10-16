import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class SubscribeToNeighborhoodDto {
  @IsString()
  neighborhoodName!: string;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;
}
