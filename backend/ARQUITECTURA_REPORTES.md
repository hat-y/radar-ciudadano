# 🏗️ Arquitectura de Reportes - Diseño Evolutivo

## 🎯 Estrategia: Empezar Simple, Crecer Inteligente

### **Fase 1: MVP Actual** ✅ (Ya tienes esto)
```
Report: { id, lat, lng, description, category, status }
```

### **Fase 2: Modelo Robusto** 🚀 (Siguiente paso)
```
Report: { id, title, description, status, severity, userId, categoryId }
Location: { id, lat, lng, address, neighborhood, geoHash }
Evidence: { id, reportId, type, url, metadata }
```

### **Fase 3: Geo-Escalable** 🌍 (Futuro)
```
Location: { id, geom (PostGIS), address, ... }
+ Índices espaciales GIST
+ Búsquedas por radio optimizadas
```

---

## 📊 **Trade-offs Analizados**

| Decisión | Por qué SÍ | Por qué NO | Mi elección |
|----------|------------|------------|-------------|
| **Normalizar Ubicación** | Reuso, datos limpios | Join extra, más complejo | ✅ SÍ (pero desnormalizar lat/lng) |
| **Entidad Evidencia** | Múltiples archivos, auditoría | Overhead para reportes simples | ✅ SÍ (nullable) |
| **PostGIS desde inicio** | Búsquedas geo rápidas | Dependencia extra, curva aprendizaje | ❌ NO (empezar con decimales) |
| **Enums en DB** | Validación DB, integridad | Migraciones al cambiar | ✅ SÍ (para status, severity) |
| **Soft delete** | Auditoría, recuperación | Consultas más complejas | ✅ SÍ (deletedAt nullable) |

---

## 🏛️ **Arquitectura Propuesta (Híbrida)**

### **Modelo de Datos**

```
┌─────────────────┐       ┌──────────────────┐
│     Report      │──────>│    Location      │
├─────────────────┤       ├──────────────────┤
│ id              │       │ id               │
│ title           │       │ lat (decimal)    │
│ description     │       │ lng (decimal)    │
│ lat  ←──────────┼───────┼──────────────────┤ DESNORMALIZADO
│ lng  ←──────────┘       │ address          │
│ status (enum)   │       │ neighborhoodName │
│ severity (enum) │       │ geoHash (índice) │
│ userId          │       │ rawGeoData (JSON)│
│ categoryId      │       └──────────────────┘
│ locationId (FK) │
│ viewCount       │       ┌──────────────────┐
│ upvotes         │       │    Evidence      │
│ createdAt       │<──────┤──────────────────┤
│ updatedAt       │       │ id               │
│ deletedAt       │       │ reportId (FK)    │
└─────────────────┘       │ type (enum)      │
                          │ url              │
                          │ thumbnailUrl     │
                          │ fileSize         │
                          │ mimeType         │
                          │ metadata (JSON)  │
                          │ uploadedAt       │
                          └──────────────────┘

┌──────────────┐    ┌─────────────────┐
│  Category    │    │   ReportStatus  │
├──────────────┤    ├─────────────────┤
│ id           │    │ reportId        │
│ name         │    │ status          │
│ icon         │    │ comment         │
│ color        │    │ changedBy       │
└──────────────┘    │ changedAt       │
                    └─────────────────┘
```

### **¿Por qué esta arquitectura?**

1. **Lat/Lng desnormalizado en Report**: Lecturas rápidas sin JOIN
2. **FK a Location**: Mantener datos geo completos para auditoría
3. **Evidence separado**: Múltiples fotos/videos por reporte
4. **Enums para Status/Severity**: Validación y consistencia
5. **Soft delete**: No perder datos históricos
6. **geoHash en Location**: Búsquedas espaciales sin PostGIS (por ahora)

---

## 🛠️ **Implementación Paso a Paso**

### **Paso 1: Crear módulo locations**
```bash
cd backend
nest g module locations
nest g service locations
```

### **Paso 2: Definir entidades**

#### **location.entity.ts**
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Report } from '../reports/entities/report.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal', { precision: 9, scale: 6 })
  lat!: number;

  @Column('decimal', { precision: 9, scale: 6 })
  lng!: number;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  neighborhoodName?: string;

  @Column({ nullable: true })
  localidad?: string;

  @Column({ nullable: true })
  provincia?: string;

  @Column({ nullable: true })
  departamento?: string;

  // GeoHash para búsquedas espaciales sin PostGIS
  @Column({ length: 12, nullable: true })
  @Index()
  geoHash?: string;

  // Datos raw del GeoJSON para referencia
  @Column('jsonb', { nullable: true })
  rawGeoData?: any;

  @CreateDateColumn()
  createdAt!: Date;

  // Relaciones
  @OneToMany(() => Report, report => report.location)
  reports!: Report[];
}
```

#### **evidence.entity.ts**
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Report } from './report.entity';

export enum EvidenceType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

@Entity('evidences')
export class Evidence {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  reportId!: number;

  @ManyToOne(() => Report, report => report.evidences, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reportId' })
  report!: Report;

  @Column({
    type: 'enum',
    enum: EvidenceType,
    default: EvidenceType.IMAGE,
  })
  type!: EvidenceType;

  @Column()
  url!: string; // S3, Cloudinary, o local /uploads/

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  fileSize?: number; // bytes

  @Column({ nullable: true })
  mimeType?: string;

  @Column('jsonb', { nullable: true })
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    originalName?: string;
  };

  @CreateDateColumn()
  uploadedAt!: Date;
}
```

#### **report.entity.ts** (mejorado)
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Location } from '../../locations/entities/location.entity';
import { Evidence } from './evidence.entity';

export enum ReportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export enum ReportSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('reports')
@Index(['lat', 'lng']) // Búsquedas geoespaciales
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  // Lat/Lng desnormalizado para queries rápidas
  @Column('decimal', { precision: 9, scale: 6 })
  @Index()
  lat!: number;

  @Column('decimal', { precision: 9, scale: 6 })
  @Index()
  lng!: number;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  @Index()
  status!: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportSeverity,
    default: ReportSeverity.MEDIUM,
  })
  severity!: ReportSeverity;

  @Column({ nullable: true })
  category?: string;

  @Column({ default: 0 })
  viewCount!: number;

  @Column({ default: 0 })
  upvotes!: number;

  // FK a Location (normalizado)
  @Column({ nullable: true })
  @Index()
  locationId?: number;

  @ManyToOne(() => Location, location => location.reports, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'locationId' })
  location?: Location;

  // FK a User (opcional para MVP)
  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  // Relación con evidencias
  @OneToMany(() => Evidence, evidence => evidence.report, {
    cascade: true,
    eager: false,
  })
  evidences!: Evidence[];

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date; // Soft delete
}
```

---

## 📦 **Servicios y Lógica**

### **locations.service.ts**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as geohash from 'ngeohash';
import { Location } from './entities/location.entity';
import { GeospatialService } from '../reports/geospatial.service';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepo: Repository<Location>,
    private geospatialService: GeospatialService,
  ) {}

  async findOrCreateLocation(lat: number, lng: number): Promise<Location> {
    // Buscar ubicación existente cercana (radio 50m)
    const geoHash = this.calculateGeoHash(lat, lng);
    const prefix = geoHash.substring(0, 7); // ~150m precision

    const existing = await this.locationRepo
      .createQueryBuilder('location')
      .where('location.geoHash LIKE :prefix', { prefix: `${prefix}%` })
      .getOne();

    if (existing) return existing;

    // Crear nueva
    const neighborhood = this.geospatialService.findNearestNeighborhood(
      lat,
      lng,
    );

    return this.locationRepo.save({
      lat,
      lng,
      neighborhoodName: neighborhood?.nombre_barrio,
      localidad: neighborhood?.localidad,
      provincia: neighborhood?.provincia,
      departamento: neighborhood?.departamento,
      geoHash,
      rawGeoData: neighborhood,
    });
  }

  private calculateGeoHash(lat: number, lng: number): string {
    return geohash.encode(lat, lng, 9);
  }

  async findNearby(lat: number, lng: number, radiusKm: number) {
    // GeoHash bounding boxes para búsqueda rápida
    const bounds = geohash.bboxes(lat, lng, radiusKm);

    return this.locationRepo
      .createQueryBuilder('location')
      .where('location.geoHash IN (:...hashes)', { hashes: bounds })
      .getMany();
  }
}
```

---

## ⚠️ **Lo que NO estás viendo (y deberías considerar)**

### 1. **Almacenamiento de archivos**
```typescript
// Estructura de carpetas
// uploads/
//   reports/
//     {reportId}/
//       {evidenceId}-original.jpg
//       {evidenceId}-thumbnail.jpg

// Configuración
@Post('upload')
@UseInterceptors(
  FilesInterceptor('files', 5, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const reportId = req.params.id;
        const dir = `./uploads/reports/${reportId}`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${unique}-${file.originalname}`);
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'video/mp4',
      ];
      cb(null, allowedTypes.includes(file.mimetype));
    },
  }),
)
```

### 2. **Validaciones de DTO**
```typescript
// create-report.dto.ts
export class CreateReportDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsEnum(ReportSeverity)
  severity?: ReportSeverity;

  @IsOptional()
  @IsString()
  category?: string;
}
```

### 3. **Auditoría de cambios**
```typescript
@Entity('report_history')
export class ReportHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reportId: number;

  @Column()
  field: string; // 'status', 'severity', etc.

  @Column('text')
  oldValue: string;

  @Column('text')
  newValue: string;

  @Column()
  changedBy: string; // userId

  @CreateDateColumn()
  changedAt: Date;
}

// En el servicio
async updateStatus(id: number, newStatus: ReportStatus, userId: string) {
  const report = await this.findOne(id);
  
  // Guardar historial
  await this.historyRepo.save({
    reportId: id,
    field: 'status',
    oldValue: report.status,
    newValue: newStatus,
    changedBy: userId,
  });

  report.status = newStatus;
  return this.reportRepo.save(report);
}
```

### 4. **Rate limiting**
```typescript
// main.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10, // 10 requests per minute
    }),
  ],
})

// reports.controller.ts
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 reportes por minuto
@Post()
create(@Body() dto: CreateReportDto) {
  return this.reportsService.create(dto);
}
```

### 5. **Thumbnails automáticos**
```typescript
import * as sharp from 'sharp';

async createThumbnail(file: Express.Multer.File): Promise<string> {
  const thumbnailPath = file.path.replace(
    path.extname(file.filename),
    '-thumb.jpg',
  );

  await sharp(file.path)
    .resize(300, 300, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);

  return thumbnailPath;
}
```

### 6. **Políticas de retención**
```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CleanupService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupDeletedReports() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Hard delete reportes borrados hace más de 30 días
    await this.reportRepo
      .createQueryBuilder()
      .delete()
      .where('deletedAt < :date', { date: thirtyDaysAgo })
      .execute();

    this.logger.log('Cleanup completed: old soft-deleted reports removed');
  }

  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOrphanedFiles() {
    // Buscar archivos en /uploads sin registro en DB
    const allFiles = fs.readdirSync('./uploads/reports');
    const dbFiles = await this.evidenceRepo.find({ select: ['url'] });
    
    const orphans = allFiles.filter(f => !dbFiles.some(db => db.url.includes(f)));
    
    orphans.forEach(file => fs.unlinkSync(`./uploads/reports/${file}`));
    
    this.logger.log(`Cleanup completed: ${orphans.length} orphaned files removed`);
  }
}
```

---

## 🎯 **Plan de Implementación**

### **Fase 1: Fundación (Semana 1)** 
✅ Crear módulo `locations`  
✅ Implementar entidades: `Location`, `Evidence`, `Report` mejorado  
✅ Migración de datos existentes  
✅ Actualizar DTOs con validaciones  
✅ Soft delete en Report  

### **Fase 2: Features (Semana 2-3)**
✅ Upload de múltiples evidencias  
✅ GeoHash para búsquedas espaciales  
✅ Thumbnails automáticos  
✅ Rate limiting  
✅ Validación de tipos de archivo  

### **Fase 3: Optimización (Semana 4)**
✅ Índices optimizados  
✅ Caching con Redis  
✅ Paginación en listados  
✅ Búsquedas por filtros avanzados  

### **Fase 4: Auditoría (Mes 2)**
✅ Historial de cambios  
✅ Políticas de retención  
✅ Cleanup automático  
✅ Logs estructurados  

### **Fase 5: Escalabilidad (Mes 3+)**
✅ Migrar a PostGIS  
✅ Almacenamiento en S3  
✅ CDN para media  
✅ Full-text search  
✅ Analytics dashboard  

---

## 🚀 **Próximos Pasos**

1. **Instalar dependencias**:
```bash
npm install ngeohash sharp @nestjs/throttler
```

2. **Generar módulos**:
```bash
nest g module locations
nest g service locations
```

3. **Crear entidades** siguiendo el modelo arriba

4. **Generar migración**:
```bash
npm run typeorm migration:generate -- -n AddLocationAndEvidence
npm run typeorm migration:run
```

5. **Actualizar servicios** con la nueva lógica

---

¿Quieres que empiece a implementar alguna fase específica?
