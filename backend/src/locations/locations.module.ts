import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service';
import { Location } from './entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  providers: [LocationsService],
  exports: [LocationsService, TypeOrmModule],
})
export class LocationsModule {}
