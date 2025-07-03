#!/usr/bin/env node

/**
 * Node.js wrapper for migration testing
 * Handles argument passing from npm scripts to the shell script
 */

const { spawn } = require('child_process');
const path = require('path');

// Get migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
    console.error('❌ Error: Migration name is required');
    console.log('Usage: npm run test:migration MigrationName');
    console.log('Example: npm run test:migration AddUserIndex');
    process.exit(1);
}

// Path to the shell script
const scriptPath = path.join(__dirname, 'test-migration.sh');

// Execute the shell script with the migration name
const child = spawn('bash', [scriptPath, migrationName], {
    stdio: 'inherit',
    cwd: path.dirname(__dirname)
});

child.on('close', (code) => {
    process.exit(code);
});

child.on('error', (error) => {
    console.error('❌ Error executing migration test:', error.message);
    process.exit(1);
});