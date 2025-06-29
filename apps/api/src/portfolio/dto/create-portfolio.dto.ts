import { IsString, IsOptional, IsBoolean, IsObject, Length, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty({
    description: 'Portfolio name',
    example: 'My Crypto Portfolio',
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({
    description: 'Portfolio description',
    example: 'Long-term crypto investment portfolio',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Base currency for portfolio calculations',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  @IsIn(['USD', 'EUR', 'GBP', 'BTC', 'ETH'])
  baseCurrency?: string;

  @ApiPropertyOptional({
    description: 'Whether the portfolio is publicly visible',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Portfolio settings',
    example: {
      riskLevel: 'moderate',
      rebalanceFrequency: 'monthly',
      allowAlerts: true,
      trackDividends: false,
    },
  })
  @IsOptional()
  @IsObject()
  settings?: {
    riskLevel?: 'conservative' | 'moderate' | 'aggressive';
    rebalanceFrequency?: 'daily' | 'weekly' | 'monthly';
    allowAlerts?: boolean;
    trackDividends?: boolean;
  };
}