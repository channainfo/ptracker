import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface EmailVerificationContext {
  name: string;
  email: string;
  verificationUrl: string;
}

export interface PasswordResetContext {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

export interface WelcomeEmailContext {
  name: string;
  loginUrl: string;
}

export interface PortfolioAlertContext {
  name: string;
  alertType: string;
  details: {
    symbol?: string;
    name?: string;
    currentPrice?: number;
    priceChange?: number;
    isPositive?: boolean;
    portfolioValue?: number;
    threshold?: string;
    triggeredAt?: string;
  };
  dashboardUrl: string;
}

export interface TransactionConfirmationContext {
  name: string;
  transaction: {
    id?: string;
    type: string;
    symbol?: string;
    quantity?: number;
    price?: number;
    total?: number;
    fees?: number;
    source?: string;
    notes?: string;
    executedAt?: string;
    portfolioId?: string;
  };
  portfolioUrl: string;
}

@Injectable()
export class MailService {
  private readonly baseUrl: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get('APP_URL', 'http://localhost:3000');
  }

  async sendEmailVerification(
    email: string, 
    name: string, 
    token: string
  ): Promise<void> {
    const verificationUrl = `${this.baseUrl}/auth/verify-email?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your CryptoTracker email address',
      template: 'email-verification',
      context: {
        name,
        email,
        verificationUrl,
      } as EmailVerificationContext,
    });
  }

  async sendPasswordReset(
    email: string, 
    name: string, 
    token: string
  ): Promise<void> {
    const resetUrl = `${this.baseUrl}/auth/reset-password?token=${token}`;
    const expiresIn = '1 hour';
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your CryptoTracker password',
      template: 'password-reset',
      context: {
        name,
        resetUrl,
        expiresIn,
      } as PasswordResetContext,
    });
  }

  async sendWelcomeEmail(
    email: string, 
    name: string
  ): Promise<void> {
    const loginUrl = `${this.baseUrl}/auth/login`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to CryptoTracker!',
      template: 'welcome',
      context: {
        name,
        loginUrl,
      } as WelcomeEmailContext,
    });
  }

  async sendPortfolioAlert(
    email: string,
    name: string,
    alertType: string,
    details: PortfolioAlertContext['details']
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: `CryptoTracker Alert: ${alertType}`,
      template: 'portfolio-alert',
      context: {
        name,
        alertType,
        details,
        dashboardUrl: `${this.baseUrl}/dashboard`,
      } as PortfolioAlertContext,
    });
  }

  async sendTransactionConfirmation(
    email: string,
    name: string,
    transaction: TransactionConfirmationContext['transaction']
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Transaction Confirmation - CryptoTracker',
      template: 'transaction-confirmation',
      context: {
        name,
        transaction,
        portfolioUrl: `${this.baseUrl}/portfolio/${transaction.portfolioId}`,
      } as TransactionConfirmationContext,
    });
  }
}