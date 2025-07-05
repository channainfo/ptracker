import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST'),
          port: parseInt(configService.get('SMTP_PORT', '587')),
          secure: configService.get('SMTP_SECURE') === 'true', // true for 465, false for other ports
          auth: configService.get('SMTP_USER') ? {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          } : undefined,
          tls: {
            rejectUnauthorized: false, // Allow self-signed certificates in development
          },
          ignoreTLS: ['localhost', '127.0.0.1'].includes(configService.get('SMTP_HOST')),
        },
        defaults: {
          from: configService.get('SMTP_FROM', '"CryptoTracker" <noreply@cryptotracker.com>'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}