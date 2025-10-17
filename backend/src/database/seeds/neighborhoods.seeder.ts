import { DataSource } from 'typeorm';
import { Neighborhood } from '../../locations/entities/neighborhood.entity';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Seeder para migrar barrios desde barrios_formosa_capital.json a PostgreSQL
 * 
 * Uso:
 *   npm run seed:neighborhoods
 */

interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    nombre_barrio: string;
    provincia: string;
    departamento: string;
    localidad: string;
  };
  geometry: {
    type: 'Point' | 'Polygon';
    coordinates: number[] | number[][][]; // Point: [lng, lat] | Polygon: [[[lng, lat], ...]]
  };
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export async function seedNeighborhoods(dataSource: DataSource) {
  console.log('\n==================================================');
  console.log('NEIGHBORHOODS SEEDER - Migrating from JSON to PostgreSQL');
  console.log('==================================================\n');

  const neighborhoodRepo = dataSource.getRepository(Neighborhood);

  try {
    // 1. Cargar el archivo JSON
    console.log('Loading barrios_formosa_capital.json...');
    
    const possiblePaths = [
      path.join(process.cwd(), 'barrios_formosa_capital.json'),
      path.join(process.cwd(), '..', 'barrios_formosa_capital.json'),
      path.join(__dirname, '..', '..', '..', 'barrios_formosa_capital.json'),
    ];

    let jsonData: string | null = null;
    let filePath: string | null = null;

    for (const possiblePath of possiblePaths) {
      try {
        jsonData = await fs.readFile(possiblePath, 'utf-8');
        filePath = possiblePath;
        console.log(`   [SUCCESS] Found JSON at: ${possiblePath}\n`);
        break;
      } catch {
        continue;
      }
    }

    if (!jsonData || !filePath) {
      console.error('   [ERROR] Could not find barrios_formosa_capital.json');
      console.error('   Tried paths:');
      possiblePaths.forEach((p) => console.error(`     - ${p}`));
      return;
    }

    // 2. Parsear GeoJSON
    const geojson: GeoJSONCollection = JSON.parse(jsonData);
    console.log(`Found ${geojson.features.length} neighborhoods in GeoJSON\n`);

    // 3. Limpiar tabla existente (opcional)
    const existingCount = await neighborhoodRepo.count();
    if (existingCount > 0) {
      console.log(`Clearing ${existingCount} existing neighborhoods...`);
      await neighborhoodRepo.clear();
      console.log('   [SUCCESS] Table cleared\n');
    }

    // 4. Insertar cada barrio
    console.log('Inserting neighborhoods into database...\n');
    let successCount = 0;
    let errorCount = 0;

    for (const feature of geojson.features) {
      try {
        const { nombre_barrio, provincia, departamento, localidad } = feature.properties;

        let polygon: number[][];
        let center: { lat: number; lng: number };
        let geoBounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };

        // Verificar si es Point o Polygon
        if (feature.geometry.type === 'Point') {
          // Es un punto - generar polígono aproximado (cuadrado de ~500m alrededor del punto)
          const [lng, lat] = feature.geometry.coordinates as number[];
          const offset = 0.005; // Aproximadamente 500 metros

          // Crear polígono cuadrado alrededor del punto
          polygon = [
            [lng - offset, lat - offset], // Esquina inferior izquierda
            [lng + offset, lat - offset], // Esquina inferior derecha
            [lng + offset, lat + offset], // Esquina superior derecha
            [lng - offset, lat + offset], // Esquina superior izquierda
            [lng - offset, lat - offset], // Cerrar polígono
          ];

          center = { lat, lng };
          geoBounds = {
            minLat: lat - offset,
            maxLat: lat + offset,
            minLng: lng - offset,
            maxLng: lng + offset,
          };

          console.log(`   ⚠ ${nombre_barrio}: Point detected, generated approximate polygon`);
        } else {
          // Es un polígono real - usar coordenadas del GeoJSON
          polygon = (feature.geometry.coordinates as number[][][])[0];

          // Calcular bounding box
          const lngs = polygon.map((coord) => coord[0]);
          const lats = polygon.map((coord) => coord[1]);
          geoBounds = {
            minLat: Math.min(...lats),
            maxLat: Math.max(...lats),
            minLng: Math.min(...lngs),
            maxLng: Math.max(...lngs),
          };

          // Calcular centro (centroide simple)
          center = {
            lng: (geoBounds.minLng + geoBounds.maxLng) / 2,
            lat: (geoBounds.minLat + geoBounds.maxLat) / 2,
          };
        }

        // Crear neighborhood
        const neighborhood = neighborhoodRepo.create({
          name: nombre_barrio,
          polygon,
          provincia,
          departamento,
          localidad,
          geoBounds,
          center,
        });

        await neighborhoodRepo.save(neighborhood);
        successCount++;
        console.log(`   ✓ ${nombre_barrio}`);
      } catch (error) {
        errorCount++;
        console.error(`   ✗ ${feature.properties.nombre_barrio}: ${error.message}`);
      }
    }

    // 5. Resumen
    console.log('\n==================================================');
    console.log('SEEDING COMPLETED!');
    console.log('==================================================');
    console.log(`Total neighborhoods in JSON: ${geojson.features.length}`);
    console.log(`Successfully inserted: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('==================================================\n');

  } catch (error) {
    console.error('[FATAL] Seeding failed:', error);
    throw error;
  }
}

// Script standalone para ejecutar el seeder directamente
async function runSeeder() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'postgres_db',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: true,
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('   [SUCCESS] Database connected\n');

    await seedNeighborhoods(dataSource);

    console.log('Closing database connection...');
    await dataSource.destroy();
    console.log('   [SUCCESS] Connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('[FATAL] Seeder failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSeeder();
}
