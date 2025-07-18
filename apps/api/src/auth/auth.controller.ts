import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangeEmailDto, ConfirmEmailChangeDto } from './dto/change-email.dto';
import { User } from '../users/entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { TelegramStrategy } from './strategies/telegram.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<any> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<any> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@GetUser() user: User): Promise<any> {
    return this.authService.logout(user.id);
  }

  @Post('refresh')
  @Throttle({ medium: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshTokens(@Body('refreshToken') refreshToken: string): Promise<any> {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('forgot-password')
  @Throttle({ short: { limit: 3, ttl: 300000 } }) // 3 requests per 5 minutes
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<any> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid verification token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<any> {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ short: { limit: 2, ttl: 300000 } }) // 2 requests per 5 minutes
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerification(@GetUser() user: User): Promise<any> {
    console.log('=== RESEND VERIFICATION ENDPOINT HIT ===');
    console.log('User:', user ? user.id : 'undefined');
    console.log('User email:', user ? user.email : 'undefined');
    try {
      const result = await this.authService.resendVerificationEmail(user.id);
      console.log('Resend verification successful:', result);
      return result;
    } catch (error) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile data' })
  async getProfile(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Post('change-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ short: { limit: 2, ttl: 300000 } }) // 2 requests per 5 minutes
  @ApiOperation({ summary: 'Request email change' })
  @ApiResponse({ status: 200, description: 'Email change confirmation sent' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async changeEmail(
    @GetUser() user: User,
    @Body() changeEmailDto: ChangeEmailDto
  ): Promise<any> {
    return this.authService.requestEmailChange(user.id, changeEmailDto.newEmail);
  }

  @Post('confirm-email-change')
  @ApiOperation({ summary: 'Confirm email change with token' })
  @ApiResponse({ status: 200, description: 'Email changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async confirmEmailChange(@Body() confirmDto: ConfirmEmailChangeDto): Promise<any> {
    return this.authService.confirmEmailChange(confirmDto.token);
  }

  // Social authentication endpoints
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  async googleAuth(): Promise<void> {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const result = await this.authService.socialLogin(req.user as any);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${result.accessToken}&refreshToken=${result.refreshToken}`);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Initiate Facebook OAuth' })
  async facebookAuth(): Promise<void> {
    // Redirects to Facebook
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const result = await this.authService.socialLogin(req.user as any);
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${result.accessToken}&refreshToken=${result.refreshToken}`);
  }

  @Post('telegram')
  @UseGuards(AuthGuard('telegram'))
  @ApiOperation({ summary: 'Telegram authentication (POST)' })
  @ApiResponse({ status: 200, description: 'Telegram authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid Telegram authentication data' })
  async telegramAuth(@Req() req: Request): Promise<any> {
    const result = await this.authService.socialLogin(req.user as any);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }

  @Get('telegram')
  @ApiOperation({ summary: 'Telegram authentication (GET redirect)' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with tokens' })
  @ApiResponse({ status: 401, description: 'Invalid Telegram authentication data' })
  async telegramAuthRedirect(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      console.log('Telegram auth GET request received');
      console.log('Query params:', req.query);
      
      // Manually validate Telegram auth data from query parameters
      const telegramStrategy = new TelegramStrategy(this.configService);
      
      // Validate the request manually
      const user = await telegramStrategy.validate(req);
      console.log('Telegram user validated:', user);
      
      // If validation passes, proceed with social login
      const result = await this.authService.socialLogin(user);
      console.log('Social login successful, redirecting...');
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${result.accessToken}&refreshToken=${result.refreshToken}`);
    } catch (error) {
      console.error('Telegram auth error:', error);
      console.error('Error details:', error.message);
      res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=telegram_auth_failed`);
    }
  }

  // Wallet authentication
  @Post('wallet/connect')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Connect crypto wallet' })
  @ApiResponse({ status: 200, description: 'Wallet connected successfully' })
  async connectWallet(@Body() walletData: any): Promise<any> {
    return this.authService.connectWallet(walletData);
  }

  @Post('wallet/verify')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify wallet signature' })
  @ApiResponse({ status: 200, description: 'Wallet verified successfully' })
  async verifyWallet(@Body() verificationData: any): Promise<any> {
    return this.authService.verifyWalletSignature(verificationData);
  }
}