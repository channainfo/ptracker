import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.test',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config: any = {
          type: 'postgres',
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', ''),
          database: configService.get('DB_NAME', 'ptracker_test'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: false, // Disable auto-sync to avoid conflicts
          dropSchema: false, // Don't drop schema automatically
          logging: false,
        };

        // Only add host/port if they are provided, otherwise use Unix socket
        const host = configService.get('DB_HOST');
        if (host && host !== '') {
          config.host = host;
          config.port = parseInt(configService.get('DB_PORT', '5432'));
        }

        return config;
      },
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseTestModule {}