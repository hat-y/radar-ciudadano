// Modulos Externos
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

// Modulos Internos
import ormConfig from '../../../orm.config';
import { User } from '../../users/user.entity';

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
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      user.username = faker.internet.username({ firstName, lastName });
      user.email = faker.internet.email({ firstName, lastName });
      user.isActive = faker.datatype.boolean();
      user.emailVerified = true; // Los usuarios del seed están pre-verificados
      // No password needed - passwordless authentication
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
