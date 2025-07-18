import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResult> {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerificationToken: uuidv4(),
      emailVerified: false,
      role: UserRole.USER,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    // TODO: Send verification email
    await this.sendVerificationEmail(savedUser);

    return {
      ...tokens,
      user: this.sanitizeUser(savedUser),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResult> {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive', 'emailVerified'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Note: We allow unverified users to log in and prompt them to verify within the app
    // This provides a consistent experience whether they just registered or are logging back in

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    // Invalidate refresh tokens (implement token blacklist if needed)
    await this.userRepository.update(userId, {
      refreshToken: null,
    });

    return { message: 'Logged out successfully' };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: {
          id: payload.sub,
          refreshToken,
          isActive: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If an account with that email exists, we sent a reset link' };
    }

    const resetToken = uuidv4();
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1); // 1 hour expiry

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    });

    // TODO: Send reset email
    await this.sendPasswordResetEmail(user, resetToken);

    return { message: 'If an account with that email exists, we sent a reset link' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user || !user.passwordResetExpiry || user.passwordResetExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
    });

    return { message: 'Password reset successfully' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = uuidv4();
    await this.userRepository.update(userId, {
      emailVerificationToken: verificationToken,
    });

    const userWithToken = Object.assign(user, { emailVerificationToken: verificationToken });
    await this.sendVerificationEmail(userWithToken);

    return { message: 'Verification email sent' };
  }

  async socialLogin(socialUser: any): Promise<AuthResult> {
    const { email, firstName, lastName, provider, providerId, username } = socialUser;

    let user: User;

    if (provider === 'telegram') {
      // For Telegram, look up by provider and providerId since no email is provided
      user = await this.userRepository.findOne({ 
        where: { 
          authProvider: provider,
          authProviderId: providerId 
        } 
      });

      if (!user) {
        // Create new Telegram user without email
        user = this.userRepository.create({
          email: `telegram_${providerId}@ptracker.local`, // Generate a unique email identifier
          firstName,
          lastName,
          emailVerified: true, // Consider Telegram accounts as verified
          role: UserRole.USER,
          isActive: true,
          authProvider: provider,
          authProviderId: providerId,
        });

        user = await this.userRepository.save(user);
      }
    } else {
      // For other providers (Google, Facebook) that provide email
      user = await this.userRepository.findOne({ where: { email } });

      if (!user) {
        // Create new user
        user = this.userRepository.create({
          email,
          firstName,
          lastName,
          emailVerified: true, // Social accounts are pre-verified
          role: UserRole.USER,
          isActive: true,
          authProvider: provider,
          authProviderId: providerId,
        });

        user = await this.userRepository.save(user);
      } else {
        // Link social account if not already linked
        if (!user.authProvider || user.authProviderId !== providerId) {
          await this.userRepository.update(user.id, {
            authProvider: provider,
            authProviderId: providerId,
          });
        }
      }
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async connectWallet(walletData: any): Promise<{ message: string; nonce: string }> {
    // Generate nonce for wallet signature verification
    const nonce = uuidv4();
    
    // Store nonce temporarily (use Redis in production)
    // For now, return it for client to sign
    
    return {
      message: 'Please sign this message to verify wallet ownership',
      nonce,
    };
  }

  async verifyWalletSignature(verificationData: any): Promise<AuthResult> {
    const { address, signature, nonce, network } = verificationData;

    // TODO: Implement wallet signature verification based on network
    // For now, mock the verification

    let user = await this.userRepository.findOne({
      where: { walletAddress: address },
    });

    if (!user) {
      // Create new user with wallet
      user = this.userRepository.create({
        walletAddress: address,
        walletNetwork: network,
        emailVerified: true, // Wallet users don't need email verification
        role: UserRole.USER,
        isActive: true,
        authProvider: 'wallet',
      });

      user = await this.userRepository.save(user);
    }

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });

    return user || null;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email || '',
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token
    await this.userRepository.update(user.id, { refreshToken });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, passwordResetToken, emailVerificationToken, refreshToken, ...sanitized } = user;
    return sanitized;
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    try {
      await this.mailService.sendEmailVerification(
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.emailVerificationToken,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Log error but don't fail registration
    }
  }

  private async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    try {
      await this.mailService.sendPasswordReset(
        user.email,
        `${user.firstName} ${user.lastName}`,
        resetToken,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Log error but don't fail the request
    }
  }

  async requestEmailChange(userId: string, newEmail: string): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if new email is already in use
    const existingUser = await this.usersService.findByEmail(newEmail);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Generate email change token
    const token = uuidv4();
    
    // Store the token and new email
    // Direct repository update to bypass DTO validation
    await this.userRepository.update(userId, {
      emailVerificationToken: token,
      // TODO: Add a pendingEmail field to store the new email
    });

    // Send confirmation email to the NEW email address
    await this.sendEmailChangeConfirmation(newEmail, user.firstName || 'User', token);

    return { message: 'Email change confirmation sent to new email address' };
  }

  async confirmEmailChange(token: string): Promise<{ message: string; user: User }> {
    // Find user by email verification token
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Update the user's email
    // Note: You would need to store the pending email somewhere
    // For now, this is a placeholder implementation
    await this.userRepository.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
      // TODO: Update email field with the pending email
    });

    const updatedUser = await this.usersService.findOne(user.id);

    return { 
      message: 'Email changed successfully',
      user: updatedUser
    };
  }

  private async sendEmailChangeConfirmation(newEmail: string, userName: string, token: string): Promise<void> {
    try {
      // You would need to add this method to your mail service
      await this.mailService.sendEmailVerification(
        newEmail,
        userName,
        token,
      );
    } catch (error) {
      console.error('Failed to send email change confirmation:', error);
      throw new InternalServerErrorException('Failed to send confirmation email');
    }
  }
}