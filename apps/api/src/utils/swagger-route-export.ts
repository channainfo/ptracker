import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import * as fs from 'fs';
import * as path from 'path';

async function exportSwaggerRoutes() {
  const app = await NestFactory.create(AppModule, { logger: false });
  
  // Apply the same Swagger configuration as in main.ts
  const config = new DocumentBuilder()
    .setTitle('CryptoTracker API')
    .setDescription('Smart crypto portfolio and education platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('portfolio', 'Portfolio management')
    .addTag('market-data', 'Market data and prices')
    .addTag('sentiment', 'Market sentiment analysis')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Extract routes from Swagger document
  console.log('\n=== Swagger API Routes ===\n');
  
  const paths = document.paths;
  const routes: any[] = [];
  
  Object.keys(paths).forEach(path => {
    const pathItem = paths[path];
    Object.keys(pathItem).forEach(method => {
      if (['get', 'post', 'put', 'delete', 'patch', 'options', 'head'].includes(method)) {
        const operation = pathItem[method];
        routes.push({
          method: method.toUpperCase(),
          path: path,
          summary: operation.summary || '',
          tags: operation.tags || [],
          security: operation.security || [],
        });
      }
    });
  });
  
  // Display routes grouped by tag
  const tags = [...new Set(routes.flatMap(r => r.tags))].sort();
  
  tags.forEach(tag => {
    console.log(`\n[${tag.toUpperCase()}]`);
    routes
      .filter(route => route.tags.includes(tag))
      .sort((a, b) => a.path.localeCompare(b.path))
      .forEach(route => {
        const auth = route.security.length > 0 ? '🔒' : '  ';
        console.log(`${auth} ${route.method.padEnd(7)} ${route.path.padEnd(45)} ${route.summary}`);
      });
  });
  
  // Routes without tags
  const untaggedRoutes = routes.filter(r => r.tags.length === 0);
  if (untaggedRoutes.length > 0) {
    console.log('\n[UNTAGGED]');
    untaggedRoutes.forEach(route => {
      const auth = route.security.length > 0 ? '🔒' : '  ';
      console.log(`${auth} ${route.method.padEnd(7)} ${route.path.padEnd(45)} ${route.summary}`);
    });
  }
  
  console.log(`\n=== Total routes: ${routes.length} ===`);
  
  // Export to JSON file
  const outputPath = path.join(__dirname, '../../swagger-routes.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`\nSwagger document exported to: ${outputPath}`);
  
  await app.close();
}

exportSwaggerRoutes().catch(console.error);