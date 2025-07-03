# Database Migration Guide

This guide explains how to use TypeORM migrations with the CryptoTracker API.

## Available Commands

### Run Migrations
Execute all pending migrations:
```bash
npm run migration:run
```

### Generate Migration
Generate a migration based on entity changes:
```bash
npm run migration:generate -- src/database/migrations/YourMigrationName
```

### Revert Migration
Revert the last executed migration:
```bash
npm run migration:revert
```

### Schema Sync
Synchronize database schema with entities (development only):
```bash
npm run schema:sync
```

### Test Migration
Test a migration safely before applying to production:
```bash
npm run test:migration MigrationName
```

### Create Empty Migration
Create an empty migration file for custom SQL:
```bash
npm run migration:create -- src/database/migrations/YourMigrationName
```

### Verify Database Schema
Check current database state and identify potential issues:
```bash
npm run db:verify
```

## Migration Workflow

### 1. Development Workflow
During development, you can use schema synchronization:
```bash
# This automatically updates the database schema
npm run schema:sync
```

### 2. Production Workflow
For production, always use migrations:

1. **Make entity changes** in your `*.entity.ts` files
2. **Generate migration** to capture the changes:
   ```bash
   npm run migration:generate -- src/database/migrations/AddNewFeature
   ```
3. **Review the generated migration** in `src/database/migrations/`
4. **Run the migration**:
   ```bash
   npm run migration:run
   ```

### 3. Example Migration Generation

After adding a new column to an entity:

```bash
# Generate migration for the new column
npm run migration:generate -- src/database/migrations/AddUserLastLoginColumn

# Review the generated file
cat src/database/migrations/*-AddUserLastLoginColumn.ts

# Test the migration safely
npm run test:migration AddUserLastLoginColumn

# If test passes, run the migration
npm run migration:run
```

### 4. Migration Testing Workflow

Before applying any migration to production:

```bash
# 1. Test the migration thoroughly
npm run test:migration YourMigrationName

# 2. Verify database state
npm run db:verify

# 3. Test with real data (staging environment)
# ... deploy to staging and test ...

# 4. Apply to production
npm run migration:run
```

## Migration Files

Migration files are stored in `src/database/migrations/` and follow this naming pattern:
```
{timestamp}-{MigrationName}.ts
```

Example:
```
1751211146572-InitialSchema.ts
1751212000000-AddUserLastLoginColumn.ts
```

## Environment Configuration

The migration commands use the data source configuration from `src/database/data-source.js`, which reads from your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_NAME=ptracker
```

## Best Practices

### 1. Always Review Generated Migrations
Generated migrations should be reviewed before execution:
- Check that the SQL is correct
- Ensure no data loss will occur
- Add any necessary data transformations

### 2. Backup Before Production Migrations
Always backup your production database before running migrations:
```bash
pg_dump -h localhost -U postgres ptracker > backup_$(date +%Y%m%d).sql
```

### 3. Test Migrations
Test migrations on a copy of production data:
1. Restore production backup to test environment
2. Run migrations
3. Verify data integrity
4. Test application functionality

### 4. Migration Rollback Plan
Always have a rollback plan:
- Keep the previous migration available
- Test the revert process
- Have database backup ready

## Common Issues

### Issue: "No changes found"
```
No changes in database schema were found - cannot generate a migration
```

**Solution**: This means your entities match the database schema. If you need an empty migration:
```bash
npx typeorm migration:create src/database/migrations/YourMigrationName
```

### Issue: "Cannot find module 'ts-node'"
**Solution**: The issue was fixed by updating the TypeORM CLI command. If you still see this, ensure ts-node is installed:
```bash
npm install ts-node --save-dev
```

### Issue: Migration fails in production
**Solutions**:
1. Check database permissions
2. Verify connection settings
3. Ensure migration order is correct
4. Check for conflicting database changes

## Environment-Specific Configurations

### Development
- Use `npm run schema:sync` for rapid development
- Migrations are optional but recommended for team collaboration

### Staging/Production
- **Always use migrations**
- Never use schema synchronization
- Test migrations thoroughly before production deployment

## Data Source Configuration

The migration system uses `src/database/data-source.js`:

```javascript
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ptracker',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});
```

This ensures migrations work consistently across all environments.

## Migration Testing Features

### Automated Migration Testing

The `npm run test:migration` command provides comprehensive testing:

**What it tests:**
- ✅ Migration applies successfully
- ✅ Application starts with new schema  
- ✅ Migration can be rolled back
- ✅ Application works after rollback
- ✅ Migration can be re-applied

**How it works:**
1. Creates backup of current database
2. Creates test database with current data
3. Applies migration to test database
4. Tests application startup
5. Tests migration rollback
6. Tests application after rollback
7. Cleans up test database
8. Restores original environment

**Usage:**
```bash
# Test a specific migration
npm run test:migration AddUserLastLoginColumn

# The script will output detailed progress and results
```

### Database Schema Verification

The `npm run db:verify` command provides detailed database analysis:

**What it reports:**
- 📊 All database tables
- 🔗 Indexes and their usage
- 🔗 Foreign key constraints
- 📝 Applied migrations history
- ⚠️ Potential issues (unused indexes, missing PKs)

**Usage:**
```bash
# Verify current database schema
npm run db:verify

# Use before and after migrations to compare state
npm run db:verify > before.txt
npm run migration:run
npm run db:verify > after.txt
diff before.txt after.txt
```

### Example Test Migration

See `src/database/test-migration-example.ts` for a safe test migration that adds a performance index. This can be used to test the migration system without affecting data.

### Migration Safety Checklist

Before running any migration in production:

- [ ] Migration tested with `npm run test:migration`
- [ ] Database verified with `npm run db:verify`
- [ ] Migration reviewed for data safety
- [ ] Backup created and verified
- [ ] Rollback plan documented
- [ ] Staging environment tested
- [ ] Team notified of maintenance window
- [ ] Migration applied during low-traffic period

## Troubleshooting Migration Tests

### Test Database Creation Fails
**Error:** `createdb: could not connect to database`
**Solution:** Ensure PostgreSQL is running and credentials are correct

### Permission Denied
**Error:** `permission denied to create database`
**Solution:** Grant createdb permission to your user:
```sql
ALTER USER postgres CREATEDB;
```

### Test Takes Too Long
**Error:** Application startup test timeouts
**Solution:** Increase timeout in the test script or check for blocking operations

### Rollback Fails
**Error:** Migration rollback produces errors
**Solution:** Review the `down()` method in your migration file for correctness