import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { config } from 'dotenv';

// Load environment variables
config();

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

async function verifySeededData() {
  console.log('🔍 Verifying seeded data...');
  
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    const userRepository = AppDataSource.getRepository(User);
    
    // Count total demo users
    const totalDemoUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :pattern', { pattern: '%@cryptotracker.demo' })
      .getCount();
    
    // Count verified users
    const verifiedUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :pattern', { pattern: '%@cryptotracker.demo' })
      .andWhere('user.emailVerified = :verified', { verified: true })
      .getCount();
    
    // Count 2FA enabled users
    const twoFactorUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :pattern', { pattern: '%@cryptotracker.demo' })
      .andWhere('user.twoFactorEnabled = :enabled', { enabled: true })
      .getCount();
    
    // Count active users
    const activeUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :pattern', { pattern: '%@cryptotracker.demo' })
      .andWhere('user.isActive = :active', { active: true })
      .getCount();
    
    // Get sample users
    const sampleUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.email LIKE :pattern', { pattern: '%@cryptotracker.demo' })
      .orderBy('user.email', 'ASC')
      .limit(10)
      .getMany();

    console.log('\n📊 Seed Data Verification Results:');
    console.log('=====================================');
    console.log(`👥 Total Demo Users: ${totalDemoUsers}`);
    console.log(`✅ Email Verified: ${verifiedUsers} (${((verifiedUsers/totalDemoUsers)*100).toFixed(1)}%)`);
    console.log(`🔒 2FA Enabled: ${twoFactorUsers} (${((twoFactorUsers/totalDemoUsers)*100).toFixed(1)}%)`);
    console.log(`🟢 Active Users: ${activeUsers} (${((activeUsers/totalDemoUsers)*100).toFixed(1)}%)`);
    
    console.log('\n📧 Sample User Emails:');
    console.log('======================');
    sampleUsers.forEach((user, index) => {
      const status = [
        user.emailVerified ? '✅' : '❌',
        user.twoFactorEnabled ? '🔒' : '🔓',
        user.isActive ? '🟢' : '🔴'
      ].join(' ');
      console.log(`${index + 1}. ${user.email} ${status}`);
    });
    
    console.log('\n🔐 Login Instructions:');
    console.log('======================');
    console.log('Password for ALL users: Pass!047-Crypto');
    console.log('Email pattern: [firstname].[lastname][number]@cryptotracker.demo');
    
    if (totalDemoUsers === 470) {
      console.log('\n🎉 Seed verification PASSED! All 470 users found.');
    } else {
      console.log(`\n⚠️  Expected 470 users, found ${totalDemoUsers}`);
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
    process.exit(0);
  }
}

// Run the verification
verifySeededData();