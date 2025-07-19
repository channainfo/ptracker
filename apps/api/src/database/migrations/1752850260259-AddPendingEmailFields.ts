import { MigrationInterface, QueryRunner } from "typeorm"

export class AddPendingEmailFields1752850260259 implements MigrationInterface {
    name = 'AddPendingEmailFields1752850260259'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if fields already exist (in case schema sync was used)
        const tableExists = await queryRunner.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'pending_email'
        `);
        
        if (tableExists.length === 0) {
            // Add pending email fields to users table
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD "pending_email" character varying
            `);
            
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD "pending_email_token" character varying
            `);
            
            await queryRunner.query(`
                ALTER TABLE "users" 
                ADD "pending_email_expiry" TIMESTAMP
            `);
            
            console.log('✅ Added pending email fields to users table');
        } else {
            console.log('⚠️  Pending email fields already exist, skipping table modifications');
        }
        
        // Add comments for documentation (safe to run multiple times)
        await queryRunner.query(`
            COMMENT ON COLUMN "users"."pending_email" IS 'New email address awaiting verification'
        `);
        
        await queryRunner.query(`
            COMMENT ON COLUMN "users"."pending_email_token" IS 'Token for email change verification'
        `);
        
        await queryRunner.query(`
            COMMENT ON COLUMN "users"."pending_email_expiry" IS 'Expiry time for email change token (24 hours)'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove pending email fields from users table
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "pending_email_expiry"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "pending_email_token"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "pending_email"
        `);
    }

}
