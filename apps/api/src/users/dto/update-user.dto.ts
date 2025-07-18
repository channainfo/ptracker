import { IsOptional, IsString, MaxLength, IsEmail, IsBoolean, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  // Email updates should be done through a separate endpoint with verification
  // @ApiPropertyOptional({
  //   description: 'User email address',
  //   example: 'user@example.com',
  // })
  // @IsOptional()
  // @IsEmail()
  // email?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Crypto enthusiast and trader',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({
    description: 'User timezone',
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({
    description: 'User preferred language',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({
    description: 'Two-factor authentication enabled',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'User notification preferences',
    example: {
      email: true,
      push: false,
      priceAlerts: true,
      marketNews: false,
    },
  })
  @IsOptional()
  @IsObject()
  notificationPreferences?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'User privacy settings',
    example: {
      profilePublic: false,
      portfolioPublic: false,
      showOnLeaderboard: true,
    },
  })
  @IsOptional()
  @IsObject()
  privacySettings?: Record<string, any>;
}