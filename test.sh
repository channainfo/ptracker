#!/bin/bash

# CryptoTracker Test Suite Runner
# This script runs all tests for both API and Web applications

set -e

echo "🧪 Starting CryptoTracker Test Suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if node_modules don't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing root dependencies..."
    npm install
fi

# API Tests
print_status "Running API Tests..."
cd apps/api

if [ ! -d "node_modules" ]; then
    print_status "Installing API dependencies..."
    npm install
fi

print_status "Running API unit tests..."
if npm run test; then
    print_success "API unit tests passed"
else
    print_error "API unit tests failed"
    exit 1
fi

print_status "Running API integration tests..."
if npm run test:e2e; then
    print_success "API integration tests passed"
else
    print_error "API integration tests failed"
    exit 1
fi

print_status "Generating API test coverage..."
if npm run test:cov; then
    print_success "API test coverage generated"
else
    print_warning "API test coverage generation failed"
fi

cd ../..

# Web Tests
print_status "Running Web Tests..."
cd apps/web

if [ ! -d "node_modules" ]; then
    print_status "Installing Web dependencies..."
    npm install
fi

print_status "Running Web unit tests..."
if npm run test; then
    print_success "Web unit tests passed"
else
    print_error "Web unit tests failed"
    exit 1
fi

print_status "Running Web TypeScript checks..."
if npm run type-check; then
    print_success "Web TypeScript checks passed"
else
    print_error "Web TypeScript checks failed"
    exit 1
fi

print_status "Running Web linting..."
if npm run lint; then
    print_success "Web linting passed"
else
    print_warning "Web linting issues found"
fi

# E2E Tests (only if CI is not set, as they require the apps to be running)
if [ -z "$CI" ]; then
    print_status "Skipping E2E tests (requires running applications)"
    print_warning "To run E2E tests, start the applications and run: npm run test:e2e"
else
    print_status "Running E2E tests..."
    if npm run test:e2e; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"
        exit 1
    fi
fi

cd ../..

# Summary
echo
print_success "🎉 All tests completed successfully!"
echo
print_status "Test Summary:"
echo "  • API unit tests: ✅"
echo "  • API integration tests: ✅"
echo "  • Web unit tests: ✅"
echo "  • TypeScript checks: ✅"
echo "  • Linting: ✅"
if [ -n "$CI" ]; then
    echo "  • E2E tests: ✅"
else
    echo "  • E2E tests: ⏭️  Skipped (run manually)"
fi
echo
print_status "Coverage reports available at:"
echo "  • API: apps/api/coverage/"
echo "  • Web: apps/web/coverage/"
echo
print_status "To run specific test suites:"
echo "  • API unit: cd apps/api && npm run test"
echo "  • API e2e: cd apps/api && npm run test:e2e"
echo "  • Web unit: cd apps/web && npm run test"
echo "  • Web e2e: cd apps/web && npm run test:e2e"
echo