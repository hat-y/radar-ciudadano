// Modulos Externos
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

// Modulos Internos
import ormConfig from '../../../orm.config';
import { User } from '../../users/user.entity';

dotenv.config();

async function seed() {
  const dataSource = new DataSource(ormConfig as any);
  await dataSource.initialize();

  if (dataSource.isInitialized) {
    console.log('Database connected for seeding.');

    const userRepository = dataSource.getRepository(User);
    const usersToCreate = 10;
    const users: User[] = [];

    for (let i = 0; i < usersToCreate; i++) {
      const user = new User();
      user.firstName = faker.person.firstName();
      user.lastName = faker.person.lastName();
      user.email = faker.internet.email({
        firstName: user.firstName,
        lastName: user.lastName,
      });
      user.isActive = faker.datatype.boolean();
      user.password = 'password123'; // Default password for seeded users
      users.push(user);
    }

    await userRepository.save(users);
    console.log(`${usersToCreate} users created.`);
    await dataSource.destroy();
    console.log('Database connection closed.');
  } else {
    console.error('Failed to connect to database for seeding.');
  }
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
