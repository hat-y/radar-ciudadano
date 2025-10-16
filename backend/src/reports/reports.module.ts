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
import { NeighborhoodSubscription } from '../users/entities/neighborhood-subscription.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, NeighborhoodSubscription]),
    EmailModule,
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
