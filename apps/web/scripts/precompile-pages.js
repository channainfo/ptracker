#!/usr/bin/env node

/**
 * Script to precompile all pages during development
 * This helps reduce the lazy compilation delay when navigating between pages
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to find all page files
function findPageFiles(dir, pages = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.next', '.git', 'public'].includes(file.name)) {
        findPageFiles(fullPath, pages);
      }
    } else if (file.name === 'page.tsx' || file.name === 'page.ts') {
      // Convert file path to route path
      const routePath = fullPath
        .replace(path.join(process.cwd(), 'src/app'), '')
        .replace('/page.tsx', '')
        .replace('/page.ts', '')
        .replace(/\\/g, '/') // Convert Windows paths to Unix
        || '/';
      
      pages.push(routePath);
    }
  }
  
  return pages;
}

// Function to make HTTP requests to precompile pages
async function precompilePages() {
  const appDir = path.join(process.cwd(), 'src/app');
  
  if (!fs.existsSync(appDir)) {
    console.log('❌ App directory not found. Make sure you are in the correct directory.');
    return;
  }

  const pages = findPageFiles(appDir);
  
  console.log(`🚀 Found ${pages.length} pages to precompile:`);
  pages.forEach(page => console.log(`   - ${page}`));
  
  console.log('\n⏳ Precompiling pages...');
  
  const baseUrl = 'http://localhost:3900';
  const fetch = (await import('node-fetch')).default;
  
  for (const page of pages) {
    try {
      const url = `${baseUrl}${page}`;
      console.log(`📄 Precompiling: ${page}`);
      
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to avoid downloading full content
        timeout: 5000
      });
      
      if (response.ok) {
        console.log(`✅ ${page} - compiled successfully`);
      } else {
        console.log(`⚠️  ${page} - status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${page} - error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Precompilation complete!');
}

// Check if Next.js dev server is running
async function checkDevServer() {
  try {
    const fetch = (await import('node-fetch')).default;
    await fetch('http://localhost:3900');
    return true;
  } catch {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔄 Checking if Next.js dev server is running...');
  
  const isRunning = await checkDevServer();
  
  if (!isRunning) {
    console.log('❌ Next.js dev server is not running on port 3900.');
    console.log('💡 Start it with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Dev server is running');
  
  // Wait a bit for the server to be fully ready
  console.log('⏳ Waiting for server to be ready...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await precompilePages();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { precompilePages, findPageFiles };