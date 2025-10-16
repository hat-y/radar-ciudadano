// Modulos Externos
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Sse,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

// Modulos Internos
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsStream } from './event.stream';
import { GeospatialService } from './geospatial.service';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly streamService: ReportsStream,
    private readonly geospatialService: GeospatialService,
  ) {}

  @Post()
  create(@Body() dto: CreateReportDto) {
    return this.reportsService.create(dto);
  }

  @Sse('stream')
  stream(): Observable<MessageEvent> {
    return this.streamService
      .asObservable()
      .pipe(map((data) => ({ data }) as MessageEvent));
  }

  @Get('nearby')
  findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius = 5, // km
  ) {
    return this.reportsService.findNearby(+lat, +lng, +radius);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(+id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }

  @Get('neighborhoods/list')
  getNeighborhoods() {
    return {
      neighborhoods: this.geospatialService.getAllNeighborhoods(),
      total: this.geospatialService.getAllNeighborhoods().length,
    };
  }
}
