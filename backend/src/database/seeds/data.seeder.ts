// Modulos Externos
import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as ngeohash from 'ngeohash';

// Cargar variables de entorno (priorizar .env.local si existe)
config({ path: resolve(__dirname, '../../../.env.local') });
config({ path: resolve(__dirname, '../../../.env') });

// Modulos Internos
import { User } from '../../users/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';
import { Report, CrimeType, ReportSeverity, ReportStatus } from '../../reports/entities/report.entity';
import { Location } from '../../locations/entities/location.entity';
import { Evidence } from '../../reports/entities/evidence.entity';

// Coordenadas de Formosa Capital (dentro de barrios conocidos)
const FORMOSA_COORDINATES = {
  minLat: -26.20,
  maxLat: -26.17,
  minLng: -58.19,
  maxLng: -58.17,
};

// Coordenadas fuera de Formosa Capital (sin barrios)
const OUTSIDE_COORDINATES = [
  { lat: -26.35, lng: -58.30 }, // Sur de Formosa
  { lat: -26.10, lng: -58.05 }, // Este de Formosa
  { lat: -26.25, lng: -58.40 }, // Oeste de Formosa
  { lat: -25.90, lng: -58.20 }, // Norte de Formosa
];

// Tipos de crímenes con sus severidades
const CRIME_TYPES = [
  { type: CrimeType.HURTO, severity: ReportSeverity.MEDIA },
  { type: CrimeType.ROBO, severity: ReportSeverity.ALTA },
  { type: CrimeType.ROBO_VEHICULO, severity: ReportSeverity.ALTA },
  { type: CrimeType.ROBO_DOMICILIO, severity: ReportSeverity.ALTA },
  { type: CrimeType.VANDALISMO, severity: ReportSeverity.MEDIA },
  { type: CrimeType.ASESINATO, severity: ReportSeverity.CRITICA },
  { type: CrimeType.LESIONES, severity: ReportSeverity.ALTA },
  { type: CrimeType.AMENAZAS, severity: ReportSeverity.MEDIA },
  { type: CrimeType.SECUESTRO, severity: ReportSeverity.CRITICA },
  { type: CrimeType.ABUSO_SEXUAL, severity: ReportSeverity.CRITICA },
  { type: CrimeType.VIOLENCIA_GENERO, severity: ReportSeverity.ALTA },
  { type: CrimeType.ACTIVIDAD_SOSPECHOSA, severity: ReportSeverity.BAJA },
  { type: CrimeType.OTRO, severity: ReportSeverity.BAJA },
];

// Descripciones de ejemplo por tipo de crimen
const CRIME_DESCRIPTIONS: Record<CrimeType, string[]> = {
  [CrimeType.HURTO]: [
    'Sustrajeron una bicicleta del frente de la casa',
    'Robaron celular en transporte público',
    'Hurto de cartera en la plaza',
    'Sustracción de cables de cobre',
  ],
  [CrimeType.ROBO]: [
    'Robo a mano armada en la calle',
    'Asaltaron comercio con arma blanca',
    'Robo con violencia en la vía pública',
    'Despojaron de pertenencias a transeúnte',
  ],
  [CrimeType.ROBO_VEHICULO]: [
    'Robo de motocicleta estacionada',
    'Sustrajeron vehículo con llave falsa',
    'Robo de auto a punta de pistola',
    'Desarmaron vehículo en la calle',
  ],
  [CrimeType.ROBO_DOMICILIO]: [
    'Ingresaron a la vivienda y sustrajeron objetos de valor',
    'Robo en domicilio durante la noche',
    'Entraron por ventana y robaron electrodomésticos',
    'Forzaron puerta principal y robaron',
  ],
  [CrimeType.VANDALISMO]: [
    'Daño a propiedad privada con pintura',
    'Rompieron vidrios del local comercial',
    'Grafitis en paredes del edificio',
    'Daño intencional a vehículo estacionado',
  ],
  [CrimeType.ASESINATO]: [
    'Homicidio con arma de fuego',
    'Encontraron cuerpo sin vida',
    'Asesinato en riña callejera',
    'Homicidio en ajuste de cuentas',
  ],
  [CrimeType.LESIONES]: [
    'Agresión física con lesiones graves',
    'Golpearon a persona en la vía pública',
    'Lesiones por pelea entre vecinos',
    'Agresión con objeto contundente',
  ],
  [CrimeType.AMENAZAS]: [
    'Amenazas de muerte por mensaje',
    'Intimidación con arma blanca',
    'Amenazas verbales reiteradas',
    'Acoso y amenazas por redes sociales',
  ],
  [CrimeType.SECUESTRO]: [
    'Privación ilegítima de la libertad',
    'Secuestro express para extorsión',
    'Retención de persona contra su voluntad',
    'Secuestro en zona céntrica',
  ],
  [CrimeType.ABUSO_SEXUAL]: [
    'Abuso sexual denunciado por víctima',
    'Acoso sexual en transporte público',
    'Agresión sexual en vía pública',
    'Abuso denunciado por testigos',
  ],
  [CrimeType.VIOLENCIA_GENERO]: [
    'Violencia doméstica denunciada',
    'Agresión física por violencia de género',
    'Amenazas y violencia en contexto de pareja',
    'Lesiones por violencia machista',
  ],
  [CrimeType.ACTIVIDAD_SOSPECHOSA]: [
    'Personas sospechosas merodeando la zona',
    'Movimientos extraños en horario nocturno',
    'Actividad inusual en el barrio',
    'Comportamiento sospechoso reportado por vecinos',
  ],
  [CrimeType.OTRO]: [
    'Incidente no categorizado',
    'Situación irregular en el barrio',
    'Evento que requiere atención policial',
    'Actividad ilegal no especificada',
  ],
};

function getRandomCoordinate(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(6));
}

function getRandomDescription(crimeType: CrimeType): string {
  const descriptions = CRIME_DESCRIPTIONS[crimeType];
  return faker.helpers.arrayElement(descriptions);
}

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'mirage',
    entities: [User, Report, Location, Evidence],
    synchronize: false,
    logging: false,
  });
  
  await dataSource.initialize();

  if (!dataSource.isInitialized) {
    console.error('Failed to connect to database for seeding.');
    return;
  }

  console.log('\n==================================================');
  console.log('Database connected for seeding.\n');

  const userRepository = dataSource.getRepository(User);
  const reportRepository = dataSource.getRepository(Report);
  const locationRepository = dataSource.getRepository(Location);

  try {
    // ========== 1. CREAR USUARIO ADMIN (JEFATURA) ==========
    console.log('Creating admin user...');
    
    const existingAdmin = await userRepository.findOne({ 
      where: { email: 'admin@admin.com' } 
    });

    let adminUser: User;
    if (existingAdmin) {
      console.log('   [INFO] Admin user already exists');
      adminUser = existingAdmin;
    } else {
      adminUser = userRepository.create({
        email: 'admin@admin.com',
        username: 'admin',
        role: UserRole.JEFATURA,
        isActive: true,
        emailVerified: true,
        deleted: false,
      });
      await userRepository.save(adminUser);
      console.log('   [SUCCESS] Admin user created: admin@admin.com (Role: JEFATURA)\n');
    }

    // ========== 2. CREAR USUARIOS NORMALES ==========
    console.log('Creating regular users...');
    const usersToCreate = 5;
    const users: User[] = [];

    for (let i = 0; i < usersToCreate; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      const user = userRepository.create({
        username: faker.internet.username({ firstName, lastName }),
        email: faker.internet.email({ firstName, lastName }),
        role: UserRole.USER,
        isActive: faker.datatype.boolean(0.9), // 90% activos
        emailVerified: true,
        deleted: false,
      });
      users.push(user);
    }

    const savedUsers = await userRepository.save(users);
    console.log(`   [SUCCESS] ${usersToCreate} regular users created\n`);

    // Combinar admin + usuarios normales
    const allUsers = [adminUser, ...savedUsers];

    // ========== 3. CREAR REPORTES EN ZONAS CON BARRIOS ==========
    console.log('Creating reports inside neighborhoods (Formosa Capital)...');
    const reportsInside = 30;
    const insideReports: Report[] = [];

    for (let i = 0; i < reportsInside; i++) {
      // Coordenadas aleatorias dentro de Formosa Capital
      const lat = getRandomCoordinate(FORMOSA_COORDINATES.minLat, FORMOSA_COORDINATES.maxLat);
      const lng = getRandomCoordinate(FORMOSA_COORDINATES.minLng, FORMOSA_COORDINATES.maxLng);
      const geoHash = ngeohash.encode(lat, lng, 12);

      // Crime type y severity
      const crime = faker.helpers.arrayElement(CRIME_TYPES);
      const description = getRandomDescription(crime.type);
      const title = `${crime.type.charAt(0).toUpperCase() + crime.type.slice(1)} - ${faker.location.street()}`;

      // Crear ubicación
      const location = locationRepository.create({
        lat,
        lng,
        geoHash,
        localidad: 'Formosa',
        provincia: 'Formosa',
        departamento: 'Formosa',
      });
      const savedLocation = await locationRepository.save(location);

      // Crear reporte
      const report = reportRepository.create({
        title,
        description,
        lat,
        lng,
        crimeType: crime.type,
        severity: crime.severity,
        status: faker.helpers.arrayElement([
          ReportStatus.PENDING,
          ReportStatus.IN_INVESTIGATION,
          ReportStatus.VERIFIED,
          ReportStatus.RESOLVED,
          ReportStatus.DISMISSED,
        ]),
        locationId: savedLocation.id,
        userId: faker.helpers.arrayElement(allUsers).id,
        viewCount: faker.number.int({ min: 0, max: 150 }),
        upvotes: faker.number.int({ min: 0, max: 50 }),
        localidad: 'Formosa',
        provincia: 'Formosa',
        departamento: 'Formosa',
      });

      insideReports.push(report);
    }

    await reportRepository.save(insideReports);
    console.log(`   [SUCCESS] ${reportsInside} reports created inside neighborhoods\n`);

    // ========== 4. CREAR REPORTES FUERA DE BARRIOS ==========
    console.log('Creating reports outside neighborhoods...');
    const reportsOutside = 10;
    const outsideReports: Report[] = [];

    for (let i = 0; i < reportsOutside; i++) {
      // Coordenadas fuera de Formosa Capital
      const coords = faker.helpers.arrayElement(OUTSIDE_COORDINATES);
      const lat = coords.lat + getRandomCoordinate(-0.05, 0.05); // Variación ±5km
      const lng = coords.lng + getRandomCoordinate(-0.05, 0.05);
      const geoHash = ngeohash.encode(lat, lng, 12);

      const crime = faker.helpers.arrayElement(CRIME_TYPES);
      const description = getRandomDescription(crime.type);
      const title = `${crime.type.charAt(0).toUpperCase() + crime.type.slice(1)} - Zona rural`;

      // Crear ubicación sin barrio
      const location = locationRepository.create({
        lat,
        lng,
        geoHash,
        provincia: 'Formosa',
      });
      const savedLocation = await locationRepository.save(location);

      // Crear reporte sin barrio
      const report = reportRepository.create({
        title,
        description,
        lat,
        lng,
        crimeType: crime.type,
        severity: crime.severity,
        status: faker.helpers.arrayElement([
          ReportStatus.PENDING,
          ReportStatus.VERIFIED,
        ]),
        locationId: savedLocation.id,
        userId: faker.helpers.arrayElement(allUsers).id,
        viewCount: faker.number.int({ min: 0, max: 50 }),
        upvotes: faker.number.int({ min: 0, max: 10 }),
        provincia: 'Formosa',
      });

      outsideReports.push(report);
    }

    await reportRepository.save(outsideReports);
    console.log(`   [SUCCESS] ${reportsOutside} reports created outside neighborhoods\n`);

    // ========== RESUMEN ==========
    console.log('=' .repeat(50));
    console.log('SEEDING COMPLETED SUCCESSFULLY!\n');
    console.log('Summary:');
    console.log(`   - 1 Admin user (JEFATURA): admin@admin.com`);
    console.log(`   - ${usersToCreate} Regular users (USER role)`);
    console.log(`   - ${reportsInside} Reports inside neighborhoods`);
    console.log(`   - ${reportsOutside} Reports outside neighborhoods`);
    console.log(`   - Total: ${reportsInside + reportsOutside} reports`);
    console.log('=' .repeat(50) + '\n');

  } catch (error) {
    console.error('[ERROR] Seeding failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('Database connection closed.');
  }
}

seed().catch((error) => {
  console.error('[FATAL] Fatal error during seeding:', error);
  process.exit(1);
});
