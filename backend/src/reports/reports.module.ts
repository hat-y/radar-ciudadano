// Modulos Externos
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Modulos Internos
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportsStream } from './event.stream';
import { GeospatialService } from './geospatial.service';
import { NotificationService } from './notification.service';
import { Report } from './entities/report.entity';
import { Evidence } from './entities/evidence.entity';
import { NeighborhoodSubscription } from '../users/entities/neighborhood-subscription.entity';
import { EmailModule } from '../email/email.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Evidence, NeighborhoodSubscription]),
    EmailModule,
    LocationsModule,
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsStream,
    GeospatialService,
    NotificationService,
  ],
  exports: [ReportsService, GeospatialService],
})
export class ReportsModule {}
