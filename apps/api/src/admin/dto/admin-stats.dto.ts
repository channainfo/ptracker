import { ApiProperty } from '@nestjs/swagger';

/**
 * 📚 LEARNING: Response DTOs
 * 
 * While request DTOs validate incoming data, response DTOs define
 * the structure of data going back to the frontend.
 * This ensures consistent API responses and good documentation.
 */

export class AdminStatsDto {
  @ApiProperty({
    description: 'Total number of registered users',
    example: 1247,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Number of users active in the last 30 days',
    example: 892,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'Number of new users registered today',
    example: 23,
  })
  newUsersToday: number;

  @ApiProperty({
    description: 'Total number of transactions processed',
    example: 15678,
  })
  totalTransactions: number;

  @ApiProperty({
    description: 'Current system health status',
    enum: ['healthy', 'warning', 'critical'],
    example: 'healthy',
  })
  systemHealth: 'healthy' | 'warning' | 'critical';

  @ApiProperty({
    description: 'Timestamp when these statistics were last updated',
    example: '2024-01-20T15:30:00Z',
  })
  lastUpdated: string;

  @ApiProperty({
    description: 'Breakdown of users by role',
    example: {
      user: 1200,
      moderator: 45,
      admin: 2
    },
  })
  usersByRole: {
    user: number;
    moderator: number;
    admin: number;
  };

  @ApiProperty({
    description: 'User registration trend over the last 7 days',
    example: [15, 22, 18, 31, 28, 25, 23],
  })
  registrationTrend: number[];
}

/**
 * 📚 LEARNING: Additional Response DTOs
 */

export class SystemHealthDto {
  @ApiProperty({
    description: 'Overall system status',
    enum: ['healthy', 'warning', 'critical'],
    example: 'healthy',
  })
  status: 'healthy' | 'warning' | 'critical';

  @ApiProperty({
    description: 'Database connection status',
    example: { status: 'connected', responseTime: 15 },
  })
  database: {
    status: 'connected' | 'disconnected' | 'slow';
    responseTime: number; // milliseconds
  };

  @ApiProperty({
    description: 'Redis cache status',
    example: { status: 'connected', memory: '45%' },
  })
  cache: {
    status: 'connected' | 'disconnected';
    memory: string;
  };

  @ApiProperty({
    description: 'Server resource usage',
    example: {
      cpu: '34%',
      memory: '67%',
      disk: '23%'
    },
  })
  resources: {
    cpu: string;
    memory: string;
    disk: string;
  };

  @ApiProperty({
    description: 'Number of active user sessions',
    example: 234,
  })
  activeSessions: number;

  @ApiProperty({
    description: 'System uptime in seconds',
    example: 2847293,
  })
  uptime: number;
}

export class AuditLogDto {
  @ApiProperty({
    description: 'Unique identifier for the audit log entry',
    example: 'log_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Action that was performed',
    example: 'USER_ROLE_UPDATED',
  })
  action: string;

  @ApiProperty({
    description: 'ID of the admin who performed the action',
    example: 'admin_001',
  })
  adminId: string;

  @ApiProperty({
    description: 'Name of the admin who performed the action',
    example: 'Sarah Wilson',
  })
  adminName: string;

  @ApiProperty({
    description: 'ID of the user who was affected (if applicable)',
    example: 'user_123',
    required: false,
  })
  targetUserId?: string;

  @ApiProperty({
    description: 'Additional details about the action',
    example: { oldRole: 'user', newRole: 'moderator' },
  })
  details: Record<string, any>;

  @ApiProperty({
    description: 'IP address from which the action was performed',
    example: '192.168.1.100',
  })
  ipAddress: string;

  @ApiProperty({
    description: 'Timestamp when the action was performed',
    example: '2024-01-20T15:30:00Z',
  })
  timestamp: string;
}

/**
 * 📚 LEARNING: Pagination Response DTO
 * 
 * This is a generic wrapper for paginated responses.
 * It provides consistent pagination metadata across all endpoints.
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
  })
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      currentPage: 2,
      totalPages: 15,
      totalItems: 147,
      itemsPerPage: 10,
      hasNextPage: true,
      hasPreviousPage: true
    },
  })
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * 📚 LEARNING: What You've Learned About DTOs
 * 
 * 🎯 Data Validation:
 * ✅ Input validation with class-validator
 * ✅ Type safety with TypeScript
 * ✅ Optional vs required fields
 * ✅ Enum validation for specific values
 * 
 * 🎯 API Documentation:
 * ✅ Swagger integration with @ApiProperty
 * ✅ Examples and descriptions
 * ✅ Response structure definition
 * ✅ Consistent data formats
 * 
 * 🎯 Code Organization:
 * ✅ Separation of request and response DTOs
 * ✅ Reusable generic types (PaginatedResponseDto)
 * ✅ Clear naming conventions
 * ✅ Comprehensive type definitions
 * 
 * These DTOs ensure that your API is well-documented, type-safe, and secure!
 */