#!/bin/bash

# Setup test database for CryptoTracker API tests

set -e

echo "🏗️  Setting up test database..."

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

# Create test database if it doesn't exist
print_status "Creating test database if it doesn't exist..."

if [ "$USE_TCP" = true ]; then
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME $DB_NAME 2>/dev/null || true
    else
        createdb -h $DB_HOST -p $DB_PORT -U $DB_USERNAME $DB_NAME 2>/dev/null || true
    fi
else
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD=$DB_PASSWORD createdb -U $DB_USERNAME $DB_NAME 2>/dev/null || true
    else
        createdb -U $DB_USERNAME $DB_NAME 2>/dev/null || true
    fi
fi

# Check if database was created or already exists
if [ "$USE_TCP" = true ]; then
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "SELECT version();" >/dev/null 2>&1
    else
        psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME -c "SELECT version();" >/dev/null 2>&1
    fi
else
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD=$DB_PASSWORD psql -U $DB_USERNAME -d $DB_NAME -c "SELECT version();" >/dev/null 2>&1
    else
        psql -U $DB_USERNAME -d $DB_NAME -c "SELECT version();" >/dev/null 2>&1
    fi
fi

if [ $? -eq 0 ]; then
    print_success "Test database '$DB_NAME' is ready"
else
    print_error "Failed to connect to test database '$DB_NAME'"
    exit 1
fi

# Create UUID extension if it doesn't exist
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

echo
print_success "🎉 Test database setup complete!"
echo
print_status "Database details:"
echo "  • Host: $DB_HOST"
echo "  • Port: $DB_PORT"
echo "  • Database: $DB_NAME"
echo "  • Username: $DB_USERNAME"
echo
print_status "You can now run the API tests:"
echo "  • npm run test"
echo "  • npm run test:e2e"
echo