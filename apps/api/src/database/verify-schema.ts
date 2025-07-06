#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Schema verification script
 * Checks database state and reports on tables, columns, indexes, and constraints
 */
async function verifySchema() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'ptracker',
        synchronize: false,
        logging: false,
    });

    try {
        console.log('🔍 Verifying database schema...\n');
        
        await dataSource.initialize();
        
        // Check tables
        const tables = await dataSource.query(`
            SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        console.log('📊 Tables:');
        tables.forEach((table: any) => {
            console.log(`  ✅ ${table.table_name}`);
        });
        console.log(`  Total: ${tables.length} tables\n`);
        
        // Check indexes
        const indexes = await dataSource.query(`
            SELECT 
                schemaname,
                tablename,
                indexname,
                indexdef
            FROM pg_indexes 
            WHERE schemaname = 'public'
            AND indexname NOT LIKE '%_pkey'
            ORDER BY tablename, indexname
        `);
        
        console.log('🔗 Indexes (excluding primary keys):');
        if (indexes.length === 0) {
            console.log('  (No custom indexes found)');
        } else {
            indexes.forEach((index: any) => {
                console.log(`  ✅ ${index.tablename}.${index.indexname}`);
            });
        }
        console.log(`  Total: ${indexes.length} indexes\n`);
        
        // Check foreign keys
        const foreignKeys = await dataSource.query(`
            SELECT
                tc.table_name as source_table,
                kcu.column_name as source_column,
                ccu.table_name AS target_table,
                ccu.column_name AS target_column,
                tc.constraint_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            ORDER BY tc.table_name, kcu.column_name
        `);
        
        console.log('🔗 Foreign Key Constraints:');
        foreignKeys.forEach((fk: any) => {
            console.log(`  ✅ ${fk.source_table}.${fk.source_column} → ${fk.target_table}.${fk.target_column}`);
        });
        console.log(`  Total: ${foreignKeys.length} foreign keys\n`);
        
        // Check migrations table
        const migrations = await dataSource.query(`
            SELECT id, timestamp, name 
            FROM migrations 
            ORDER BY timestamp DESC 
            LIMIT 10
        `);
        
        console.log('📝 Recent Migrations:');
        if (migrations.length === 0) {
            console.log('  (No migrations found)');
        } else {
            migrations.forEach((migration: any) => {
                const date = new Date(migration.timestamp).toLocaleString();
                console.log(`  ✅ ${migration.name} (${date})`);
            });
        }
        console.log(`  Total: ${migrations.length} migrations applied\n`);
        
        // Check for potential issues
        console.log('⚠️  Potential Issues:');
        
        // Check for tables without primary keys
        const tablesWithoutPK = await dataSource.query(`
            SELECT table_name
            FROM information_schema.tables t
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND NOT EXISTS (
                SELECT 1 
                FROM information_schema.table_constraints tc
                WHERE tc.table_name = t.table_name
                AND tc.table_schema = 'public'
                AND tc.constraint_type = 'PRIMARY KEY'
            )
        `);
        
        if (tablesWithoutPK.length > 0) {
            console.log('  ⚠️  Tables without primary keys:');
            tablesWithoutPK.forEach((table: any) => {
                console.log(`    - ${table.table_name}`);
            });
        }
        
        // Check for unused indexes (this is a simplified check)
        const unusedIndexes = await dataSource.query(`
            SELECT schemaname, relname as tablename, indexrelname as indexname
            FROM pg_stat_user_indexes
            WHERE schemaname = 'public'
            AND idx_scan = 0
            AND indexrelname NOT LIKE '%_pkey'
        `);
        
        if (unusedIndexes.length > 0) {
            console.log('  ⚠️  Potentially unused indexes:');
            unusedIndexes.forEach((index: any) => {
                console.log(`    - ${index.tablename}.${index.indexname}`);
            });
        }
        
        if (tablesWithoutPK.length === 0 && unusedIndexes.length === 0) {
            console.log('  ✅ No issues detected');
        }
        
        console.log('\n✅ Schema verification complete!');
        
    } catch (error) {
        console.error('❌ Error verifying schema:', error);
        process.exit(1);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

// Run if called directly
if (require.main === module) {
    verifySchema();
}

export { verifySchema };