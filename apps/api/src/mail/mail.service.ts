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
    
    // Log verification URL in development for quick debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 DEVELOPMENT DEBUG - Email Verification');
      console.log('📧 Email:', email);
      console.log('👤 Name:', name);
      console.log('🔗 Verification URL:', verificationUrl);
      console.log('💡 Click this URL to verify the email address\n');
    }

    try {
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
    } catch (error) {
      console.error('Failed to send verification email with template, trying fallback:', error);

      // Fallback to plain HTML email if template fails
      try {
        console.log('🔄 Using fallback HTML email (template failed)');
        
        const fallbackHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hi ${name},</h2>
            <p>Welcome to CryptoTracker! Please verify your email address by clicking the link below:</p>
            <p><a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a></p>
            <p>Or copy and paste this link: ${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `;

        await this.mailerService.sendMail({
          to: email,
          subject: 'Verify your CryptoTracker email address',
          html: fallbackHtml,
        });
      } catch (fallbackError) {
        console.error('Fallback email also failed:', fallbackError);
        throw new Error(`Failed to send verification email: ${error.message}`);
      }
    }
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