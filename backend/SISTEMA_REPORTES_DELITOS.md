# 🚨 Sistema de Reportes de Delitos - Guía Completa

## 📋 Tipos de Delitos Disponibles

### 🏠 Delitos contra la Propiedad
```typescript
enum CrimeType {
  HURTO = 'hurto',                    // Robo sin violencia
  ROBO = 'robo',                      // Robo con violencia/intimidación
  ROBO_VEHICULO = 'robo_vehiculo',    // Robo de vehículo
  ROBO_DOMICILIO = 'robo_domicilio',  // Robo en vivienda
  VANDALISMO = 'vandalismo',          // Daño a propiedad
}
```

### 👤 Delitos contra las Personas
```typescript
enum CrimeType {
  ASESINATO = 'asesinato',            // Homicidio
  LESIONES = 'lesiones',              // Agresión física
  AMENAZAS = 'amenazas',              // Amenazas verbales/escritas
  SECUESTRO = 'secuestro',            // Privación de libertad
  ABUSO_SEXUAL = 'abuso_sexual',      // Delitos sexuales
  VIOLENCIA_GENERO = 'violencia_genero', // Violencia de género
}
```

### 🚔 Delitos contra la Seguridad Pública
```typescript
enum CrimeType {
  NARCOTRAFICO = 'narcotrafico',      // Tráfico de drogas
  TRAFICO_ARMAS = 'trafico_armas',    // Tráfico de armas
  EXTORSION = 'extorsion',            // Extorsión
  CORRUPCION = 'corrupcion',          // Corrupción
}
```

### 🔍 Otros
```typescript
enum CrimeType {
  ACTIVIDAD_SOSPECHOSA = 'actividad_sospechosa', // Actividad sospechosa
  OTRO = 'otro',                      // Otros delitos
}
```

---

## 📊 Niveles de Severidad (Automáticos)

El sistema asigna automáticamente la severidad según el tipo de delito:

### 🔴 **CRITICA** (Delitos graves)
- asesinato
- secuestro
- abuso_sexual

### 🟠 **ALTA** (Delitos violentos)
- robo
- robo_vehiculo
- robo_domicilio
- lesiones
- violencia_genero
- narcotrafico
- extorsion

### 🟡 **MEDIA** (Delitos sin violencia)
- hurto
- amenazas
- vandalismo
- trafico_armas
- corrupcion

### 🟢 **BAJA** (Incidentes menores)
- actividad_sospechosa
- otro

---

## 🎯 Estados del Reporte

```typescript
enum ReportStatus {
  PENDING = 'pending',                    // Pendiente de revisión
  IN_INVESTIGATION = 'in_investigation',  // En investigación
  VERIFIED = 'verified',                  // Verificado por autoridades
  RESOLVED = 'resolved',                  // Resuelto/Cerrado
  DISMISSED = 'dismissed',                // Descartado (falsa alarma)
}
```

---

## 🚀 Crear Reporte de Delito

### Endpoint
```
POST http://localhost:3000/reports
```

### Body Completo
```json
{
  "lat": -26.1851,
  "lng": -58.1754,
  "description": "Dos personas encapuchadas robaron una motocicleta a mano armada en la esquina de Av. Rivadavia y Belgrano",
  "crimeType": "robo_vehiculo",
  "title": "Robo de motocicleta a mano armada",
  "severity": "alta"
}
```

### Campos Requeridos
- **`lat`** (number) - Latitud (-90 a 90)
- **`lng`** (number) - Longitud (-180 a 180)
- **`description`** (string) - Descripción detallada del delito
- **`crimeType`** (enum) - Tipo de delito (ver lista completa arriba)

### Campos Opcionales
- **`title`** (string) - Título breve del reporte
- **`severity`** (enum) - Severidad manual (si no se especifica, se asigna automáticamente)

---

## 📝 Ejemplos de Uso

### 1. Reportar Hurto
```json
{
  "lat": -26.1851,
  "lng": -58.1754,
  "description": "Me robaron el celular de la mochila en el colectivo",
  "crimeType": "hurto",
  "title": "Hurto de celular en transporte público"
}
```

**Severidad asignada:** MEDIA (automática)

---

### 2. Reportar Robo con Violencia
```json
{
  "lat": -26.1860,
  "lng": -58.1760,
  "description": "Dos personas armadas asaltaron el kiosco de la esquina, amenazaron al dueño y se llevaron dinero",
  "crimeType": "robo",
  "title": "Asalto a kiosco"
}
```

**Severidad asignada:** ALTA (automática)

---

### 3. Reportar Violencia de Género
```json
{
  "lat": -26.1855,
  "lng": -58.1750,
  "description": "Escuché gritos y golpes provenientes del departamento del tercer piso. Mujer pidiendo ayuda",
  "crimeType": "violencia_genero",
  "title": "Violencia doméstica - Departamento 3°A"
}
```

**Severidad asignada:** ALTA (automática)

---

### 4. Reportar Actividad Sospechosa
```json
{
  "lat": -26.1845,
  "lng": -58.1765,
  "description": "Vehículo sin patente estacionado hace 3 días en la misma esquina. Personas entrando y saliendo constantemente",
  "crimeType": "actividad_sospechosa",
  "title": "Vehículo sospechoso"
}
```

**Severidad asignada:** BAJA (automática)

---

### 5. Reportar Narcotráfico
```json
{
  "lat": -26.1870,
  "lng": -58.1780,
  "description": "Punto de venta de drogas en esquina. Movimiento constante de personas y vehículos sospechosos",
  "crimeType": "narcotrafico",
  "title": "Punto de venta de drogas"
}
```

**Severidad asignada:** ALTA (automática)

---

### 6. Reportar Homicidio
```json
{
  "lat": -26.1865,
  "lng": -58.1755,
  "description": "Encontraron un cuerpo sin vida en el baldío de la calle San Martín",
  "crimeType": "asesinato",
  "title": "Hallazgo de cuerpo sin vida"
}
```

**Severidad asignada:** CRITICA (automática)

---

## 💻 Ejemplo de Implementación en Frontend

### React/TypeScript

```typescript
import { useState } from 'react';

// Tipos
enum CrimeType {
  HURTO = 'hurto',
  ROBO = 'robo',
  ROBO_VEHICULO = 'robo_vehiculo',
  ROBO_DOMICILIO = 'robo_domicilio',
  VANDALISMO = 'vandalismo',
  ASESINATO = 'asesinato',
  LESIONES = 'lesiones',
  AMENAZAS = 'amenazas',
  SECUESTRO = 'secuestro',
  ABUSO_SEXUAL = 'abuso_sexual',
  VIOLENCIA_GENERO = 'violencia_genero',
  NARCOTRAFICO = 'narcotrafico',
  TRAFICO_ARMAS = 'trafico_armas',
  EXTORSION = 'extorsion',
  CORRUPCION = 'corrupcion',
  ACTIVIDAD_SOSPECHOSA = 'actividad_sospechosa',
  OTRO = 'otro',
}

interface CreateReportDto {
  lat: number;
  lng: number;
  description: string;
  crimeType: CrimeType;
  title?: string;
}

### Componente React Mejorado con Selección en Mapa

**Importante**: Las coordenadas se obtienen automáticamente al hacer clic en el mapa. Los usuarios NO deben ingresar manualmente lat/lng.

```tsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CRIME_TYPES = [
  { value: 'hurto', label: 'Hurto', group: 'Delitos contra la Propiedad' },
  { value: 'robo', label: 'Robo', group: 'Delitos contra la Propiedad' },
  { value: 'robo_vehiculo', label: 'Robo de Vehículo', group: 'Delitos contra la Propiedad' },
  { value: 'robo_domicilio', label: 'Robo a Domicilio', group: 'Delitos contra la Propiedad' },
  { value: 'vandalismo', label: 'Vandalismo', group: 'Delitos contra la Propiedad' },
  { value: 'asesinato', label: 'Homicidio', group: 'Delitos contra las Personas' },
  { value: 'lesiones', label: 'Lesiones/Agresión', group: 'Delitos contra las Personas' },
  { value: 'amenazas', label: 'Amenazas', group: 'Delitos contra las Personas' },
  { value: 'secuestro', label: 'Secuestro', group: 'Delitos contra las Personas' },
  { value: 'abuso_sexual', label: 'Abuso Sexual', group: 'Delitos contra las Personas' },
  { value: 'violencia_genero', label: 'Violencia de Género', group: 'Delitos contra las Personas' },
  { value: 'narcotrafico', label: 'Narcotráfico', group: 'Delitos contra Seguridad Pública' },
  { value: 'trafico_armas', label: 'Tráfico de Armas', group: 'Delitos contra Seguridad Pública' },
  { value: 'extorsion', label: 'Extorsión', group: 'Delitos contra Seguridad Pública' },
  { value: 'corrupcion', label: 'Corrupción', group: 'Delitos contra Seguridad Pública' },
  { value: 'actividad_sospechosa', label: 'Actividad Sospechosa', group: 'Otros' },
  { value: 'otro', label: 'Otro', group: 'Otros' },
];

function ReportCrimeForm() {
  const [crimeType, setCrimeType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Obtener ubicación actual del usuario
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setUseCurrentLocation(true);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación. Por favor, selecciona manualmente en el mapa.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      alert('Por favor selecciona una ubicación en el mapa o usa tu ubicación actual');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          title,
          description,
          crimeType,
          // severity se asigna automáticamente en el backend
        }),
      });

      const report = await response.json();
      console.log('Reporte creado:', report);
      alert(`✅ Reporte #${report.id} creado exitosamente\nSeveridad: ${report.severity.toUpperCase()}\nBarrio: ${report.neighborhoodName || 'No detectado'}`);
      
      // Limpiar formulario
      setCrimeType('');
      setTitle('');
      setDescription('');
      setLocation(null);
      setUseCurrentLocation(false);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al crear reporte. Intenta nuevamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold">🚨 Reportar Delito</h2>

      {/* Tipo de Delito */}
      <div>
        <label className="block font-medium mb-2">
          Tipo de Delito <span className="text-red-500">*</span>
        </label>
        <select
          value={crimeType}
          onChange={(e) => setCrimeType(e.target.value)}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Seleccionar tipo de delito...</option>
          {['Delitos contra la Propiedad', 'Delitos contra las Personas', 'Delitos contra Seguridad Pública', 'Otros'].map((group) => (
            <optgroup key={group} label={group}>
              {CRIME_TYPES.filter((t) => t.group === group).map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Título */}
      <div>
        <label className="block font-medium mb-2">Título (opcional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Robo de motocicleta en Av. 25 de Mayo"
          className="w-full p-2 border rounded"
          maxLength={100}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block font-medium mb-2">
          Descripción del Incidente <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el delito con el mayor detalle posible (hora, características, testigos, etc.)"
          required
          rows={5}
          className="w-full p-2 border rounded"
        />
        <div className="text-sm text-gray-500 mt-1">
          {description.length}/500 caracteres
        </div>
      </div>

      {/* Ubicación - Mapa Interactivo */}
      <div>
        <label className="block font-medium mb-2">
          📍 Ubicación donde ocurrió el delito <span className="text-red-500">*</span>
        </label>
        
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            📍 Usar mi ubicación actual
          </button>
          <button
            type="button"
            onClick={() => {
              setLocation(null);
              setUseCurrentLocation(false);
            }}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            🔄 Limpiar
          </button>
        </div>

        <div className="border rounded-lg overflow-hidden shadow-md">
          <MapContainer
            center={[-26.1857, -58.1756]} // Formosa Capital
            zoom={13}
            style={{ height: '450px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker location={location} setLocation={setLocation} />
            {location && (
              <Marker
                position={[location.lat, location.lng]}
                eventHandlers={{
                  click: () => {
                    setUseCurrentLocation(false);
                  },
                }}
              />
            )}
          </MapContainer>
        </div>

        {location ? (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700 font-medium">
              ✓ Ubicación seleccionada
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Coordenadas: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
            {useCurrentLocation && (
              <p className="text-xs text-blue-600 mt-1">
                📍 Usando tu ubicación actual
              </p>
            )}
          </div>
        ) : (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-700 text-sm">
              ⚠️ Haz clic en el mapa donde ocurrió el delito, o usa el botón "Usar mi ubicación actual"
            </p>
          </div>
        )}
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={!location || !crimeType || !description}
        className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
      >
        {location && crimeType ? '🚨 Crear Reporte' : '⚠️ Completa todos los campos requeridos'}
      </button>

      {/* Nota de Privacidad */}
      <div className="text-xs text-gray-500 border-t pt-3">
        <p>
          🔒 <strong>Privacidad:</strong> Los reportes son anónimos por defecto. 
          Tu ubicación se usa solo para geolocalizar el incidente.
        </p>
      </div>
    </form>
  );
}

// Componente helper para capturar clics en el mapa
function LocationPicker({
  location,
  setLocation,
}: {
  location: { lat: number; lng: number } | null;
  setLocation: (loc: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}
```

---

## 🔔 Notificaciones Automáticas

Cuando se crea un reporte de delito:

1. ✅ Se detecta automáticamente el barrio por geolocalización
2. ✅ Se asigna severidad automática según tipo de delito
3. ✅ Se notifica por email a usuarios suscritos al barrio
4. ✅ Se emite evento SSE para actualización en tiempo real

### Email de Notificación
Los usuarios reciben un email con:
- 🚨 Tipo de delito
- 📍 Barrio afectado
- 📝 Descripción del incidente
- 🗺️ Link a Google Maps con la ubicación exacta
- 🔗 Botón para ver detalles completos

---

## 📊 Response de Creación

```json
{
  "id": 1,
  "lat": -26.1851,
  "lng": -58.1754,
  "title": "Robo de motocicleta a mano armada",
  "description": "Dos personas encapuchadas robaron una motocicleta...",
  "crimeType": "robo_vehiculo",
  "status": "pending",
  "severity": "alta",
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

---

## 🗺️ Mapa de Calor de Delitos

Puedes obtener reportes cercanos para crear un mapa de calor:

```javascript
// Obtener reportes en un radio de 2km
const response = await fetch(
  'http://localhost:3000/reports/nearby?lat=-26.1851&lng=-58.1754&radius=2'
);
const nearbyReports = await response.json();

// Agrupar por tipo de delito
const crimeMap = nearbyReports.reduce((acc, report) => {
  acc[report.crimeType] = (acc[report.crimeType] || 0) + 1;
  return acc;
}, {});

console.log('Delitos en la zona:', crimeMap);
// { robo: 5, hurto: 3, vandalismo: 2, ... }
```

---

## ⚠️ Consideraciones Importantes

### 1. **Anonimato**
- Los reportes pueden ser anónimos (userId opcional)
- Se recomienda no incluir información personal en la descripción

### 2. **Verificación**
- Los reportes pasan por estados: `pending` → `in_investigation` → `verified`
- Las autoridades pueden marcar reportes como `dismissed` si son falsos

### 3. **Privacidad**
- Las coordenadas se redondean al geoHash más cercano
- Se protege la ubicación exacta del reportante

### 4. **Evidencias**
- Puedes adjuntar fotos/videos después de crear el reporte
- Endpoint: `POST /reports/:id/evidence` (próximamente)

---

## 🎯 Próximos Endpoints

```
POST /reports/:id/evidence        # Subir evidencias (fotos/videos)
GET /reports/statistics           # Estadísticas de delitos
GET /reports/heatmap              # Datos para mapa de calor
POST /reports/:id/verify          # Verificar reporte (autoridades)
```

---

**Última actualización:** 2025-01-15  
**Versión:** 2.0.0 (Sistema de Delitos)
