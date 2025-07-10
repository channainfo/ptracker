import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
// Note: You'll need to install express-list-endpoints first
// npm install --save-dev express-list-endpoints

async function listExpressRoutes() {
  try {
    // Dynamically import to handle if package is not installed
    const listEndpoints = (await import('express-list-endpoints')).default;
    
    const app = await NestFactory.create(AppModule, { logger: false });
    const server = app.getHttpServer();
    
    const endpoints = listEndpoints(server);
    
    console.log('\n=== Express Route List ===\n');
    console.log(JSON.stringify(endpoints, null, 2));
    
    // Format output
    console.log('\n=== Formatted Routes ===\n');
    endpoints.forEach((endpoint: any) => {
      console.log(`${endpoint.methods.join(', ').padEnd(10)} ${endpoint.path}`);
      if (endpoint.middlewares.length > 0) {
        console.log(`           Middlewares: ${endpoint.middlewares.join(', ')}`);
      }
    });
    
    console.log(`\nTotal endpoints: ${endpoints.length}`);
    
    await app.close();
  } catch (error) {
    console.error('Error: express-list-endpoints package not found.');
    console.error('Install it with: npm install --save-dev express-list-endpoints');
  }
}

listExpressRoutes().catch(console.error);