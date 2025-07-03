#!/bin/bash

# Setup test database with migrations for CryptoTracker API tests

set -e

echo "🏗️  Setting up test database with migrations..."

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-ptracker_test}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if PostgreSQL is running (try Unix socket first, then TCP)
if ! pg_isready -U $DB_USERNAME >/dev/null 2>&1; then
    if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USERNAME >/dev/null 2>&1; then
        print_error "PostgreSQL is not running or not accessible"
        print_status "Please ensure PostgreSQL is running on ${DB_HOST}:${DB_PORT} or via Unix socket"
        exit 1
    fi
    USE_TCP=true
else
    USE_TCP=false
fi

print_success "PostgreSQL is running"

# Drop and recreate test database for clean state
print_status "Dropping and recreating test database..."

# First, terminate any active connections to the test database
if [ "$USE_TCP" = true ]; then
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null || true
        PGPASSWORD=$DB_PASSWORD dropdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME $DB_NAME --if-exists 2>/dev/null || true
        PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME $DB_NAME
    else
        psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null || true
        dropdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME $DB_NAME --if-exists 2>/dev/null || true
        createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME $DB_NAME
    fi
else
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD=$DB_PASSWORD psql -U $DB_USERNAME -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null || true
        PGPASSWORD=$DB_PASSWORD dropdb -U $DB_USERNAME $DB_NAME --if-exists 2>/dev/null || true
        PGPASSWORD=$DB_PASSWORD createdb -U $DB_USERNAME $DB_NAME
    else
        psql -U $DB_USERNAME -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();" 2>/dev/null || true
        dropdb -U $DB_USERNAME $DB_NAME --if-exists 2>/dev/null || true
        createdb -U $DB_USERNAME $DB_NAME
    fi
fi

print_success "Test database '$DB_NAME' created"

# Create UUID extension
print_status "Setting up database extensions..."

if [ "$USE_TCP" = true ]; then
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >/dev/null 2>&1
    else
        psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >/dev/null 2>&1
    fi
else
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD=$DB_PASSWORD psql -U $DB_USERNAME -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >/dev/null 2>&1
    else
        psql -U $DB_USERNAME -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >/dev/null 2>&1
    fi
fi

print_success "Database extensions configured"

# Run migrations
print_status "Running migrations on test database..."

# Set environment variables for test database
export DB_HOST=$DB_HOST
export DB_PORT=$DB_PORT
export DB_USERNAME=$DB_USERNAME
export DB_PASSWORD=$DB_PASSWORD
export DB_NAME=$DB_NAME

# Run migrations using test data source
node -r ts-node/register ../../node_modules/typeorm/cli.js migration:run -d src/database/test-data-source-migrations.js

if [ $? -eq 0 ]; then
    print_success "Migrations applied successfully"
else
    print_error "Failed to apply migrations"
    exit 1
fi

echo
print_success "🎉 Test database setup with migrations complete!"
echo
print_status "Database details:"
echo "  • Host: $DB_HOST"
echo "  • Port: $DB_PORT"
echo "  • Database: $DB_NAME"
echo "  • Username: $DB_USERNAME"
echo
print_status "You can now run the API tests:"
echo "  • npm run test:migration-based"
echo "  • npm run test:e2e:migration-based"
echo