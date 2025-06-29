import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2023-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 123.45 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getHealth(): Record<string, any> {
    return this.appService.getHealth();
  }

  @Get()
  @ApiOperation({ summary: 'API root endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'API information',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        version: { type: 'string' },
        documentation: { type: 'string' },
      },
    },
  })
  getHello(): Record<string, string> {
    return this.appService.getHello();
  }
}