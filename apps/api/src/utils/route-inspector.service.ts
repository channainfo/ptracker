import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';

interface RouteInfo {
  method: string;
  path: string;
  controller: string;
  handler: string;
}

@Injectable()
export class RouteInspectorService implements OnModuleInit {
  private routes: RouteInfo[] = [];

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  onModuleInit() {
    this.scanRoutes();
  }

  private scanRoutes() {
    const server = this.httpAdapterHost.httpAdapter.getHttpServer();
    const router = server._events.request._router;
    
    if (router && router.stack) {
      this.routes = router.stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => {
          const route = layer.route;
          const methods = Object.keys(route.methods)
            .filter(method => route.methods[method])
            .map(method => method.toUpperCase());
          
          return methods.map(method => ({
            method,
            path: route.path,
            controller: this.extractControllerName(route.path),
            handler: 'unknown', // Express doesn't provide handler info directly
          }));
        })
        .flat()
        .sort((a: RouteInfo, b: RouteInfo) => 
          a.path.localeCompare(b.path) || a.method.localeCompare(b.method)
        );
    }
  }

  private extractControllerName(path: string): string {
    const parts = path.split('/').filter(Boolean);
    // Skip api/v1 prefix
    return parts[2] || 'root';
  }

  getRoutes(): RouteInfo[] {
    return this.routes;
  }

  getRoutesByController(controllerName: string): RouteInfo[] {
    return this.routes.filter(route => 
      route.controller.toLowerCase() === controllerName.toLowerCase()
    );
  }

  getRoutesByMethod(method: string): RouteInfo[] {
    return this.routes.filter(route => 
      route.method === method.toUpperCase()
    );
  }

  printRoutes(): void {
    console.log('\n=== Application Routes ===\n');
    
    const groupedRoutes = this.routes.reduce((acc, route) => {
      if (!acc[route.controller]) {
        acc[route.controller] = [];
      }
      acc[route.controller].push(route);
      return acc;
    }, {} as Record<string, RouteInfo[]>);

    Object.keys(groupedRoutes).sort().forEach(controller => {
      console.log(`\n[${controller.toUpperCase()}]`);
      groupedRoutes[controller].forEach(route => {
        console.log(`  ${route.method.padEnd(7)} ${route.path}`);
      });
    });

    console.log(`\nTotal routes: ${this.routes.length}`);
  }

  exportRoutesToJson(): string {
    return JSON.stringify(this.routes, null, 2);
  }
}