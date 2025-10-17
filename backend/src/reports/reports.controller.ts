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
  UseInterceptors,
  UploadedFiles,
  ParseFilePipeBuilder,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { map, Observable } from 'rxjs';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

// Modulos Internos
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsStream } from './event.stream';
import { GeospatialService } from './geospatial.service';
import { multerOptions } from '../config/multer.config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Post(':id/evidences')
  @UseInterceptors(FilesInterceptor('evidences', 10, multerOptions))
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Sube una o más evidencias para un reporte' })
  @ApiResponse({
    status: 201,
    description: 'Evidencias subidas exitosamente',
  })
  uploadEvidences(
    @Param('id') reportId: string,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|gif|mp4|mov|avi)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 20, // 20MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
  ) {
    return this.reportsService.addEvidences(+reportId, files);
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
  async getNeighborhoods() {
    const neighborhoods = await this.geospatialService.getAllNeighborhoods();
    return {
      neighborhoods,
      total: neighborhoods.length,
    };
  }
}
