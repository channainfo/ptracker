import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

/**
 * Example test migration - adds an index to improve query performance
 * This is a safe migration that can be used for testing the migration system
 */
export class AddUserEmailIndex1751220000000 implements MigrationInterface {
    name = 'AddUserEmailIndex1751220000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add an index on the email column for better performance
        // This is a safe operation that won't affect existing data
        await queryRunner.createIndex('users', new TableIndex({
            name: 'IDX_users_email_performance',
            columnNames: ['email']
        }));
        
        console.log('✅ Added performance index on users.email');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the index
        await queryRunner.dropIndex('users', 'IDX_users_email_performance');
        
        console.log('✅ Removed performance index on users.email');
    }
}

/**
 * To test this migration:
 * 
 * 1. Copy this file to src/database/migrations/ with proper timestamp
 * 2. Run: npm run test:migration AddUserEmailIndex
 * 3. The test will verify:
 *    - Migration applies successfully
 *    - Application works with new schema
 *    - Migration can be rolled back
 *    - Application works after rollback
 *    - Migration can be re-applied
 */