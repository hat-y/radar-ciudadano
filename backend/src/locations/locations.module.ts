import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service';
import { Location } from './entities/location.entity';
import { Neighborhood } from './entities/neighborhood.entity';
import { NeighborhoodsService } from './neighborhoods.service';
import { NeighborhoodsController } from './neighborhoods.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Neighborhood])],
  controllers: [NeighborhoodsController],
  providers: [LocationsService, NeighborhoodsService],
  exports: [LocationsService, NeighborhoodsService, TypeOrmModule],
})
export class LocationsModule {}
