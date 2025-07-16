import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function showRoutes() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  const server = app.getHttpServer();
  const router = server._events.request._router;

  console.log('\n=== PTracker API Routes ===\n');
  console.log('Base URL: http://localhost:3001');
  console.log('API Prefix: /api/v1\n');

  const routes = [];
  
  if (router && router.stack) {
    router.stack.forEach((middleware) => {
      if (middleware.route) {
        const methods = Object.keys(middleware.route.methods)
          .filter(method => middleware.route.methods[method])
          .map(method => method.toUpperCase());
        
        routes.push({
          methods: methods.join(', '),
          path: middleware.route.path,
        });
      }
    });
  }

  // Group routes by path
  const groupedRoutes = {};
  routes.forEach(route => {
    const path = route.path;
    if (!groupedRoutes[path]) {
      groupedRoutes[path] = [];
    }
    groupedRoutes[path].push(route.methods);
  });

  // Display routes
  Object.keys(groupedRoutes).sort().forEach(path => {
    const methods = [...new Set(groupedRoutes[path].flat())].join(', ');
    console.log(`${methods.padEnd(15)} /api/v1${path}`);
  });

  await app.close();
}

showRoutes().catch(console.error);