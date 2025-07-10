import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { INestApplication } from '@nestjs/common';

async function listRoutes() {
  try {
    const app: INestApplication = await NestFactory.create(AppModule, {
      logger: false, // Disable logging for cleaner output
    });

    await app.init();

    console.log('\n=== PTracker API Routes ===\n');
    console.log('Base URL: http://localhost:3001/api/v1\n');

    // Use express-list-endpoints to get routes
    const listEndpoints = (await import('express-list-endpoints')).default;
    const server = app.getHttpServer();
    const routes = listEndpoints(server);

    // Group routes by path prefix
    const groupedRoutes: { [key: string]: any[] } = {};
    
    routes.forEach((route: any) => {
      // Remove /api/v1 prefix for grouping
      const cleanPath = route.path.replace(/^\/api\/v1/, '');
      const pathParts = cleanPath.split('/').filter(Boolean);
      const controller = pathParts[0] || 'root';
      
      if (!groupedRoutes[controller]) {
        groupedRoutes[controller] = [];
      }
      
      groupedRoutes[controller].push({
        path: route.path,
        methods: route.methods.join(', '),
      });
    });

    // Display routes grouped by controller
    Object.keys(groupedRoutes).sort().forEach(controller => {
      console.log(`[${controller.toUpperCase()}]`);
      groupedRoutes[controller]
        .sort((a: any, b: any) => a.path.localeCompare(b.path))
        .forEach(route => {
          console.log(`  ${route.methods.padEnd(12)} ${route.path}`);
        });
      console.log('');
    });

    console.log(`Total Routes: ${routes.length}\n`);

    await app.close();
  } catch (error) {
    console.error('Error listing routes:', error);
    process.exit(1);
  }
}

// Run the script
listRoutes().catch(console.error);