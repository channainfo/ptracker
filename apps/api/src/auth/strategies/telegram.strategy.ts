import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';

const CustomStrategy = require('passport-custom').Strategy;

interface TelegramAuthData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
  [key: string]: string | undefined;
}

@Injectable()
export class TelegramStrategy extends PassportStrategy(CustomStrategy, 'telegram') {
  constructor(private configService: ConfigService) {
    super();
  }

  async validate(req: any): Promise<any> {
    // Handle both POST body and GET query parameters
    const authData = (req.body && Object.keys(req.body).length > 0) 
      ? req.body as TelegramAuthData
      : req.query as TelegramAuthData;
    
    console.log('Telegram validation - authData:', authData);
    console.log('Bot token configured:', !!this.configService.get('TELEGRAM_BOT_TOKEN'));
    
    try {
      this.validateTelegramAuth(authData);
    } catch (error) {
      console.error('Telegram validation error:', error);
      throw new UnauthorizedException('Invalid Telegram authentication data');
    }

    const user = {
      provider: 'telegram',
      providerId: authData.id,
      firstName: authData.first_name || '',
      lastName: authData.last_name || '',
      username: authData.username,
      photoUrl: authData.photo_url,
      email: null, // Telegram doesn't provide email
    };

    return user;
  }

  private validateTelegramAuth(authData: TelegramAuthData): void {
    const botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    if (!this.validateHash(authData, botToken)) {
      throw new Error("Invalid hash");
    }

    if (!this.validateAuthDate(authData)) {
      throw new Error("Invalid auth date");
    }
  }

  private calculateHash(authData: TelegramAuthData, botToken: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hash, ...dataToCheck } = authData;

    console.log("authData: ", dataToCheck);

    const dataCheckString = Object.keys(dataToCheck)
      .sort()
      .map((key) => `${key}=${dataToCheck[key]}`)
      .join("\n");

    console.log("dataCheckString: ", dataCheckString);
    console.log("botToken: ", botToken);

    const secretKey = createHash("sha256").update(botToken).digest();
    const result = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    return result;
  }

  private validateHash(authData: TelegramAuthData, botToken: string): boolean {
    const { hash } = authData;
    const calculatedHash = this.calculateHash(authData, botToken);

    console.log("Calculated Hash:", calculatedHash);
    console.log("Expected Hash:", hash);

    return hash == calculatedHash;
  }

  private validateAuthDate(authData: TelegramAuthData): boolean {
    const authDate = parseInt(authData["auth_date"]);
    const now = Math.floor(Date.now() / 1000);

    const max5mn = 5 * 60; // 5 minutes

    return now - authDate <= max5mn;
  }
}