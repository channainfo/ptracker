#!/bin/bash

# Migration Testing Script
# Usage: ./scripts/test-migration.sh [migration-name]

set -e

MIGRATION_NAME=$1
TEST_DB_NAME="ptracker_migration_test"
BACKUP_FILE="migration_test_backup_$(date +%Y%m%d_%H%M%S).sql"
ORIGINAL_DB_NAME=$(grep "DB_NAME=" .env | cut -d'=' -f2)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Migration Testing Script${NC}"
echo "=================================="

if [ -z "$MIGRATION_NAME" ]; then
    echo -e "${RED}❌ Error: Migration name is required${NC}"
    echo ""
    echo "Usage: ./scripts/test-migration.sh [migration-name]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/test-migration.sh AddUserEmailIndex"
    echo "  ./scripts/test-migration.sh UpdatePortfolioSchema"
    echo ""
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: Please run this script from the API root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Testing migration: $MIGRATION_NAME${NC}"
echo ""

# Step 1: Backup current database
echo -e "${BLUE}📦 Step 1: Creating database backup...${NC}"
pg_dump -h localhost -U postgres "$ORIGINAL_DB_NAME" > "$BACKUP_FILE" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${RED}❌ Failed to create backup${NC}"
    exit 1
fi

# Step 2: Create test database
echo -e "${BLUE}🗄️  Step 2: Creating test database...${NC}"
createdb -h localhost -U postgres "$TEST_DB_NAME" 2>/dev/null || true
psql -h localhost -U postgres -d "$TEST_DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" > /dev/null 2>&1

# Step 3: Restore backup to test database
echo -e "${BLUE}📥 Step 3: Restoring data to test database...${NC}"
psql -h localhost -U postgres -d "$TEST_DB_NAME" < "$BACKUP_FILE" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Data restored to test database${NC}"
else
    echo -e "${RED}❌ Failed to restore data${NC}"
    cleanup_and_exit 1
fi

# Step 4: Update environment to use test database
echo -e "${BLUE}⚙️  Step 4: Configuring test environment...${NC}"
cp .env .env.backup
sed -i.tmp "s/DB_NAME=$ORIGINAL_DB_NAME/DB_NAME=$TEST_DB_NAME/" .env
echo -e "${GREEN}✅ Environment configured for testing${NC}"

# Step 5: Run the migration
echo -e "${BLUE}🚀 Step 5: Running migration...${NC}"
echo ""
npm run migration:run
MIGRATION_EXIT_CODE=$?

if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migration executed successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Migration failed!${NC}"
    restore_environment
    cleanup_and_exit 1
fi

# Step 6: Verify database state
echo -e "${BLUE}🔍 Step 6: Verifying database state...${NC}"
echo ""

# Check if application can start with new schema
echo -e "${YELLOW}🔄 Testing application startup...${NC}"
timeout 15s npm run start > /dev/null 2>&1 &
APP_PID=$!
sleep 10

if kill -0 $APP_PID 2>/dev/null; then
    kill $APP_PID 2>/dev/null
    echo -e "${GREEN}✅ Application starts successfully with new schema${NC}"
else
    echo -e "${RED}❌ Application failed to start with new schema${NC}"
    restore_environment
    cleanup_and_exit 1
fi

# Step 7: Test migration rollback
echo -e "${BLUE}⏪ Step 7: Testing migration rollback...${NC}"
echo ""
npm run migration:revert
ROLLBACK_EXIT_CODE=$?

if [ $ROLLBACK_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Migration rollback successful!${NC}"
else
    echo -e "${RED}❌ Migration rollback failed!${NC}"
    restore_environment
    cleanup_and_exit 1
fi

# Step 8: Test rollback application startup
echo -e "${BLUE}🔄 Step 8: Testing application after rollback...${NC}"
timeout 15s npm run start > /dev/null 2>&1 &
APP_PID=$!
sleep 10

if kill -0 $APP_PID 2>/dev/null; then
    kill $APP_PID 2>/dev/null
    echo -e "${GREEN}✅ Application works after rollback${NC}"
else
    echo -e "${RED}❌ Application failed after rollback${NC}"
    restore_environment
    cleanup_and_exit 1
fi

# Step 9: Re-apply migration for final test
echo -e "${BLUE}🔁 Step 9: Re-applying migration for final verification...${NC}"
npm run migration:run > /dev/null 2>&1

# Cleanup and summary
restore_environment
cleanup_test_db

echo ""
echo -e "${GREEN}🎉 Migration Testing Complete!${NC}"
echo "=================================="
echo -e "${GREEN}✅ Migration applies successfully${NC}"
echo -e "${GREEN}✅ Application works with new schema${NC}"
echo -e "${GREEN}✅ Migration rollback works${NC}"
echo -e "${GREEN}✅ Application works after rollback${NC}"
echo -e "${GREEN}✅ Migration can be re-applied${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Review the migration SQL in the generated file"
echo "2. Test with real production data (if needed)"
echo "3. Apply to staging environment"
echo "4. Apply to production environment"
echo ""
echo -e "${YELLOW}💾 Backup file preserved: $BACKUP_FILE${NC}"

# Helper functions
function restore_environment() {
    if [ -f ".env.backup" ]; then
        mv .env.backup .env
        rm -f .env.tmp
        echo -e "${BLUE}🔄 Environment restored${NC}"
    fi
}

function cleanup_test_db() {
    dropdb -h localhost -U postgres "$TEST_DB_NAME" 2>/dev/null || true
    echo -e "${BLUE}🗑️  Test database cleaned up${NC}"
}

function cleanup_and_exit() {
    local exit_code=$1
    restore_environment
    cleanup_test_db
    echo ""
    echo -e "${RED}❌ Migration testing failed${NC}"
    echo -e "${YELLOW}💾 Original backup preserved: $BACKUP_FILE${NC}"
    exit $exit_code
}