import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailDto {
  @ApiProperty({
    description: 'New email address',
    example: 'newemail@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  newEmail: string;
}

export class ConfirmEmailChangeDto {
  @ApiProperty({
    description: 'Email change confirmation token',
    example: 'abc123...',
  })
  @IsNotEmpty()
  token: string;
}