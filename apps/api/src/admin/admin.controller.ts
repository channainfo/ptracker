import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminStatsDto } from './dto/admin-stats.dto';

/**
 * 📚 LEARNING: NestJS Controller
 * 
 * A Controller in NestJS handles HTTP requests and sends responses.
 * Think of it as a traffic director that receives requests and decides
 * what to do with them.
 * 
 * Key Concepts:
 * - @Controller() decorator defines the base route
 * - @Get(), @Post(), etc. define HTTP methods
 * - @UseGuards() adds security checks
 * - @ApiTags() groups endpoints in Swagger documentation
 */

/**
 * 📚 LEARNING: How @Roles() Connects to RolesGuard
 * 
 * THIS IS WHERE THE MAGIC HAPPENS! Let's trace the connection:
 */
@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // 📚 These guards run for EVERY route in this controller
@Roles(UserRole.ADMIN) // 📚 THIS LINE sets metadata that RolesGuard reads!
@ApiBearerAuth() // 📚 Documentation: Swagger shows these need auth token
export class AdminController {

  /**
   * 📚 LEARNING: The Complete Connection Explained
   * 
   * 1. @Roles(UserRole.ADMIN) sets metadata on this entire controller
   *    - Metadata key: 'roles' 
   *    - Metadata value: [UserRole.ADMIN] (which is ['admin'])
   * 
   * 2. @UseGuards(JwtAuthGuard, RolesGuard) runs guards in order:
   *    - JwtAuthGuard: Validates JWT token, adds user to request
   *    - RolesGuard: Reads @Roles() metadata, compares with user.role
   * 
   * 3. RolesGuard.canActivate() does this comparison:
   *    ```typescript
   *    const requiredRoles = ['admin']  // From @Roles(UserRole.ADMIN)
   *    const userRole = user.role       // From database (User entity)
   *    return requiredRoles.includes(userRole)  // 'admin' === 'admin' → true
   *    ```
   * 
   * 4. If user.role = 'user':
   *    - requiredRoles = ['admin'], userRole = 'user'
   *    - ['admin'].includes('user') → false
   *    - RolesGuard returns false
   *    - User gets 403 Forbidden error
   * 
   * 5. If user.role = 'admin':
   *    - requiredRoles = ['admin'], userRole = 'admin'  
   *    - ['admin'].includes('admin') → true
   *    - RolesGuard returns true
   *    - Controller method executes normally
   */

  /**
   * 📚 LEARNING: Dependency Injection
   * 
   * NestJS automatically provides the AdminService instance.
   * This is called "Dependency Injection" - we don't create the service ourselves,
   * the framework provides it for us.
   */
  constructor(private readonly adminService: AdminService) { }

  /**
   * 📚 LEARNING: Dashboard Statistics Endpoint
   * 
   * GET /api/v1/admin/stats
   * Returns overview statistics for the admin dashboard
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: AdminStatsDto
  })
  async getDashboardStats(): Promise<AdminStatsDto> {
    return this.adminService.getDashboardStats();
  }

  /**
   * 📚 LEARNING: User Management Endpoints
   * 
   * These endpoints allow admins to manage users in the system
   */

  @Get('users')
  @ApiOperation({ summary: 'Get all users with admin details' })
  @ApiResponse({ status: 200, description: 'Users list retrieved successfully' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    /**
     * 📚 LEARNING: Query Parameters
     * 
     * @Query() decorator extracts query parameters from the URL
     * Example: GET /admin/users?page=2&limit=20&search=john&role=user
     */
    return this.adminService.getAllUsers({
      page: Number(page),
      limit: Number(limit),
      search,
      role,
    });
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get specific user details' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    /**
     * 📚 LEARNING: Path Parameters
     * 
     * @Param() decorator extracts parameters from the URL path
     * Example: GET /admin/users/123 -> id = "123"
     */
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() admin: User,
  ) {
    /**
     * 📚 LEARNING: Request Body and Custom Decorators
     * 
     * @Body() extracts the request body (JSON data sent by frontend)
     * @GetUser() is our custom decorator that gets the current authenticated user
     */
    return this.adminService.updateUser(id, updateUserDto, admin.id);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user account' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Throttle({ short: { limit: 3, ttl: 60000 } }) // 📚 Rate limiting: max 3 deletes per minute
  async deleteUser(
    @Param('id') id: string,
    @GetUser() admin: User,
  ) {
    /**
     * 📚 LEARNING: Rate Limiting and HTTP Status Codes
     * 
     * @Throttle() prevents abuse by limiting how often this endpoint can be called
     * @HttpCode() sets the HTTP status code (204 = No Content for successful deletion)
     */
    return this.adminService.deleteUser(id, admin.id);
  }

  @Post('users/:id/activate')
  @ApiOperation({ summary: 'Activate a user account' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  async activateUser(
    @Param('id') id: string,
    @GetUser() admin: User,
  ) {
    return this.adminService.activateUser(id, admin.id);
  }

  @Post('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  async deactivateUser(
    @Param('id') id: string,
    @GetUser() admin: User,
  ) {
    return this.adminService.deactivateUser(id, admin.id);
  }

  /**
   * 📚 LEARNING: System Management Endpoints
   */

  @Get('system/health')
  @ApiOperation({ summary: 'Get detailed system health information' })
  @ApiResponse({ status: 200, description: 'System health data retrieved successfully' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get admin audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.getAuditLogs({
      page: Number(page),
      limit: Number(limit),
      action,
      userId,
    });
  }

  @Get('analytics/user-growth')
  @ApiOperation({ summary: 'Get user growth analytics' })
  @ApiResponse({ status: 200, description: 'User growth data retrieved successfully' })
  async getUserGrowthAnalytics(
    @Query('period') period: '7d' | '30d' | '90d' | '1y' = '30d'
  ) {
    /**
     * 📚 LEARNING: TypeScript Union Types in Parameters
     * 
     * The period parameter can only be one of the specified values.
     * This provides type safety and clear API documentation.
     */
    return this.adminService.getUserGrowthAnalytics(period);
  }
}

/**
 * 📚 LEARNING: What You've Learned About NestJS Controllers
 * 
 * 🎯 Core Concepts:
 * ✅ Controller decorator and routing
 * ✅ HTTP method decorators (@Get, @Post, @Put, @Delete)
 * ✅ Parameter extraction (@Param, @Query, @Body)
 * ✅ Dependency injection in constructor
 * ✅ Guard-based security (@UseGuards, @Roles)
 * ✅ API documentation with Swagger decorators
 * ✅ Rate limiting with @Throttle
 * ✅ Custom HTTP status codes
 * 
 * 🎯 Security Features:
 * ✅ JWT authentication requirement
 * ✅ Role-based authorization (admin only)
 * ✅ Rate limiting on dangerous operations
 * ✅ Audit logging for admin actions
 * 
 * 🎯 API Design:
 * ✅ RESTful endpoint structure
 * ✅ Pagination support
 * ✅ Search and filtering
 * ✅ Consistent response formats
 * ✅ Proper error handling
 * 
 * Next, we'll create the AdminService that contains the business logic!
 */