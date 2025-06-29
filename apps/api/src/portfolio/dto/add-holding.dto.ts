import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Length,
  IsIn,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../entities/transaction.entity';

export class AddHoldingDto {
  @ApiProperty({
    description: 'Cryptocurrency symbol',
    example: 'BTC',
  })
  @IsString()
  @Length(1, 20)
  symbol: string;

  @ApiProperty({
    description: 'Cryptocurrency name',
    example: 'Bitcoin',
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'Quantity purchased',
    example: 0.5,
  })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Price per unit',
    example: 45000,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({
    description: 'Transaction fees',
    example: 10.5,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  fees?: number;

  @ApiPropertyOptional({
    description: 'Currency for the transaction',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  @IsIn(['USD', 'EUR', 'GBP', 'BTC', 'ETH'])
  currency?: string;

  @ApiPropertyOptional({
    description: 'Transaction type',
    example: 'BUY',
    default: 'BUY',
  })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiPropertyOptional({
    description: 'Source of the transaction',
    example: 'BINANCE',
    default: 'MANUAL',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Date when the transaction was executed',
    example: '2023-12-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  executedAt?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'DCA purchase',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}