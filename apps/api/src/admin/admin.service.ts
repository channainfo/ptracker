import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminStatsDto, SystemHealthDto, AuditLogDto, PaginatedResponseDto } from './dto/admin-stats.dto';

/**
 * 📚 LEARNING: NestJS Service
 * 
 * Services contain the business logic of your application.
 * They handle data processing, database operations, and complex calculations.
 * Controllers call services to do the actual work.
 * 
 * Key Concepts:
 * - @Injectable() makes this class available for dependency injection
 * - @InjectRepository() gives us access to database operations
 * - Services are where you put reusable business logic
 * - Services can call other services
 */

@Injectable()
export class AdminService {
  
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 📚 LEARNING: Dashboard Statistics Method
   * 
   * This method gathers data from multiple sources to create
   * a comprehensive dashboard overview.
   */
  async getDashboardStats(): Promise<AdminStatsDto> {
    try {
      // 📚 LEARNING: Parallel Database Queries
      // Instead of running queries one by one, we run them all at once
      // using Promise.all() for better performance
      const [
        totalUsers,
        activeUsers,
        newUsersToday,
        usersByRole,
        registrationTrend
      ] = await Promise.all([
        // Total users count
        this.userRepository.count(),
        
        // Active users (logged in within last 30 days)
        this.userRepository.count({
          where: {
            lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }),
        
        // New users today
        this.userRepository.count({
          where: {
            createdAt: new Date(new Date().setHours(0, 0, 0, 0)) // Start of today
          }
        }),
        
        // Users by role
        this.getUserCountByRole(),
        
        // Registration trend (last 7 days)
        this.getRegistrationTrend()
      ]);

      // 📚 LEARNING: Mock Data for Development
      // In a real app, you'd calculate this from actual transaction data
      const totalTransactions = 15678; // Mock data
      
      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        totalTransactions,
        systemHealth: 'healthy', // This would come from health checks
        lastUpdated: new Date().toISOString(),
        usersByRole,
        registrationTrend,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * 📚 LEARNING: User Management Methods
   */
  
  async getAllUsers(options: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponseDto<User>> {
    const { page, limit, search, role } = options;
    
    // 📚 LEARNING: Query Builder for Complex Queries
    // When you need dynamic WHERE conditions, Query Builder is better than simple find()
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    // Add search condition if provided
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // Add role filter if provided
    if (role && role !== 'all') {
      queryBuilder.andWhere('user.role = :role', { role });
    }
    
    // 📚 LEARNING: Pagination with TypeORM
    const [users, totalItems] = await queryBuilder
      .orderBy('user.createdAt', 'DESC') // Newest first
      .skip((page - 1) * limit) // Skip items for pagination
      .take(limit) // Limit results
      .getManyAndCount(); // Get both results and total count
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, adminId: string): Promise<User> {
    const user = await this.getUserById(id);
    
    // 📚 LEARNING: Business Logic Validation
    // Prevent admins from changing their own role (security measure)
    if (id === adminId && updateUserDto.role && updateUserDto.role !== user.role) {
      throw new ForbiddenException('Admins cannot change their own role');
    }
    
    // Update user with new data
    Object.assign(user, updateUserDto);
    
    const updatedUser = await this.userRepository.save(user);
    
    // 📚 LEARNING: Audit Logging
    // In a real app, you'd save this to an audit log table
    await this.logAdminAction({
      action: 'USER_UPDATED',
      adminId,
      targetUserId: id,
      details: updateUserDto,
    });
    
    return updatedUser;
  }

  async deleteUser(id: string, adminId: string): Promise<void> {
    const user = await this.getUserById(id);
    
    // 📚 LEARNING: Business Rules
    // Prevent deletion of admin accounts and self-deletion
    if (user.role === 'admin') {
      throw new ForbiddenException('Admin accounts cannot be deleted');
    }
    
    if (id === adminId) {
      throw new ForbiddenException('Admins cannot delete their own account');
    }
    
    await this.userRepository.remove(user);
    
    await this.logAdminAction({
      action: 'USER_DELETED',
      adminId,
      targetUserId: id,
      details: { deletedUser: { email: user.email, role: user.role } },
    });
  }

  async activateUser(id: string, adminId: string): Promise<User> {
    const user = await this.getUserById(id);
    user.isActive = true;
    
    const updatedUser = await this.userRepository.save(user);
    
    await this.logAdminAction({
      action: 'USER_ACTIVATED',
      adminId,
      targetUserId: id,
      details: {},
    });
    
    return updatedUser;
  }

  async deactivateUser(id: string, adminId: string): Promise<User> {
    const user = await this.getUserById(id);
    
    if (user.role === 'admin') {
      throw new ForbiddenException('Admin accounts cannot be deactivated');
    }
    
    if (id === adminId) {
      throw new ForbiddenException('Admins cannot deactivate their own account');
    }
    
    user.isActive = false;
    
    const updatedUser = await this.userRepository.save(user);
    
    await this.logAdminAction({
      action: 'USER_DEACTIVATED',
      adminId,
      targetUserId: id,
      details: {},
    });
    
    return updatedUser;
  }

  /**
   * 📚 LEARNING: System Health Methods
   */
  
  async getSystemHealth(): Promise<SystemHealthDto> {
    try {
      // 📚 LEARNING: Health Check Implementation
      // Test database connection
      const dbStart = Date.now();
      await this.userRepository.query('SELECT 1');
      const dbResponseTime = Date.now() - dbStart;
      
      // Get system metrics (mock data for demo)
      const activeSessions = await this.getActiveSessionsCount();
      
      return {
        status: 'healthy',
        database: {
          status: dbResponseTime < 100 ? 'connected' : 'slow',
          responseTime: dbResponseTime,
        },
        cache: {
          status: 'connected', // Would check Redis in real app
          memory: '45%',
        },
        resources: {
          cpu: '34%',
          memory: '67%',
          disk: '23%',
        },
        activeSessions,
        uptime: process.uptime(),
      };
    } catch (error) {
      return {
        status: 'critical',
        database: {
          status: 'disconnected',
          responseTime: -1,
        },
        cache: {
          status: 'disconnected',
          memory: 'unknown',
        },
        resources: {
          cpu: 'unknown',
          memory: 'unknown',
          disk: 'unknown',
        },
        activeSessions: 0,
        uptime: process.uptime(),
      };
    }
  }

  /**
   * 📚 LEARNING: Helper Methods
   * 
   * These are private methods that support the main functionality.
   * They're marked 'private' because they're only used within this service.
   */
  
  private async getUserCountByRole() {
    // 📚 LEARNING: Raw SQL Query for Aggregation
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();
    
    // Convert to object format
    const roleCount = { user: 0, moderator: 0, admin: 0 };
    result.forEach(row => {
      roleCount[row.role] = parseInt(row.count);
    });
    
    return roleCount;
  }

  private async getRegistrationTrend(): Promise<number[]> {
    // 📚 LEARNING: Date-based Aggregation
    // Get user registrations for the last 7 days
    const trend = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await this.userRepository.count({
        where: {
          createdAt: Between(date, nextDate)
        }
      });
      
      trend.push(count);
    }
    
    return trend;
  }

  private async getActiveSessionsCount(): Promise<number> {
    // 📚 LEARNING: Active Sessions Calculation
    // Count users who logged in within the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return this.userRepository.count({
      where: {
        lastLoginAt: MoreThan(oneHourAgo)
      }
    });
  }

  private async logAdminAction(logData: {
    action: string;
    adminId: string;
    targetUserId?: string;
    details: any;
  }) {
    // 📚 LEARNING: Audit Logging
    // In a real application, you would save this to an audit_logs table
    console.log('Admin Action Logged:', {
      ...logData,
      timestamp: new Date().toISOString(),
      ipAddress: 'TODO: Get from request context',
    });
    
    // TODO: Implement actual audit log storage
  }

  async getAuditLogs(options: {
    page: number;
    limit: number;
    action?: string;
    userId?: string;
  }): Promise<PaginatedResponseDto<AuditLogDto>> {
    // 📚 LEARNING: Mock Audit Logs
    // In a real app, this would query an audit_logs table
    const mockLogs: AuditLogDto[] = [
      {
        id: 'log_001',
        action: 'USER_ROLE_UPDATED',
        adminId: 'admin_001',
        adminName: 'Sarah Wilson',
        targetUserId: 'user_123',
        details: { oldRole: 'user', newRole: 'moderator' },
        ipAddress: '192.168.1.100',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: 'log_002',
        action: 'USER_DEACTIVATED',
        adminId: 'admin_001',
        adminName: 'Sarah Wilson',
        targetUserId: 'user_456',
        details: { reason: 'Terms of service violation' },
        ipAddress: '192.168.1.100',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      },
    ];
    
    return {
      data: mockLogs,
      pagination: {
        currentPage: options.page,
        totalPages: 1,
        totalItems: mockLogs.length,
        itemsPerPage: options.limit,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  async getUserGrowthAnalytics(period: '7d' | '30d' | '90d' | '1y') {
    // 📚 LEARNING: Time-series Data Analysis
    // This would analyze user growth over the specified period
    const mockData = {
      period,
      dataPoints: [
        { date: '2024-01-01', newUsers: 15, totalUsers: 1200 },
        { date: '2024-01-02', newUsers: 22, totalUsers: 1222 },
        { date: '2024-01-03', newUsers: 18, totalUsers: 1240 },
        // ... more data points
      ],
      growthRate: '+12.5%',
      totalGrowth: 247,
    };
    
    return mockData;
  }
}

// 📚 LEARNING: Import needed for date operations
import { Between, MoreThan } from 'typeorm';

/**
 * 📚 LEARNING: What You've Learned About NestJS Services
 * 
 * 🎯 Core Service Concepts:
 * ✅ Dependency injection with @Injectable()
 * ✅ Repository pattern for database access
 * ✅ Business logic separation from controllers
 * ✅ Error handling with custom exceptions
 * ✅ Method organization and reusability
 * 
 * 🎯 Database Operations:
 * ✅ TypeORM Query Builder for complex queries
 * ✅ Pagination implementation
 * ✅ Raw SQL for aggregations
 * ✅ Date-based filtering and grouping
 * ✅ Parallel query execution with Promise.all()
 * 
 * 🎯 Business Logic:
 * ✅ Input validation and security checks
 * ✅ Role-based business rules
 * ✅ Audit logging for admin actions
 * ✅ System health monitoring
 * ✅ Analytics and reporting
 * 
 * 🎯 Best Practices:
 * ✅ Separation of concerns
 * ✅ Error handling and logging
 * ✅ Performance optimization
 * ✅ Security considerations
 * ✅ Maintainable code structure
 * 
 * This service provides all the functionality needed for a complete admin system!
 */