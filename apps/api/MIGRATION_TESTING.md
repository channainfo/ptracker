# Migration Testing Quick Reference

## Available Commands

```bash
# Test a migration safely (recommended before production)
npm run test:migration MigrationName

# Verify current database schema and health
npm run db:verify

# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Create empty migration for custom SQL
npm run migration:create -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Rollback last migration
npm run migration:revert

# Sync schema (development only)
npm run schema:sync
```

## Testing Workflow

### 1. Safe Migration Testing
```bash
# Before applying any migration to production:
npm run test:migration YourMigrationName
```

**This automated test will:**
- ✅ Create backup of current database
- ✅ Test migration application
- ✅ Test application startup with new schema
- ✅ Test migration rollback
- ✅ Test application startup after rollback
- ✅ Cleanup test environment

### 2. Database Health Check
```bash
# Verify database state and identify issues:
npm run db:verify
```

**Reports on:**
- 📊 All database tables
- 🔗 Indexes and foreign keys
- 📝 Migration history
- ⚠️ Potential issues

### 3. Complete Testing Example
```bash
# 1. Generate migration
npm run migration:generate -- src/database/migrations/AddUserIndex

# 2. Review generated migration file
cat src/database/migrations/*AddUserIndex*

# 3. Test migration safely
npm run test:migration AddUserIndex

# 4. Verify database state
npm run db:verify

# 5. Apply to production (if tests pass)
npm run migration:run
```

## Safety Features

### Automated Backup
- Every test creates timestamped backup
- Original data preserved during testing
- Easy restoration if issues occur

### Non-Destructive Testing
- Tests run on copy of production data
- Original database untouched
- Test database automatically cleaned up

### Comprehensive Validation
- Tests both migration and rollback
- Verifies application compatibility
- Checks for schema issues

## Quick Tips

### Before Production Deployment
1. ✅ Run `npm run test:migration`
2. ✅ Run `npm run db:verify`  
3. ✅ Test on staging environment
4. ✅ Create production backup
5. ✅ Apply migration during low traffic

### Development Workflow
```bash
# Quick schema sync for development
npm run schema:sync

# Or use proper migrations for team consistency
npm run migration:generate -- src/database/migrations/FeatureName
npm run test:migration FeatureName
npm run migration:run
```

### Emergency Rollback
```bash
# If migration causes issues in production
npm run migration:revert

# Verify application works after rollback
npm run db:verify
```

## Example Test Output

```
🧪 Migration Testing Script
==================================
📋 Testing migration: AddUserIndex

📦 Step 1: Creating database backup...
✅ Backup created: migration_test_backup_20250703_114523.sql

🗄️  Step 2: Creating test database...
✅ Test database created

📥 Step 3: Restoring data to test database...
✅ Data restored to test database

⚙️  Step 4: Configuring test environment...
✅ Environment configured for testing

🚀 Step 5: Running migration...
✅ Migration executed successfully!

🔍 Step 6: Verifying database state...
✅ Application starts successfully with new schema

⏪ Step 7: Testing migration rollback...
✅ Migration rollback successful!

🔄 Step 8: Testing application after rollback...
✅ Application works after rollback

🔁 Step 9: Re-applying migration for final verification...
✅ Migration can be re-applied

🎉 Migration Testing Complete!
==================================
✅ Migration applies successfully
✅ Application works with new schema
✅ Migration rollback works
✅ Application works after rollback
✅ Migration can be re-applied
```

## Files and Scripts

- `scripts/test-migration.sh` - Main testing script
- `src/database/verify-schema.ts` - Database verification tool
- `src/database/test-migration-example.ts` - Example safe test migration
- `MIGRATION_GUIDE.md` - Complete migration documentation

---

**Need Help?** Check the full [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed documentation.