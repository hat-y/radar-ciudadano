# Entidades Implementadas - Sistema de Reportes

## 📋 Resumen

Se han implementado las 3 entidades principales del sistema de reportes según el documento de arquitectura:

1. **Report** - Reporte principal (actualizado)
2. **Location** - Ubicación normalizada (nuevo)
3. **Evidence** - Evidencias/archivos adjuntos (nuevo)

---

## 🗂️ Entidad: Report

**Archivo:** `backend/src/reports/entities/report.entity.ts`

### Campos Principales

```typescript
id: number                    // PK, auto-incremento
title?: string                // Título opcional
description: string           // Descripción del reporte
lat: number                   // Latitud (desnormalizado para queries rápidas)
lng: number                   // Longitud (desnormalizado)
status: ReportStatus          // pending | in_progress | resolved | rejected
severity: ReportSeverity      // low | medium | high | urgent
category?: string             // Categoría del reporte
neighborhoodName?: string     // Nombre del barrio
localidad?: string            // Localidad
provincia?: string            // Provincia
departamento?: string         // Departamento
viewCount: number             // Contador de vistas
upvotes: number               // Votos positivos
locationId?: number           // FK a Location (normalizado)
userId?: string               // FK a User (opcional)
createdAt: Date               // Timestamp de creación
updatedAt: Date               // Timestamp de actualización
deletedAt?: Date              // Soft delete
```

### Relaciones

- **ManyToOne → Location**: Relación opcional a ubicación normalizada
- **ManyToOne → User**: Usuario que creó el reporte (opcional)
- **OneToMany → Evidence**: Múltiples evidencias adjuntas

### Índices

- `@Index(['lat', 'lng'])` - Búsquedas geoespaciales rápidas
- `@Index()` en `status` - Filtros por estado
- `@Index()` en `locationId` - Joins con Location
- `@Index()` en `createdAt` - Ordenamiento temporal

### Estrategia de Datos

✅ **Desnormalización parcial**: Mantiene `lat/lng` en Report para queries geoespaciales rápidas
✅ **Normalización**: También referencia a `Location` para datos completos
✅ **Soft Delete**: Campo `deletedAt` para recuperación de datos

---

## 📍 Entidad: Location

**Archivo:** `backend/src/locations/entities/location.entity.ts`

### Campos Principales

```typescript
id: number                    // PK, auto-incremento
latitude: number              // Decimal(9,6) - Precisión ±0.11m
longitude: number             // Decimal(9,6) - Precisión ±0.11m
geoHash?: string              // varchar(12) - Índice geoespacial
address?: string              // Dirección completa (opcional)
neighborhoodName?: string     // Nombre del barrio
localidad?: string            // Localidad
provincia?: string            // Provincia
departamento?: string         // Departamento
createdAt: Date               // Timestamp de creación
updatedAt: Date               // Timestamp de actualización
```

### Relaciones

- **OneToMany → Report**: Múltiples reportes pueden compartir la misma ubicación

### Índices

- `@Index(['latitude', 'longitude'])` - Búsquedas por coordenadas exactas
- `@Index()` en `geoHash` - Búsquedas geoespaciales optimizadas con ngeohash

### Ventajas

✅ **Normalización**: Reduce duplicación de datos geográficos
✅ **GeoHash**: Permite búsquedas eficientes por proximidad
✅ **Reutilizable**: Múltiples reportes pueden usar la misma ubicación exacta

---

## 📷 Entidad: Evidence

**Archivo:** `backend/src/reports/entities/evidence.entity.ts`

### Campos Principales

```typescript
id: number                    // PK, auto-incremento
reportId: number              // FK a Report (requerido)
type: EvidenceType            // PHOTO | VIDEO | DOCUMENT | AUDIO | OTHER
fileUrl: string               // URL del archivo almacenado
mimeType: string              // Tipo MIME (image/jpeg, video/mp4, etc.)
fileSize: number              // Tamaño en bytes
description?: string          // Descripción opcional
uploadedAt: Date              // Timestamp de subida
```

### Enum: EvidenceType

```typescript
enum EvidenceType {
  PHOTO = 'photo',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  OTHER = 'other',
}
```

### Relaciones

- **ManyToOne → Report**: Cada evidencia pertenece a un reporte
  - `onDelete: 'CASCADE'` - Si se elimina el reporte, se eliminan sus evidencias

### Casos de Uso

- 📸 Fotos de incidentes
- 🎥 Videos documentales
- 📄 Documentos de respaldo
- 🎤 Grabaciones de audio
- 🔗 Otros tipos de archivos

---

## 🔗 Diagrama de Relaciones

```
┌────────────────┐
│     User       │
│ (existente)    │
└────────┬───────┘
         │ 1:N (opcional)
         ▼
┌─────────────────────┐
│      Report         │◄────────┐
│  - lat/lng (denorm) │         │
│  - locationId (FK)  │         │
│  - userId (FK)      │         │
└──────┬──────┬───────┘         │
       │      │                 │
       │ 1:N  │ N:1             │
       │      └─────────────────┘
       │                        │
       ▼                        │
┌────────────────┐       ┌──────────────┐
│   Evidence     │       │   Location   │
│  - reportId    │       │ - lat/lng    │
│  - type        │       │ - geoHash    │
│  - fileUrl     │       │ - address    │
└────────────────┘       └──────────────┘
```

---

## 🚀 Próximos Pasos

### 1. Crear DTOs

```bash
# En backend/src/locations/dto/
- create-location.dto.ts
- update-location.dto.ts

# En backend/src/reports/dto/
- create-evidence.dto.ts (ya existe create-report.dto)
```

### 2. Generar Migraciones

```bash
cd backend
npm run typeorm:generate CreateLocationTable
npm run typeorm:generate CreateEvidenceTable
npm run typeorm:generate UpdateReportAddLocation
npm run typeorm:run
```

### 3. Actualizar ReportsService

- Crear/reutilizar Location al crear Report
- Agregar soporte para evidencias
- Implementar queries geoespaciales con geoHash

### 4. Endpoints para Evidencias

```typescript
POST   /reports/:id/evidence     # Subir archivo
GET    /reports/:id/evidence     # Listar evidencias
DELETE /reports/:id/evidence/:id # Eliminar evidencia
```

### 5. Integrar ngeohash

```typescript
import * as ngeohash from 'ngeohash';

// Al crear Location
const geoHash = ngeohash.encode(latitude, longitude, 12);

// Búsqueda por proximidad
const neighbors = ngeohash.neighbors(geoHash);
```

---

## 📦 Módulos Actualizados

### ReportsModule
```typescript
imports: [
  TypeOrmModule.forFeature([Report, Evidence, NeighborhoodSubscription]),
  EmailModule,
  LocationsModule, // ← Nuevo
]
```

### LocationsModule (Nuevo)
```typescript
imports: [TypeOrmModule.forFeature([Location])],
providers: [LocationsService],
exports: [LocationsService, TypeOrmModule],
```

---

## 🎯 Características Implementadas

✅ Entidad Report con campos adicionales (title, severity, viewCount, upvotes)
✅ Entidad Location con normalización de coordenadas
✅ Entidad Evidence con soporte multi-tipo
✅ Relaciones bidireccionales configuradas
✅ Índices optimizados para queries geoespaciales
✅ Soft delete en Report
✅ Cascade delete en Evidence
✅ Integración con ngeohash instalado
✅ TypeORM configurado correctamente
✅ Sin errores de compilación

---

## 📊 Estrategia de Datos

### Fase 1 (Actual): Normalización
- Location como entidad separada
- Report referencia a Location via FK
- Reduce duplicación de datos geográficos

### Fase 2 (Futura): Optimización
- Mantener lat/lng desnormalizado en Report para queries rápidas
- Location para datos completos y reutilización
- Usar geoHash para búsquedas por proximidad

### Trade-offs
- **Normalización**: Menos duplicación, más joins
- **Desnormalización**: Queries más rápidas, más espacio
- **Solución híbrida**: Combina ambos enfoques

---

**Fecha de implementación:** 2025-01-XX
**Estado:** ✅ Entidades creadas y validadas
**Próximo paso:** Crear DTOs y migraciones
