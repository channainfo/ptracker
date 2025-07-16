import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch, 
  Options, 
  Head, 
  All 
} from '@nestjs/common';
import { MODULE_PATH, PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';

interface RouteInfo {
  method: string;
  path: string;
  controller: string;
  handler: string;
}

async function exploreRoutes() {
  const app = await NestFactory.create(AppModule, { logger: false });
  
  const routes: RouteInfo[] = [];
  const globalPrefix = 'api/v1'; // Your global prefix from main.ts
  
  // Get all controllers
  const controllers = app.get('HttpServer')._events.request._router.stack
    .filter((layer: any) => layer.route)
    .map((layer: any) => layer.route);

  // Alternative approach using module exploration
  const modules = (app as any).container.getModules();
  
  modules.forEach((module: any) => {
    const controllers = module.controllers;
    
    controllers.forEach((controller: any) => {
      const instance = controller.instance;
      const prototype = Object.getPrototypeOf(instance);
      const controllerPath = Reflect.getMetadata(PATH_METADATA, controller.metatype) || '';
      
      // Get all methods of the controller
      const methodNames = Object.getOwnPropertyNames(prototype)
        .filter(method => method !== 'constructor');
      
      methodNames.forEach(methodName => {
        const routePath = Reflect.getMetadata(PATH_METADATA, prototype[methodName]);
        const routeMethod = Reflect.getMetadata(METHOD_METADATA, prototype[methodName]);
        
        if (routePath !== undefined && routeMethod !== undefined) {
          const fullPath = `/${globalPrefix}/${controllerPath}/${routePath}`
            .replace(/\/+/g, '/') // Remove duplicate slashes
            .replace(/\/$/, ''); // Remove trailing slash
          
          routes.push({
            method: getMethodName(routeMethod),
            path: fullPath || '/',
            controller: controller.metatype.name,
            handler: methodName,
          });
        }
      });
    });
  });

  // Sort and display routes
  console.log('\n=== Route Explorer ===\n');
  console.log('Method  | Path                                          | Controller           | Handler');
  console.log('--------|-----------------------------------------------|---------------------|----------------');
  
  routes
    .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))
    .forEach(route => {
      console.log(
        `${route.method.padEnd(7)} | ${route.path.padEnd(45)} | ${route.controller.padEnd(20)} | ${route.handler}`
      );
    });
  
  console.log(`\nTotal routes: ${routes.length}`);
  
  await app.close();
}

function getMethodName(method: number): string {
  const methods: { [key: number]: string } = {
    0: 'GET',
    1: 'POST',
    2: 'PUT',
    3: 'DELETE',
    4: 'PATCH',
    5: 'OPTIONS',
    6: 'HEAD',
    7: 'ALL',
  };
  return methods[method] || 'UNKNOWN';
}

// Run the explorer
exploreRoutes().catch(console.error);