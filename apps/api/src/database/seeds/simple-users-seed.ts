import { DataSource } from 'typeorm';
import { User, UserRole, UserTier } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables
config();

const SALT_ROUNDS = 12;

// User profile templates
const USER_TEMPLATES = [
  { firstNames: ['John', 'Michael', 'David', 'James', 'Robert'], lastNames: ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller'] },
  { firstNames: ['Sarah', 'Jennifer', 'Lisa', 'Jessica', 'Ashley'], lastNames: ['Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas'] },
  { firstNames: ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley'], lastNames: ['Jackson', 'White', 'Harris', 'Martin', 'Thompson'] },
  { firstNames: ['Chris', 'Sam', 'Taylor', 'Jamie', 'Drew'], lastNames: ['Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez'] },
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'cryptotracker',
  entities: [
    'src/users/entities/*.entity.ts',
    'src/portfolio/entities/*.entity.ts'
  ],
  synchronize: false,
  logging: false,
});

export async function seedUsers() {
  console.log('🌱 Starting to seed 470 users...');
  
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    const userRepository = AppDataSource.getRepository(User);
    
    // Check if demo users already exist
    console.log('🔍 Checking for existing demo users...');
    const existingDemoUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :pattern', { pattern: '%@cryptotracker.demo' })
      .getCount();
    
    if (existingDemoUsers > 0) {
      console.log(`⚠️  Found ${existingDemoUsers} existing demo users`);
      console.log('🗑️  Removing existing demo users to avoid duplicates...');
      await userRepository
        .createQueryBuilder()
        .delete()
        .from(User)
        .where('email LIKE :pattern', { pattern: '%@cryptotracker.demo' })
        .execute();
      console.log('✅ Existing demo users removed');
    }

    const hashedPassword = await bcrypt.hash('Pass!047-Crypto', SALT_ROUNDS);
    
    const users: User[] = [];

    for (let i = 1; i <= 470; i++) {
      // Generate user data
      const template = getRandomElement(USER_TEMPLATES);
      const firstName = getRandomElement(template.firstNames);
      const lastName = getRandomElement(template.lastNames);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@cryptotracker.demo`;
      
      const user = userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: UserRole.USER,
        tier: UserTier.NOVICE,
        emailVerified: Math.random() > 0.1, // 90% verified
        twoFactorEnabled: Math.random() > 0.7, // 30% with 2FA
        isActive: Math.random() > 0.05, // 95% active
        lastLoginAt: getRandomDate(new Date('2024-11-01'), new Date()),
        loginCount: Math.floor(Math.random() * 100) + 1,
      });
      users.push(user);

      // Log progress every 50 users
      if (i % 50 === 0) {
        console.log(`✅ Generated ${i}/470 users...`);
      }
    }

    // Save all users in batches
    console.log('💾 Saving users to database...');
    await userRepository.save(users, { chunk: 100 });

    console.log('🎉 Successfully seeded database with:');
    console.log(`   👥 ${users.length} users`);
    console.log(`   🔐 All users password: Pass!047-Crypto`);
    
    console.log('\n📋 Sample User Credentials for Testing:');
    console.log('=====================================');
    console.log('Email: john.smith1@cryptotracker.demo');
    console.log('Email: sarah.wilson47@cryptotracker.demo');
    console.log('Email: alex.jackson123@cryptotracker.demo');
    console.log('Email: jennifer.moore200@cryptotracker.demo');
    console.log('Email: michael.garcia350@cryptotracker.demo');
    console.log('Password (for all users): Pass!047-Crypto');
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

// Run the seeding process
seedUsers();