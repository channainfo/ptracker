import { TestingModule } from '@nestjs/testing';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { TestHelpers } from '../test/test-helpers';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

describe('AuthController Integration Tests', () => {
  let controller: AuthController;
  let service: AuthService;
  let module: TestingModule;
  let dataSource: DataSource;
  let userRepository: Repository<User>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'JWT_SECRET': 'test-secret',
        'JWT_REFRESH_SECRET': 'test-refresh-secret',
        'JWT_EXPIRES_IN': '15m',
        'JWT_REFRESH_EXPIRES_IN': '7d',
      };
      return config[key];
    }),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockMailService = {
    sendEmailVerification: jest.fn(),
    sendPasswordReset: jest.fn(),
    sendWelcomeEmail: jest.fn(),
  };

  beforeAll(async () => {
    module = await TestHelpers.createTestingModule([
      AuthController,
      AuthService,
      JwtService,
      {
        provide: UsersService,
        useValue: mockUsersService,
      },
      {
        provide: ConfigService,
        useValue: mockConfigService,
      },
      {
        provide: MailService,
        useValue: mockMailService,
      },
    ]);

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    dataSource = module.get<DataSource>(DataSource);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  beforeEach(async () => {
    await TestHelpers.cleanDatabase(dataSource);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await controller.register(registerDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.firstName).toBe('John');
      expect(result.user.lastName).toBe('Doe');
      expect(result.user.password).toBeUndefined(); // Should be sanitized

      // Verify user was created in database
      const savedUser = await userRepository.findOne({
        where: { email: 'test@example.com' },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser.emailVerified).toBe(false);
      expect(savedUser.role).toBe(UserRole.USER);
    });

    it('should fail for duplicate email', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      // Register first user
      await controller.register(registerDto);

      // Try to register again with same email
      await expect(controller.register(registerDto)).rejects.toThrow();
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a verified user for login tests
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await controller.register(registerDto);

      // Manually verify the user for login tests
      await userRepository.update(
        { email: 'test@example.com' },
        { emailVerified: true },
      );
    });

    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = await controller.login(loginDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.password).toBeUndefined(); // Should be sanitized
    });

    it('should fail for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      await expect(controller.login(loginDto)).rejects.toThrow();
    });

    it('should allow login for unverified email but return unverified user data', async () => {
      // Create unverified user
      const registerDto: RegisterDto = {
        email: 'unverified@example.com',
        password: 'Password123!',
        firstName: 'Unverified',
        lastName: 'User',
      };

      await controller.register(registerDto);

      const loginDto: LoginDto = {
        email: 'unverified@example.com',
        password: 'Password123!',
      };

      const result = await controller.login(loginDto);
      
      expect(result).toBeDefined();
      expect(result.user.emailVerified).toBe(false);
      expect(result.user.email).toBe('unverified@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('POST /auth/verify-email', () => {
    it('should verify email successfully', async () => {
      // Register a user
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await controller.register(registerDto);

      // Get the verification token
      const user = await userRepository.findOne({
        where: { email: 'test@example.com' },
      });

      const result = await controller.verifyEmail({
        token: user.emailVerificationToken,
      });

      expect(result.message).toBe('Email verified successfully');

      // Verify user is now verified
      const verifiedUser = await userRepository.findOne({
        where: { email: 'test@example.com' },
      });
      expect(verifiedUser.emailVerified).toBe(true);
      expect(verifiedUser.emailVerificationToken).toBeNull();
    });

    it('should fail for invalid token', async () => {
      await expect(
        controller.verifyEmail({ token: 'invalid-token' }),
      ).rejects.toThrow();
    });
  });

  describe('POST /auth/forgot-password', () => {
    beforeEach(async () => {
      // Create a verified user
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await controller.register(registerDto);
      await userRepository.update(
        { email: 'test@example.com' },
        { emailVerified: true },
      );
    });

    it('should handle forgot password request', async () => {
      const result = await controller.forgotPassword({
        email: 'test@example.com',
      });

      expect(result.message).toContain('reset link');

      // Verify reset token was set
      const user = await userRepository.findOne({
        where: { email: 'test@example.com' },
      });
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpiry).toBeDefined();
    });

    it('should return same message for non-existent user', async () => {
      const result = await controller.forgotPassword({
        email: 'nonexistent@example.com',
      });

      expect(result.message).toContain('reset link');
    });
  });

  describe('POST /auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      // Create user and initiate password reset
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await controller.register(registerDto);
      await userRepository.update(
        { email: 'test@example.com' },
        { emailVerified: true },
      );

      // Request password reset
      await controller.forgotPassword({ email: 'test@example.com' });

      // Get reset token
      const user = await userRepository.findOne({
        where: { email: 'test@example.com' },
      });
      resetToken = user.passwordResetToken;
    });

    it('should reset password successfully', async () => {
      const result = await controller.resetPassword({
        token: resetToken,
        newPassword: 'NewPassword123!',
      });

      expect(result.message).toBe('Password reset successfully');

      // Verify password was changed by trying to login with new password
      const loginResult = await controller.login({
        email: 'test@example.com',
        password: 'NewPassword123!',
      });
      expect(loginResult.accessToken).toBeDefined();

      // Verify reset token was cleared
      const user = await userRepository.findOne({
        where: { email: 'test@example.com' },
      });
      expect(user.passwordResetToken).toBeNull();
      expect(user.passwordResetExpiry).toBeNull();
    });

    it('should fail for invalid token', async () => {
      await expect(
        controller.resetPassword({
          token: 'invalid-token',
          newPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow();
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await controller.register(registerDto);
      await userRepository.update(
        { email: 'test@example.com' },
        { emailVerified: true },
      );

      const loginResult = await controller.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      refreshToken = loginResult.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const result = await controller.refreshTokens(refreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should fail for invalid refresh token', async () => {
      await expect(controller.refreshTokens('invalid-token')).rejects.toThrow();
    });
  });
});