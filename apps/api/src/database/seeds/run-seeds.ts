import { config } from 'dotenv';

// Load environment variables
config();

async function runSeeds() {
  console.log('🌱 Running seed scripts...');
  console.log('Please use the individual seed scripts:');
  console.log('  npm run seed:users    - Seed 470 demo users');
  console.log('  npm run seed:verify   - Verify seeded data');
}

// Run the seeding process
runSeeds();