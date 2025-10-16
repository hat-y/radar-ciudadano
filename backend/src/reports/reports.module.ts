// Modulos Externos
import { Module } from '@nestjs/common';

// Modulos Internos
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
