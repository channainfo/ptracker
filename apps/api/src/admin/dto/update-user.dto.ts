import { IsString, IsEmail, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

/**
 * 📚 LEARNING: Data Transfer Objects (DTOs)
 * 
 * DTOs define the structure and validation rules for data coming into our API.
 * They serve two main purposes:
 * 1. Validation - Ensure data is in the correct format
 * 2. Documentation - Swagger uses these to show API structure
 * 
 * Key Concepts:
 * - class-validator decorators (@IsString, @IsEmail, etc.) validate data
 * - @ApiProperty decorators provide Swagger documentation
 * - @IsOptional makes fields not required
 */

export class UpdateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether the user email is verified',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}

/**
 * 📚 LEARNING: Why DTOs are Important
 * 
 * 🛡️ Security Benefits:
 * - Prevents malicious data from reaching our database
 * - Validates data types and formats
 * - Strips out unexpected fields
 * 
 * 📖 Documentation Benefits:
 * - Auto-generates API documentation
 * - Shows frontend developers exactly what to send
 * - Provides examples and descriptions
 * 
 * 🔧 Development Benefits:
 * - TypeScript autocompletion
 * - Compile-time error checking
 * - Consistent data structures
 */