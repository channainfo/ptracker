import { Module, Global } from '@nestjs/common';
import { RouteInspectorService } from './route-inspector.service';

@Global()
@Module({
  providers: [RouteInspectorService],
  exports: [RouteInspectorService],
})
export class RouteInspectorModule {}