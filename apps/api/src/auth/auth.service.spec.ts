import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '../mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockMailService = {
    sendEmailVerification: jest.fn(),
    sendPasswordReset: jest.fn(),
    sendWelcomeEmail: jest.fn(),
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.USER,
    isActive: true,
    emailVerified: true,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpiry: null,
    refreshToken: null,
    authProvider: null,
    authProviderId: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    walletAddress: null,
    walletNetwork: null,
    tier: null,
    lastLoginAt: null,
    loginCount: 0,
    profilePicture: null,
    bio: null,
    timezone: null,
    language: null,
    notificationPreferences: null,
    privacySettings: null,
    knowledgeScore: 0,
    investmentScore: 0,
    reputationScore: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    getFullName: () => 'John Doe',
    getDisplayName: () => 'John Doe',
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should register a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword' as never));

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login user successfully', async () => {
      const userWithPassword = { ...mockUser, password: 'hashedPassword' };
      mockUserRepository.findOne.mockResolvedValue(userWithPassword);
      mockJwtService.sign.mockReturnValue('mock-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true as never));

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const userWithPassword = { ...mockUser, password: 'hashedPassword' };
      mockUserRepository.findOne.mockResolvedValue(userWithPassword);

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false as never));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should allow login for unverified email but return unverified user', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false, password: 'hashedPassword' };
      mockUserRepository.findOne.mockResolvedValue(unverifiedUser);
      mockJwtService.sign.mockReturnValue('mock-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true as never));

      const result = await service.login(loginDto);
      
      expect(result).toBeDefined();
      expect(result.user.emailVerified).toBe(false);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const payload = { sub: mockUser.id, email: mockUser.email, role: mockUser.role };
      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('new-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password request', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.forgotPassword('test@example.com');

      expect(result.message).toContain('reset link');
      expect(userRepository.update).toHaveBeenCalled();
    });

    it('should return same message for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result.message).toContain('reset link');
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-token',
      newPassword: 'NewPassword123!',
    };

    it('should reset password successfully', async () => {
      const userWithResetToken = {
        ...mockUser,
        passwordResetToken: 'valid-token',
        passwordResetExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      };
      mockUserRepository.findOne.mockResolvedValue(userWithResetToken);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('newHashedPassword' as never));

      const result = await service.resetPassword(resetPasswordDto);

      expect(result.message).toBe('Password reset successfully');
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 12);
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for expired token', async () => {
      const userWithExpiredToken = {
        ...mockUser,
        passwordResetToken: 'valid-token',
        passwordResetExpiry: new Date(Date.now() - 3600000), // 1 hour ago
      };
      mockUserRepository.findOne.mockResolvedValue(userWithExpiredToken);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const userWithVerificationToken = {
        ...mockUser,
        emailVerificationToken: 'valid-token',
        emailVerified: false,
      };
      mockUserRepository.findOne.mockResolvedValue(userWithVerificationToken);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toBe('Email verified successfully');
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        emailVerified: true,
        emailVerificationToken: null,
      });
    });

    it('should throw BadRequestException for invalid token', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      const payload = { sub: mockUser.id, email: mockUser.email, role: mockUser.role };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(payload);

      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid user', async () => {
      const payload = { sub: 'invalid-id', email: 'test@example.com', role: UserRole.USER };
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(payload);

      expect(result).toBeNull();
    });
  });

  describe('socialLogin', () => {
    it('should create new user for social login', async () => {
      const socialUser = {
        email: 'social@example.com',
        firstName: 'Social',
        lastName: 'User',
        provider: 'google',
        providerId: 'google-123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('social-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      const result = await service.socialLogin(socialUser);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('social-token');
    });

    it('should login existing user for social login', async () => {
      const socialUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        provider: 'google',
        providerId: 'google-123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockJwtService.sign.mockReturnValue('social-token');
      mockConfigService.get.mockReturnValue('mock-secret');

      const result = await service.socialLogin(socialUser);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('social-token');
    });
  });
});