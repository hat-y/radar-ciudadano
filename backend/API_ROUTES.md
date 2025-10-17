# 📡 API Routes - Radar Ciudadano

**Base URL:** `http://localhost:3000`  
**Swagger Docs:** `http://localhost:3000/api/docs`

---

## 📑 Índice

1. [🔐 Authentication (Auth)](#-authentication-auth)
2. [👥 Users](#-users)
3. [📍 Reports](#-reports)
4. [🗺️ Neighborhoods](#-neighborhoods)
5. [❤️ Health Check](#-health-check)
6. [📊 Enums y Tipos](#-enums-y-tipos)

---

## 🔐 Authentication (Auth)

### 1. Solicitar Magic Link

Envía un enlace mágico por email para iniciar sesión sin contraseña.

```http
POST /auth/request-login
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (200):**
```json
{
  "message": "Link enviado. Revisa tu email para iniciar sesión."
}
```

**Notas:**
- Si el usuario no existe, se crea automáticamente
- El token expira en **15 minutos**
- El email contiene un link tipo: `http://frontend.com/auth/verify?token=xxxxx`

---

### 2. Verificar Magic Link

Verifica el token del magic link y retorna un JWT para autenticación.

```http
GET /auth/verify-login?token={token}
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `token` | string | ✅ | Token único recibido por email |

**Response (200):**
```json
{
  "user": {
    "id": "uuid-1234-5678",
    "email": "usuario@ejemplo.com",
    "username": "anomalousUser123",
    "emailVerified": true,
    "role": "USER",
    "createdAt": "2025-10-17T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notas:**
- El token solo puede usarse **una vez**
- El JWT expira en **7 días**
- En el primer login exitoso, el email se marca como verificado

---

## 👥 Users

### 1. Listar Todos los Usuarios

```http
GET /users
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Permisos:** Solo `JEFATURA`

**Response (200):**
```json
[
  {
    "id": "uuid-1234",
    "email": "user@example.com",
    "username": "user123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "USER",
    "emailVerified": true,
    "createdAt": "2025-10-17T10:00:00.000Z"
  }
]
```

---

### 2. Obtener Usuario por ID

```http
GET /users/{id}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Permisos:** `JEFATURA`

**Response (200):**
```json
{
  "id": "uuid-1234",
  "email": "user@example.com",
  "username": "user123",
  "role": "USER",
  "emailVerified": true
}
```

---

### 3. Crear Usuario

```http
POST /users
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Permisos:** Solo `JEFATURA`

**Body:**
```json
{
  "email": "nuevo@example.com",
  "password": "password123",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Response (201):**
```json
{
  "id": "uuid-5678",
  "email": "nuevo@example.com",
  "username": "generatedUsername789",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "USER",
  "emailVerified": false
}
```

---

### 4. Actualizar Usuario

```http
PATCH /users/{id}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Permisos:** Solo `JEFATURA`

**Body (todos opcionales):**
```json
{
  "email": "updated@example.com",
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "role": "MODERADOR"
}
```

**Response (200):**
```json
{
  "id": "uuid-1234",
  "email": "updated@example.com",
  "firstName": "Juan Carlos",
  "lastName": "Pérez García",
  "role": "MODERADOR"
}
```

---

### 5. Eliminar Usuario (Soft Delete)

```http
DELETE /users/{id}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Permisos:** Solo `JEFATURA`

**Response (200):**
```json
{
  "id": "uuid-1234"
}
```

---

### 6. Subir Avatar

```http
POST /users/{id}/avatar
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: multipart/form-data
```

**Body (form-data):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `avatar` | File | Imagen (jpg, jpeg, png, gif) - Max 5MB |

**Response (200):**
```json
{
  "message": "Avatar for user uuid-1234 uploaded successfully",
  "filename": "avatar-1634567890123.jpg",
  "path": "/uploads/avatars/avatar-1634567890123.jpg"
}
```

---

### 7. Suscribirse a Notificaciones de un Barrio

```http
POST /users/{id}/subscriptions
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Body:**
```json
{
  "neighborhoodName": "Centro",
  "emailNotifications": true,
  "pushNotifications": false
}
```

**Response (200):**
```json
{
  "id": "uuid-sub-123",
  "userId": "uuid-1234",
  "neighborhoodName": "Centro",
  "emailNotifications": true,
  "pushNotifications": false,
  "createdAt": "2025-10-17T11:00:00.000Z"
}
```

---

### 8. Obtener Suscripciones de Usuario

```http
GET /users/{id}/subscriptions
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
[
  {
    "id": "uuid-sub-123",
    "userId": "uuid-1234",
    "neighborhoodName": "Centro",
    "emailNotifications": true,
    "pushNotifications": false,
    "createdAt": "2025-10-17T11:00:00.000Z"
  },
  {
    "id": "uuid-sub-456",
    "userId": "uuid-1234",
    "neighborhoodName": "Eva Perón",
    "emailNotifications": true,
    "pushNotifications": true,
    "createdAt": "2025-10-17T12:00:00.000Z"
  }
]
```

---

### 9. Cancelar Suscripción a un Barrio

```http
DELETE /users/{userId}/subscriptions/{subscriptionId}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "message": "Suscripción cancelada exitosamente"
}
```

---

### 10. Obtener Barrios Disponibles para Suscripción

```http
GET /users/neighborhoods/available
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (200):**
```json
{
  "neighborhoods": [
    "Centro",
    "Eva Perón",
    "San Martín",
    "Virgen del Carmen",
    "Obrero"
  ],
  "total": 5
}
```

---

## 📍 Reports

### 1. Crear Reporte

Crea un nuevo reporte de incidente. Asigna automáticamente el barrio basado en coordenadas.

```http
POST /reports
```

**Body:**
```json
{
  "lat": -26.1857,
  "lng": -58.1756,
  "description": "Se observó actividad sospechosa en la esquina",
  "crimeType": "ACTIVIDAD_SOSPECHOSA",
  "title": "Actividad sospechosa en Centro",
  "severity": "MEDIA",
  "category": "Seguridad"
}
```

**Campos:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `lat` | number | ✅ | Latitud (-90 a 90) |
| `lng` | number | ✅ | Longitud (-180 a 180) |
| `description` | string | ✅ | Descripción del incidente |
| `crimeType` | enum | ✅ | Tipo de delito (ver [Enums](#crime-types)) |
| `title` | string | ❌ | Título del reporte |
| `severity` | enum | ❌ | Severidad (auto-calculada si se omite) |
| `category` | string | ❌ | Categoría adicional |

**Response (201):**
```json
{
  "id": 123,
  "lat": -26.1857,
  "lng": -58.1756,
  "description": "Se observó actividad sospechosa en la esquina",
  "crimeType": "ACTIVIDAD_SOSPECHOSA",
  "title": "Actividad sospechosa en Centro",
  "severity": "MEDIA",
  "status": "PENDING",
  "neighborhoodName": "Centro",
  "localidad": "Formosa",
  "provincia": "Formosa",
  "departamento": "Formosa",
  "createdAt": "2025-10-17T13:00:00.000Z"
}
```

**Eventos Automáticos:**
- ⚡ Se emite evento SSE en tiempo real
- 📧 Se envían emails a suscriptores del barrio
- 🗺️ Se asigna barrio automáticamente (punto-en-polígono)

---

### 2. Server-Sent Events (SSE) Stream

Conexión en tiempo real para recibir eventos de reportes.

```http
GET /reports/stream
```

**Response (SSE Stream):**
```javascript
// EventSource connection
const eventSource = new EventSource('http://localhost:3000/reports/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Nuevo evento:', data);
};

// Ejemplo de evento:
{
  "type": "report.created",
  "data": {
    "id": 123,
    "lat": -26.1857,
    "lng": -58.1756,
    "description": "Nuevo reporte...",
    "crimeType": "HURTO",
    "neighborhoodName": "Centro"
  },
  "timestamp": "2025-10-17T13:00:00.000Z"
}
```

**Tipos de Eventos:**
- `report.created` - Nuevo reporte creado
- `report.updated` - Reporte actualizado
- `report.deleted` - Reporte eliminado

---

### 3. Buscar Reportes Cercanos

```http
GET /reports/nearby?lat={lat}&lng={lng}&radius={radius}
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `lat` | number | ✅ | - | Latitud del punto central |
| `lng` | number | ✅ | - | Longitud del punto central |
| `radius` | number | ❌ | 5 | Radio en kilómetros |

**Ejemplo:**
```http
GET /reports/nearby?lat=-26.1857&lng=-58.1756&radius=2
```

**Response (200):**
```json
[
  {
    "id": 123,
    "lat": -26.1860,
    "lng": -58.1750,
    "description": "Hurto en la calle",
    "crimeType": "HURTO",
    "severity": "MEDIA",
    "neighborhoodName": "Centro",
    "distance": 0.5
  },
  {
    "id": 124,
    "lat": -26.1855,
    "lng": -58.1760,
    "description": "Vandalismo en parque",
    "crimeType": "VANDALISMO",
    "severity": "BAJA",
    "neighborhoodName": "Centro",
    "distance": 1.2
  }
]
```

---

### 4. Listar Todos los Reportes

```http
GET /reports
```

**Response (200):**
```json
[
  {
    "id": 123,
    "title": "Hurto en Centro",
    "description": "Robo de bicicleta",
    "lat": -26.1857,
    "lng": -58.1756,
    "crimeType": "HURTO",
    "severity": "MEDIA",
    "status": "PENDING",
    "neighborhoodName": "Centro",
    "createdAt": "2025-10-17T13:00:00.000Z",
    "location": {
      "id": 1,
      "lat": -26.1857,
      "lng": -58.1756,
      "geoHash": "6g3j7w8k5m2p"
    },
    "evidences": []
  }
]
```

---

### 5. Obtener Reporte por ID

```http
GET /reports/{id}
```

**Response (200):**
```json
{
  "id": 123,
  "title": "Hurto en Centro",
  "description": "Robo de bicicleta en la esquina de Av. 25 de Mayo",
  "lat": -26.1857,
  "lng": -58.1756,
  "crimeType": "HURTO",
  "severity": "MEDIA",
  "status": "PENDING",
  "neighborhoodName": "Centro",
  "localidad": "Formosa",
  "provincia": "Formosa",
  "createdAt": "2025-10-17T13:00:00.000Z",
  "updatedAt": "2025-10-17T13:00:00.000Z",
  "location": {
    "id": 1,
    "lat": -26.1857,
    "lng": -58.1756,
    "geoHash": "6g3j7w8k5m2p",
    "neighborhoodName": "Centro"
  },
  "evidences": [
    {
      "id": 1,
      "type": "IMAGE",
      "url": "/uploads/evidences/evidence-123.jpg",
      "description": "Foto del lugar"
    }
  ]
}
```

---

### 6. Actualizar Reporte

```http
PATCH /reports/{id}
```

**Body (todos opcionales):**
```json
{
  "title": "Título actualizado",
  "description": "Descripción actualizada",
  "status": "IN_INVESTIGATION",
  "severity": "ALTA"
}
```

**Response (200):**
```json
{
  "id": 123,
  "title": "Título actualizado",
  "description": "Descripción actualizada",
  "status": "IN_INVESTIGATION",
  "severity": "ALTA",
  "updatedAt": "2025-10-17T14:00:00.000Z"
}
```

---

### 7. Eliminar Reporte

```http
DELETE /reports/{id}
```

**Response (200):**
```json
{
  "id": 123,
  "deleted": true
}
```

---

### 8. Obtener Lista de Barrios (desde Reports)

```http
GET /reports/neighborhoods/list
```

**Response (200):**
```json
{
  "neighborhoods": [
    "Centro",
    "Eva Perón",
    "San Martín",
    "Virgen del Carmen",
    "Obrero",
    "1º de Mayo",
    "Liborsi",
    "Juan D. Perón",
    "Villa del Carmen",
    "Guadalupe"
  ],
  "total": 10
}
```

---

## 🗺️ Neighborhoods

### 1. Crear Barrio

```http
POST /neighborhoods
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Permisos:** Solo `JEFATURA`

**Body:**
```json
{
  "name": "Barrio Nuevo",
  "polygon": [
    [-58.1772, -26.1853],
    [-58.1753, -26.1856],
    [-58.1740, -26.1848],
    [-58.1755, -26.1840],
    [-58.1772, -26.1853]
  ],
  "provincia": "Formosa",
  "departamento": "Formosa",
  "localidad": "Formosa",
  "metadata": {
    "area": 2.5,
    "population": 15000,
    "description": "Nuevo barrio residencial"
  }
}
```

**Notas sobre el Polígono:**
- Mínimo **3 coordenadas**
- Formato: `[longitud, latitud]`
- Debe estar **cerrado** (primer punto = último punto)
- Longitud: -180 a 180
- Latitud: -90 a 90

**Response (201):**
```json
{
  "id": "uuid-barrio-123",
  "name": "Barrio Nuevo",
  "polygon": [
    [-58.1772, -26.1853],
    [-58.1753, -26.1856],
    [-58.1740, -26.1848],
    [-58.1755, -26.1840],
    [-58.1772, -26.1853]
  ],
  "geoBounds": {
    "minLat": -26.1856,
    "maxLat": -26.1840,
    "minLng": -58.1772,
    "maxLng": -58.1740
  },
  "center": {
    "lat": -26.1848,
    "lng": -58.1756
  },
  "provincia": "Formosa",
  "departamento": "Formosa",
  "localidad": "Formosa",
  "metadata": {
    "area": 2.5,
    "population": 15000,
    "description": "Nuevo barrio residencial"
  },
  "createdAt": "2025-10-17T15:00:00.000Z"
}
```

---

### 2. Listar Todos los Barrios

```http
GET /neighborhoods
```

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "name": "Centro",
    "polygon": [
      [-58.1806, -26.1907],
      [-58.1706, -26.1907],
      [-58.1706, -26.1807],
      [-58.1806, -26.1807],
      [-58.1806, -26.1907]
    ],
    "geoBounds": {
      "minLat": -26.1907,
      "maxLat": -26.1807,
      "minLng": -58.1806,
      "maxLng": -58.1706
    },
    "center": {
      "lat": -26.1857,
      "lng": -58.1756
    },
    "provincia": "Formosa",
    "departamento": "Formosa",
    "localidad": "Formosa",
    "createdAt": "2025-10-17T10:00:00.000Z"
  }
]
```

---

### 3. Buscar Barrio por Punto (Point-in-Polygon)

Encuentra el barrio que contiene las coordenadas dadas.

```http
GET /neighborhoods/find-by-point?lat={lat}&lng={lng}
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Ejemplo |
|-----------|------|-----------|---------|
| `lat` | number | ✅ | -26.1857 |
| `lng` | number | ✅ | -58.1756 |

**Ejemplo:**
```http
GET /neighborhoods/find-by-point?lat=-26.1857&lng=-58.1756
```

**Response (200):**
```json
{
  "id": "uuid-1",
  "name": "Centro",
  "polygon": [...],
  "center": {
    "lat": -26.1857,
    "lng": -58.1756
  }
}
```

**Response (200) - No encontrado:**
```json
null
```

---

### 4. Buscar Barrios Cercanos

Encuentra barrios dentro de un radio específico (en kilómetros).

```http
GET /neighborhoods/nearby?lat={lat}&lng={lng}&radius={radius}
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `lat` | number | ✅ | - | Latitud del punto central |
| `lng` | number | ✅ | - | Longitud del punto central |
| `radius` | number | ❌ | 10 | Radio en kilómetros |

**Ejemplo:**
```http
GET /neighborhoods/nearby?lat=-26.1857&lng=-58.1756&radius=5
```

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "name": "Centro",
    "distance": 0.5,
    "center": {
      "lat": -26.1857,
      "lng": -58.1756
    }
  },
  {
    "id": "uuid-2",
    "name": "Eva Perón",
    "distance": 2.3,
    "center": {
      "lat": -26.1750,
      "lng": -58.1820
    }
  }
]
```

---

### 5. Obtener Barrio por ID

```http
GET /neighborhoods/{id}
```

**Response (200):**
```json
{
  "id": "uuid-1",
  "name": "Centro",
  "polygon": [...],
  "geoBounds": {...},
  "center": {...},
  "provincia": "Formosa",
  "metadata": {
    "area": 2.5,
    "population": 15000
  }
}
```

---

### 6. Actualizar Barrio

```http
PATCH /neighborhoods/{id}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Permisos:** Solo `JEFATURA`

**Body (todos opcionales):**
```json
{
  "name": "Centro Actualizado",
  "polygon": [...],
  "metadata": {
    "area": 3.0,
    "population": 18000
  }
}
```

**Notas:**
- Si se actualiza el `polygon`, se recalculan automáticamente `geoBounds` y `center`

**Response (200):**
```json
{
  "id": "uuid-1",
  "name": "Centro Actualizado",
  "polygon": [...],
  "geoBounds": {...},
  "center": {...},
  "updatedAt": "2025-10-17T16:00:00.000Z"
}
```

---

### 7. Eliminar Barrio

```http
DELETE /neighborhoods/{id}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Permisos:** Solo `JEFATURA`

**Response (200):**
```json
{
  "message": "Neighborhood deleted successfully"
}
```

---

## ❤️ Health Check

### 1. Liveness Check

Verifica que la aplicación esté corriendo.

```http
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-10-17T17:00:00.000Z"
}
```

---

### 2. Database Health Check

Verifica la conexión a la base de datos.

```http
GET /health/db
```

**Response (200):**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-17T17:00:00.000Z"
}
```

**Response (503) - Error:**
```json
{
  "status": "error",
  "database": "disconnected",
  "message": "Database connection failed",
  "timestamp": "2025-10-17T17:00:00.000Z"
}
```

---

## 📊 Enums y Tipos

### Crime Types

Tipos de delitos disponibles para reportes:

```typescript
enum CrimeType {
  // Delitos contra la propiedad
  HURTO = 'hurto',                    // Robo sin violencia
  ROBO = 'robo',                      // Robo con violencia
  ROBO_VEHICULO = 'robo_vehiculo',    // Robo de vehículo
  ROBO_DOMICILIO = 'robo_domicilio',  // Robo en domicilio
  VANDALISMO = 'vandalismo',          // Daños a propiedad
  
  // Delitos contra las personas
  ASESINATO = 'asesinato',            // Homicidio
  LESIONES = 'lesiones',              // Agresión física
  AMENAZAS = 'amenazas',              // Amenazas verbales
  SECUESTRO = 'secuestro',            // Secuestro/privación libertad
  ABUSO_SEXUAL = 'abuso_sexual',      // Abuso sexual
  VIOLENCIA_GENERO = 'violencia_genero', // Violencia de género
  
  // Otros
  ACTIVIDAD_SOSPECHOSA = 'actividad_sospechosa',
  OTRO = 'otro'
}
```

**Valores válidos:**
```json
[
  "hurto",
  "robo",
  "robo_vehiculo",
  "robo_domicilio",
  "vandalismo",
  "asesinato",
  "lesiones",
  "amenazas",
  "secuestro",
  "abuso_sexual",
  "violencia_genero",
  "actividad_sospechosa",
  "otro"
]
```

---

### Report Severity

Niveles de severidad para reportes:

```typescript
enum ReportSeverity {
  BAJA = 'baja',       // Baja prioridad
  MEDIA = 'media',     // Media prioridad
  ALTA = 'alta',       // Alta prioridad
  CRITICA = 'critica'  // Máxima prioridad
}
```

**Auto-asignación por tipo de delito:**
| Severidad | Tipos de Delito |
|-----------|----------------|
| `CRITICA` | asesinato, secuestro, abuso_sexual |
| `ALTA` | robo, robo_vehiculo, robo_domicilio, lesiones, violencia_genero |
| `MEDIA` | hurto, amenazas, vandalismo |
| `BAJA` | actividad_sospechosa, otro |

---

### Report Status

Estados del ciclo de vida de un reporte:

```typescript
enum ReportStatus {
  PENDING = 'pending',                 // Pendiente de revisión
  IN_INVESTIGATION = 'in_investigation', // En investigación
  VERIFIED = 'verified',               // Verificado
  RESOLVED = 'resolved',               // Resuelto
  DISMISSED = 'dismissed'              // Descartado
}
```

**Valores válidos:**
```json
[
  "pending",
  "in_investigation",
  "verified",
  "resolved",
  "dismissed"
]
```

---

### User Roles

Roles de usuario en el sistema:

```typescript
enum UserRole {
  USER = 'USER',           // Usuario regular
  MODERADOR = 'MODERADOR', // Moderador (puede editar reportes)
  JEFATURA = 'JEFATURA'    // Admin (acceso completo)
}
```

**Permisos por rol:**
| Rol | Crear Reportes | Ver Reportes | Crear Usuarios | Gestionar Barrios |
|-----|---------------|--------------|----------------|-------------------|
| `USER` | ✅ | ✅ | ❌ | ❌ |
| `MODERADOR` | ✅ | ✅ | ❌ | ❌ |
| `JEFATURA` | ✅ | ✅ | ✅ | ✅ |

---

## 🔒 Autenticación

### JWT Token

El token JWT se obtiene del endpoint `/auth/verify-login` y debe incluirse en las peticiones protegidas:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Payload del JWT:**
```json
{
  "email": "usuario@ejemplo.com",
  "sub": "uuid-1234-5678",
  "role": "USER",
  "iat": 1697543000,
  "exp": 1698147800
}
```

**Expiración:** 7 días

---

## 📝 Notas Importantes

### Coordenadas

- **Formato:** `[longitud, latitud]` en polígonos
- **Formato:** `{ lat, lng }` en puntos individuales
- **Longitud:** -180 a 180 (Este-Oeste)
- **Latitud:** -90 a 90 (Norte-Sur)

### Polígonos

- Deben tener **mínimo 3 puntos**
- Deben estar **cerrados** (primer punto = último punto)
- Formato GeoJSON: `[[lng, lat], [lng, lat], ...]`
- Los `geoBounds` y `center` se calculan automáticamente

### Notificaciones

- Las notificaciones por email se envían automáticamente cuando:
  - Se crea un reporte en un barrio
  - El usuario está suscrito a ese barrio
  - Tiene `emailNotifications: true`

### SSE (Server-Sent Events)

- Conexión persistente HTTP
- Solo servidor → cliente
- Reconexión automática
- Eventos en tiempo real para reportes

---

## 🧪 Ejemplos de Uso

### Flujo Completo de Autenticación

```bash
# 1. Solicitar magic link
curl -X POST http://localhost:3000/auth/request-login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@ejemplo.com"}'

# 2. Usuario recibe email con token

# 3. Verificar token y obtener JWT
curl -X GET "http://localhost:3000/auth/verify-login?token=abc123xyz"

# 4. Usar JWT en peticiones protegidas
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbG..."
```

---

### Crear Reporte con Notificaciones Automáticas

```bash
# 1. Crear reporte (automáticamente notifica suscriptores)
curl -X POST http://localhost:3000/reports \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -26.1857,
    "lng": -58.1756,
    "description": "Hurto en la esquina de 25 de Mayo",
    "crimeType": "HURTO"
  }'

# 2. Evento SSE se emite automáticamente
# 3. Emails enviados a suscriptores del barrio "Centro"
```

---

### Suscribirse y Recibir Notificaciones

```bash
# 1. Suscribirse a un barrio
curl -X POST http://localhost:3000/users/uuid-123/subscriptions \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "neighborhoodName": "Centro",
    "emailNotifications": true
  }'

# 2. Cuando alguien cree un reporte en "Centro":
#    - Recibirás un email automáticamente
#    - El evento aparecerá en el SSE stream
```

---

## 🔗 Links Útiles

- **Swagger Docs:** `http://localhost:3000/api/docs`
- **Health Check:** `http://localhost:3000/health`
- **SSE Stream:** `http://localhost:3000/reports/stream`

---

## 📚 Recursos Adicionales

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [GeoJSON Specification](https://geojson.org/)

---

**Última actualización:** 17 de Octubre, 2025  
**Versión API:** 1.0.0  
**Base URL:** `http://localhost:3000`
