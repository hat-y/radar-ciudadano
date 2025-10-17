# 🚀 Guía de Endpoints - Backend Mirage

## Base URL
```
http://localhost:3000
```

---

## 📋 Tabla de Contenidos
1. [Autenticación (Magic Link)](#autenticación)
2. [Reportes](#reportes)
3. [Usuarios](#usuarios)
4. [Suscripciones a Barrios](#suscripciones)
5. [Health Check](#health-check)

---

## 🔐 Autenticación (Magic Link)

### 1. Solicitar Magic Link

**Endpoint:** `POST /auth/request-login`

**Descripción:** Envía un enlace mágico al email para iniciar sesión sin contraseña.

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/auth/request-login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com"}'
```

**Ejemplo con JavaScript:**
```javascript
const response = await fetch('http://localhost:3000/auth/request-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'usuario@ejemplo.com' })
});

const data = await response.json();
console.log(data.message); // "Link enviado. Revisa tu email..."
```

**Response 200:**
```json
{
  "message": "Link enviado. Revisa tu email para iniciar sesión."
}
```

---

### 2. Verificar Magic Link

**Endpoint:** `GET /auth/verify-login?token={token}`

**Descripción:** Verifica el token del magic link y retorna JWT.

**Query Params:**
- `token` (string, requerido) - Token recibido por email

**Ejemplo con cURL:**
```bash
curl -X GET "http://localhost:3000/auth/verify-login?token=abc123def456..."
```

**Ejemplo con JavaScript:**
```javascript
const token = 'abc123def456...'; // Del email
const response = await fetch(`http://localhost:3000/auth/verify-login?token=${token}`);
const data = await response.json();

console.log(data.accessToken); // JWT token
localStorage.setItem('token', data.accessToken);
```

**Response 200:**
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

---

## 📊 Reportes

### 3. Crear Reporte

**Endpoint:** `POST /reports`

**Descripción:** Crea un nuevo reporte de incidente ciudadano.

**Body:**
```json
{
  "lat": -26.1851,
  "lng": -58.1754,
  "description": "Bache grande en la calle principal",
  "category": "infraestructura",
  "title": "Bache peligroso"
}
```

**Campos:**
- `lat` (number, requerido) - Latitud (-90 a 90)
- `lng` (number, requerido) - Longitud (-180 a 180)
- `description` (string, requerido) - Descripción del problema
- `category` (string, opcional) - Categoría: "infraestructura", "limpieza", "seguridad", "iluminacion"
- `title` (string, opcional) - Título del reporte

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/reports \
  -H "Content-Type: application/json" \
  -d '{
    "lat": -26.1851,
    "lng": -58.1754,
    "description": "Bache grande en la calle principal",
    "category": "infraestructura"
  }'
```

**Ejemplo con JavaScript:**
```javascript
const newReport = {
  lat: -26.1851,
  lng: -58.1754,
  description: "Bache grande en la calle principal",
  category: "infraestructura",
  title: "Bache peligroso"
};

const response = await fetch('http://localhost:3000/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newReport)
});

const report = await response.json();
console.log(report.id); // ID generado
console.log(report.neighborhoodName); // "Eva Perón" (autocompletado)
```

**Response 201:**
```json
{
  "id": 1,
  "lat": -26.1851,
  "lng": -58.1754,
  "title": "Bache peligroso",
  "description": "Bache grande en la calle principal",
  "category": "infraestructura",
  "status": "pending",
  "severity": "medium",
  "neighborhoodName": "Eva Perón",
  "localidad": "Formosa",
  "provincia": "Formosa",
  "departamento": "Formosa",
  "locationId": 1,
  "viewCount": 0,
  "upvotes": 0,
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

**Notas:**
- ✅ El barrio se detecta automáticamente por geolocalización
- ✅ Se envían emails a usuarios suscritos al barrio
- ✅ Se emite evento SSE a clientes conectados

---

### 4. Listar Todos los Reportes

**Endpoint:** `GET /reports`

**Descripción:** Obtiene todos los reportes ordenados por fecha (más recientes primero).

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/reports
```

**Ejemplo con JavaScript:**
```javascript
const response = await fetch('http://localhost:3000/reports');
const reports = await response.json();

reports.forEach(report => {
  console.log(`${report.id}: ${report.description}`);
});
```

**Response 200:**
```json
[
  {
    "id": 1,
    "lat": -26.1851,
    "lng": -58.1754,
    "title": "Bache peligroso",
    "description": "Bache grande en la calle principal",
    "category": "infraestructura",
    "status": "pending",
    "neighborhoodName": "Eva Perón",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "location": {
      "id": 1,
      "lat": -26.1851,
      "lng": -58.1754,
      "neighborhoodName": "Eva Perón"
    },
    "evidences": []
  }
]
```

---

### 5. Obtener Reporte por ID

**Endpoint:** `GET /reports/:id`

**Descripción:** Obtiene un reporte específico con todas sus relaciones.

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/reports/1
```

**Ejemplo con JavaScript:**
```javascript
const reportId = 1;
const response = await fetch(`http://localhost:3000/reports/${reportId}`);
const report = await response.json();

console.log(report.description);
console.log(report.evidences.length); // Archivos adjuntos
```

**Response 200:**
```json
{
  "id": 1,
  "lat": -26.1851,
  "lng": -58.1754,
  "title": "Bache peligroso",
  "description": "Bache grande en la calle principal",
  "category": "infraestructura",
  "status": "pending",
  "severity": "medium",
  "neighborhoodName": "Eva Perón",
  "location": {
    "id": 1,
    "lat": -26.1851,
    "lng": -58.1754,
    "geoHash": "69y7z5q6s9k0"
  },
  "evidences": [
    {
      "id": 1,
      "type": "photo",
      "fileUrl": "/uploads/evidence-123.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 245632
    }
  ],
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "Report with ID 999 not found"
}
```

---

### 6. Buscar Reportes Cercanos

**Endpoint:** `GET /reports/nearby?lat={lat}&lng={lng}&radius={km}`

**Descripción:** Busca reportes dentro de un radio específico usando Haversine.

**Query Params:**
- `lat` (number, requerido) - Latitud del punto central
- `lng` (number, requerido) - Longitud del punto central
- `radius` (number, opcional) - Radio en kilómetros (default: 5)

**Ejemplo con cURL:**
```bash
curl -X GET "http://localhost:3000/reports/nearby?lat=-26.1851&lng=-58.1754&radius=2"
```

**Ejemplo con JavaScript:**
```javascript
// Obtener ubicación del usuario
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  const radius = 5; // 5 km
  
  const response = await fetch(
    `http://localhost:3000/reports/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
  );
  
  const nearbyReports = await response.json();
  console.log(`Encontrados ${nearbyReports.length} reportes cercanos`);
});
```

**Response 200:**
```json
[
  {
    "id": 1,
    "lat": -26.1851,
    "lng": -58.1754,
    "description": "Bache grande",
    "category": "infraestructura",
    "status": "pending",
    "neighborhoodName": "Eva Perón",
    "location": {
      "id": 1,
      "lat": -26.1851,
      "lng": -58.1754
    }
  },
  {
    "id": 2,
    "lat": -26.1860,
    "lng": -58.1760,
    "description": "Basura acumulada",
    "category": "limpieza",
    "status": "pending",
    "neighborhoodName": "Eva Perón"
  }
]
```

**Nota:** Los resultados se ordenan por distancia (más cercano primero).

---

### 7. Actualizar Reporte

**Endpoint:** `PATCH /reports/:id`

**Descripción:** Actualiza campos de un reporte existente.

**Body (todos los campos son opcionales):**
```json
{
  "status": "in_progress",
  "title": "Bache en reparación",
  "description": "Bache grande - En proceso de reparación",
  "category": "infraestructura",
  "severity": "high"
}
```

**Valores permitidos:**
- `status`: "pending" | "in_progress" | "resolved" | "rejected"
- `severity`: "low" | "medium" | "high" | "urgent"

**Ejemplo con cURL:**
```bash
curl -X PATCH http://localhost:3000/reports/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

**Ejemplo con JavaScript:**
```javascript
const reportId = 1;
const updates = {
  status: 'in_progress',
  severity: 'high'
};

const response = await fetch(`http://localhost:3000/reports/${reportId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});

const updatedReport = await response.json();
console.log(updatedReport.status); // "in_progress"
```

**Response 200:**
```json
{
  "id": 1,
  "status": "in_progress",
  "severity": "high",
  "updatedAt": "2025-01-15T11:00:00.000Z"
}
```

**Nota:** Emite evento SSE cuando se actualiza.

---

### 8. Eliminar Reporte

**Endpoint:** `DELETE /reports/:id`

**Descripción:** Elimina un reporte (soft delete).

**Ejemplo con cURL:**
```bash
curl -X DELETE http://localhost:3000/reports/1
```

**Ejemplo con JavaScript:**
```javascript
const reportId = 1;
const response = await fetch(`http://localhost:3000/reports/${reportId}`, {
  method: 'DELETE'
});

if (response.ok) {
  console.log('Reporte eliminado');
}
```

**Response 200:**
```json
{
  "message": "Reporte eliminado exitosamente"
}
```

**Nota:** 
- Es un soft delete (se marca con `deletedAt`)
- Emite evento SSE de eliminación

---

### 9. Stream de Eventos (SSE)

**Endpoint:** `GET /reports/stream`

**Descripción:** Conexión Server-Sent Events para recibir actualizaciones en tiempo real.

**Ejemplo con JavaScript:**
```javascript
const eventSource = new EventSource('http://localhost:3000/reports/stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'report.created':
      console.log('Nuevo reporte:', data.data);
      // Actualizar UI
      break;
    case 'report.updated':
      console.log('Reporte actualizado:', data.data);
      // Actualizar UI
      break;
    case 'report.deleted':
      console.log('Reporte eliminado:', data.data);
      // Remover de UI
      break;
  }
};

eventSource.onerror = (error) => {
  console.error('SSE error:', error);
  eventSource.close();
};

// Cerrar conexión cuando sea necesario
// eventSource.close();
```

**Eventos emitidos:**
```json
// Evento: report.created
data: {
  "type": "report.created",
  "data": { "id": 1, "description": "...", ... },
  "timestamp": "2025-01-15T10:30:00.000Z"
}

// Evento: report.updated
data: {
  "type": "report.updated",
  "data": { "id": 1, "status": "in_progress", ... },
  "timestamp": "2025-01-15T10:31:00.000Z"
}

// Evento: report.deleted
data: {
  "type": "report.deleted",
  "data": 1,
  "timestamp": "2025-01-15T10:32:00.000Z"
}
```

---

### 10. Obtener Lista de Barrios

**Endpoint:** `GET /reports/neighborhoods/list`

**Descripción:** Obtiene todos los barrios disponibles de Formosa Capital.

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/reports/neighborhoods/list
```

**Ejemplo con JavaScript:**
```javascript
const response = await fetch('http://localhost:3000/reports/neighborhoods/list');
const data = await response.json();

console.log(`Total barrios: ${data.total}`);
data.neighborhoods.forEach(n => {
  console.log(n.nombre_barrio);
});
```

**Response 200:**
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
    },
    {
      "nombre_barrio": "San Martín",
      "provincia": "Formosa",
      "departamento": "Formosa",
      "localidad": "Formosa",
      "geometry": {
        "type": "Point",
        "coordinates": [-58.1623, -26.1789]
      }
    }
  ],
  "total": 51
}
```

---

## 👥 Usuarios

### 11. Listar Usuarios

**Endpoint:** `GET /users`  
🔒 **Requiere autenticación** | **Solo JEFATURA**

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ejemplo con JavaScript:**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const users = await response.json();
```

**Response 200:**
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

---

### 12. Crear Usuario

**Endpoint:** `POST /users`  
🔒 **Requiere autenticación** | **Solo JEFATURA**

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "email": "nuevo@ejemplo.com",
  "role": "user"
}
```

**Valores de `role`:**
- `"user"` - Usuario regular
- `"jefatura"` - Administrador

**Ejemplo con JavaScript:**
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3000/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'nuevo@ejemplo.com',
    role: 'user'
  })
});

const newUser = await response.json();
```

**Response 201:**
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

## 🔔 Suscripciones a Barrios

### 13. Suscribirse a un Barrio

**Endpoint:** `POST /users/:id/subscriptions`  
🔒 **Requiere autenticación**

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
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

**Ejemplo con JavaScript:**
```javascript
const userId = 'uuid-1234';
const token = localStorage.getItem('token');

const response = await fetch(`http://localhost:3000/users/${userId}/subscriptions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    neighborhoodName: 'Eva Perón',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  })
});

const subscription = await response.json();
```

**Response 201:**
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

### 14. Ver Suscripciones

**Endpoint:** `GET /users/:id/subscriptions`  
🔒 **Requiere autenticación**

**Ejemplo con JavaScript:**
```javascript
const userId = 'uuid-1234';
const token = localStorage.getItem('token');

const response = await fetch(`http://localhost:3000/users/${userId}/subscriptions`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const subscriptions = await response.json();
subscriptions.forEach(sub => {
  console.log(`Suscrito a: ${sub.neighborhoodName}`);
});
```

**Response 200:**
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

### 15. Cancelar Suscripción

**Endpoint:** `DELETE /users/:id/subscriptions/:subscriptionId`  
🔒 **Requiere autenticación**

**Ejemplo con JavaScript:**
```javascript
const userId = 'uuid-1234';
const subscriptionId = 'sub-1234';
const token = localStorage.getItem('token');

const response = await fetch(
  `http://localhost:3000/users/${userId}/subscriptions/${subscriptionId}`,
  {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

if (response.ok) {
  console.log('Suscripción cancelada');
}
```

**Response 200:**
```json
{
  "message": "Suscripción cancelada exitosamente"
}
```

---

### 16. Obtener Barrios Disponibles

**Endpoint:** `GET /users/neighborhoods/available`

**Descripción:** Lista de todos los barrios disponibles para suscripción.

**Ejemplo con JavaScript:**
```javascript
const response = await fetch('http://localhost:3000/users/neighborhoods/available');
const data = await response.json();

// Crear select con los barrios
const select = document.getElementById('neighborhood-select');
data.neighborhoods.forEach(n => {
  const option = document.createElement('option');
  option.value = n.nombre_barrio;
  option.textContent = n.nombre_barrio;
  select.appendChild(option);
});
```

**Response 200:**
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

### 17. Estado del Servicio

**Endpoint:** `GET /health`

**Ejemplo con cURL:**
```bash
curl -X GET http://localhost:3000/health
```

**Response 200:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### 18. Estado de la Base de Datos

**Endpoint:** `GET /health/db`

**Ejemplo with cURL:**
```bash
curl -X GET http://localhost:3000/health/db
```

**Response 200:**
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 🎨 Ejemplo de Aplicación Completa

### Frontend React - Crear Reporte

```javascript
import { useState } from 'react';

function CreateReportForm() {
  const [formData, setFormData] = useState({
    description: '',
    category: 'infraestructura',
    lat: -26.1851,
    lng: -58.1754
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const report = await response.json();
      console.log('Reporte creado:', report);
      alert(`Reporte #${report.id} creado exitosamente`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        placeholder="Describe el problema..."
        required
      />
      
      <select
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value})}
      >
        <option value="infraestructura">Infraestructura</option>
        <option value="limpieza">Limpieza</option>
        <option value="seguridad">Seguridad</option>
        <option value="iluminacion">Iluminación</option>
      </select>
      
      <button type="submit">Crear Reporte</button>
    </form>
  );
}
```

---

## 🔑 Variables de Entorno Necesarias

```bash
# Backend .env
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=postgres_db
JWT_SECRET=tu-secret-key
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
FRONT=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

---

## 📚 Categorías Sugeridas

```javascript
const categories = [
  'infraestructura',  // Baches, veredas, rutas
  'limpieza',         // Basura, residuos
  'seguridad',        // Iluminación, vigilancia
  'iluminacion',      // Postes, farolas
  'arbolado',         // Árboles, espacios verdes
  'transito',         // Señalización, semáforos
  'otro'              // Otros problemas
];
```

---

**📖 Documentación completa disponible en:**
- `API_ENDPOINTS.md`
- `CORRECCIONES_APLICADAS.md`
- `ENTIDADES_IMPLEMENTADAS.md`

**🚀 Backend listo para uso!**
