# 📡 API Endpoints - Backend Mirage

## Base URL
```
http://localhost:3000
```

---

## 🔐 Autenticación (Magic Link)

### `POST /auth/request-login`
Solicita un enlace mágico por email para iniciar sesión sin contraseña.

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Link enviado. Revisa tu email para iniciar sesión."
}
```

**Notas:**
- Si el usuario no existe, se crea automáticamente
- El enlace expira en 15 minutos
- Solo puede usarse una vez

---

### `GET /auth/verify-login`
Verifica el token del magic link y retorna el JWT.

**Query Params:**
- `token` (string, requerido): Token único del email

**Ejemplo:**
```
GET /auth/verify-login?token=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid-1234-5678",
    "email": "usuario@ejemplo.com",
    "username": "SilentPhoenix847",
    "role": "user",
    "emailVerified": true,
    "isActive": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**
- `401 Unauthorized`: Token inválido o expirado

---

## 📊 Reportes

### `POST /reports`
Crear un nuevo reporte.

**Body:**
```json
{
  "lat": -26.1851,
  "lng": -58.1754,
  "description": "Bache grande en la calle",
  "category": "infraestructura"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "lat": -26.1851,
  "lng": -58.1754,
  "description": "Bache grande en la calle",
  "category": "infraestructura",
  "status": "pending",
  "neighborhoodName": "Eva Perón",
  "localidad": "Formosa",
  "provincia": "Formosa",
  "departamento": "Formosa",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Notas:**
- Los campos `neighborhoodName`, `localidad`, `provincia`, `departamento` se autocompletan usando geolocalización
- Se envían notificaciones por email a usuarios suscritos al barrio

---

### `GET /reports`
Obtener todos los reportes.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "lat": -26.1851,
    "lng": -58.1754,
    "description": "Bache grande en la calle",
    "category": "infraestructura",
    "status": "pending",
    "neighborhoodName": "Eva Perón",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]
```

---

### `GET /reports/:id`
Obtener un reporte específico por ID.

**Ejemplo:**
```
GET /reports/1
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "lat": -26.1851,
  "lng": -58.1754,
  "description": "Bache grande en la calle",
  "category": "infraestructura",
  "status": "pending",
  "neighborhoodName": "Eva Perón",
  "localidad": "Formosa",
  "provincia": "Formosa",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Errores:**
- `404 Not Found`: Reporte no encontrado

---

### `GET /reports/nearby`
Buscar reportes cercanos a una coordenada.

**Query Params:**
- `lat` (number, requerido): Latitud
- `lng` (number, requerido): Longitud
- `radius` (number, opcional): Radio en kilómetros (default: 5)

**Ejemplo:**
```
GET /reports/nearby?lat=-26.1851&lng=-58.1754&radius=2
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "lat": -26.1851,
    "lng": -58.1754,
    "description": "Bache grande en la calle",
    "category": "infraestructura",
    "distance": 0.5
  },
  {
    "id": 2,
    "lat": -26.1860,
    "lng": -58.1760,
    "description": "Basura acumulada",
    "category": "limpieza",
    "distance": 1.2
  }
]
```

**Notas:**
- Usa fórmula de Haversine para calcular distancias
- Los resultados se ordenan por distancia (más cercano primero)

---

### `PATCH /reports/:id`
Actualizar un reporte existente.

**Ejemplo:**
```
PATCH /reports/1
```

**Body:**
```json
{
  "status": "in_progress",
  "category": "mantenimiento"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "in_progress",
  "category": "mantenimiento",
  "updatedAt": "2025-01-15T11:00:00.000Z"
}
```

**Notas:**
- Emite evento SSE cuando se actualiza el status

---

### `DELETE /reports/:id`
Eliminar un reporte.

**Ejemplo:**
```
DELETE /reports/1
```

**Response:** `200 OK`
```json
{
  "message": "Reporte eliminado exitosamente"
}
```

**Notas:**
- Emite evento SSE cuando se elimina

---

### `GET /reports/stream` (SSE)
Stream de eventos en tiempo real de reportes.

**Ejemplo:**
```
GET /reports/stream
```

**Response:** `text/event-stream`
```
data: {"type":"report.created","data":{...},"timestamp":"2025-01-15T10:30:00.000Z"}

data: {"type":"report.updated","data":{...},"timestamp":"2025-01-15T10:31:00.000Z"}

data: {"type":"report.deleted","data":{...},"timestamp":"2025-01-15T10:32:00.000Z"}
```

**Tipos de eventos:**
- `report.created`: Nuevo reporte creado
- `report.updated`: Reporte actualizado
- `report.deleted`: Reporte eliminado

**Uso en frontend:**
```javascript
const eventSource = new EventSource('http://localhost:3000/reports/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Evento recibido:', data);
};
```

---

### `GET /reports/neighborhoods/list`
Obtener lista de todos los barrios disponibles.

**Response:** `200 OK`
```json
{
  "neighborhoods": [
    {
      "nombre_barrio": "Eva Perón",
      "provincia": "Formosa",
      "departamento": "Formosa",
      "localidad": "Formosa",
      "geometry": {
        "type": "Point",
        "coordinates": [-58.1754, -26.1851]
      }
    }
  ],
  "total": 51
}
```

---

## 👥 Usuarios

### `GET /users`
🔒 **Requiere autenticación** | **Solo JEFATURA**

Listar todos los usuarios.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-1234",
    "email": "usuario@ejemplo.com",
    "username": "SilentPhoenix847",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-01-10T08:00:00.000Z"
  }
]
```

**Errores:**
- `401 Unauthorized`: Token no válido o faltante
- `403 Forbidden`: Usuario sin permisos de JEFATURA

---

### `GET /users/:id`
🔒 **Requiere autenticación** | **Solo JEFATURA**

Obtener un usuario por ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Ejemplo:**
```
GET /users/uuid-1234
```

**Response:** `200 OK`
```json
{
  "id": "uuid-1234",
  "email": "usuario@ejemplo.com",
  "username": "SilentPhoenix847",
  "role": "user",
  "emailVerified": true,
  "isActive": true,
  "createdAt": "2025-01-10T08:00:00.000Z"
}
```

---

### `POST /users`
🔒 **Requiere autenticación** | **Solo JEFATURA**

Crear un nuevo usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "email": "nuevo@ejemplo.com",
  "role": "user"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-5678",
  "email": "nuevo@ejemplo.com",
  "username": "BraveTiger293",
  "role": "user",
  "emailVerified": false,
  "isActive": true,
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

---

### `PATCH /users/:id`
🔒 **Requiere autenticación** | **Solo JEFATURA**

Actualizar un usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "role": "jefatura",
  "isActive": true
}
```

**Response:** `200 OK`

---

### `DELETE /users/:id`
🔒 **Requiere autenticación** | **Solo JEFATURA**

Eliminar un usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

---

### `POST /users/:id/avatar`
🔒 **Requiere autenticación**

Subir avatar de usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Form Data:**
- `avatar` (file): Imagen JPG, JPEG, PNG o GIF (máx 5MB)

**Response:** `200 OK`
```json
{
  "message": "Avatar for user uuid-1234 uploaded successfully",
  "filename": "avatar-1234567890.jpg",
  "path": "/uploads/avatar-1234567890.jpg"
}
```

---

## 🔔 Suscripciones a Barrios

### `POST /users/:id/subscriptions`
🔒 **Requiere autenticación**

Suscribirse a notificaciones de un barrio.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Body:**
```json
{
  "neighborhoodName": "Eva Perón",
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true
}
```

**Response:** `201 Created`
```json
{
  "id": "sub-1234",
  "userId": "uuid-1234",
  "neighborhoodName": "Eva Perón",
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true,
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

---

### `GET /users/:id/subscriptions`
🔒 **Requiere autenticación**

Obtener suscripciones de un usuario.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:** `200 OK`
```json
[
  {
    "id": "sub-1234",
    "neighborhoodName": "Eva Perón",
    "emailNotifications": true,
    "smsNotifications": false,
    "pushNotifications": true,
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": "sub-5678",
    "neighborhoodName": "San Martín",
    "emailNotifications": true,
    "smsNotifications": false,
    "pushNotifications": false,
    "createdAt": "2025-01-14T09:00:00.000Z"
  }
]
```

---

### `DELETE /users/:id/subscriptions/:subscriptionId`
🔒 **Requiere autenticación**

Cancelar suscripción a un barrio.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Ejemplo:**
```
DELETE /users/uuid-1234/subscriptions/sub-1234
```

**Response:** `200 OK`
```json
{
  "message": "Suscripción cancelada exitosamente"
}
```

---

### `GET /users/neighborhoods/available`
Obtener lista de barrios disponibles para suscripción.

**Response:** `200 OK`
```json
{
  "neighborhoods": [
    {
      "nombre_barrio": "Eva Perón",
      "provincia": "Formosa",
      "departamento": "Formosa",
      "localidad": "Formosa"
    },
    {
      "nombre_barrio": "San Martín",
      "provincia": "Formosa",
      "departamento": "Formosa",
      "localidad": "Formosa"
    }
  ],
  "total": 51
}
```

---

## ❤️ Health Check

### `GET /health`
Verificar estado del servicio.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### `GET /health/db`
Verificar conexión a la base de datos.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Errores:**
- `503 Service Unavailable`: Base de datos no disponible

---

## 🔑 Autenticación y Autorización

### Roles disponibles:
- `user`: Usuario regular (puede crear reportes, suscribirse a barrios)
- `jefatura`: Administrador (acceso completo a gestión de usuarios)

### Usar el JWT:
Después de obtener el `accessToken` en `/auth/verify-login`, inclúyelo en las peticiones protegidas:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📧 Notificaciones por Email

Cuando se crea un reporte:

1. **GeospatialService** determina el barrio usando las coordenadas
2. **NotificationService** busca usuarios suscritos a ese barrio
3. Se envían emails a usuarios con `emailNotifications: true`
4. Email incluye:
   - Nombre del barrio
   - Categoría del reporte
   - Descripción
   - Link a Google Maps con las coordenadas
   - Botón para ver detalles
   - Link para cancelar suscripción

---

## 🌐 CORS

El backend acepta requests desde:
- `http://localhost:3000`
- Configurable via `CORS_ORIGIN` en `.env`

---

## 📝 Notas Importantes

1. **Magic Link expira en 15 minutos**
2. **Archivos subidos** se guardan en `/uploads`
3. **Avatares máximo 5MB** (JPG, JPEG, PNG, GIF)
4. **SSE mantiene conexión abierta** para eventos en tiempo real
5. **Geolocalización automática** de barrios al crear reportes
6. **51 barrios** de Formosa Capital disponibles
7. **Notificaciones por email** automáticas para reportes en barrios suscritos

---

## 🚀 Próximos Endpoints (Pendientes)

### Evidence (Evidencias)
```
POST   /reports/:id/evidence     # Subir archivo adjunto
GET    /reports/:id/evidence     # Listar evidencias
DELETE /reports/:id/evidence/:id # Eliminar evidencia
```

### Locations (Ubicaciones)
```
POST   /locations               # Crear ubicación normalizada
GET    /locations/:id           # Obtener ubicación
GET    /locations/nearby        # Buscar ubicaciones cercanas
```

---

**Última actualización:** 2025-01-15
**Versión API:** 1.0.0
**Puerto:** 3000
