import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';

/**
 * 📚 LEARNING: NestJS Modules
 * 
 * Modules are the fundamental building blocks of NestJS applications.
 * They organize your code into logical units and define what's available
 * where in your application.
 * 
 * Key Concepts:
 * - @Module() decorator configures the module
 * - imports: other modules this module depends on
 * - controllers: classes that handle HTTP requests
 * - providers: services, repositories, and other injectable classes
 * - exports: what this module makes available to other modules
 */

@Module({
  /**
   * 📚 LEARNING: TypeORM Integration
   * 
   * TypeOrmModule.forFeature() registers entities for this module.
   * This makes the User repository available for dependency injection
   * in our AdminService.
   */
  imports: [
    TypeOrmModule.forFeature([User]), // Register User entity for this module
  ],
  
  /**
   * 📚 LEARNING: Controllers Registration
   * 
   * Controllers handle incoming HTTP requests and return responses.
   * By listing AdminController here, NestJS knows to create an instance
   * and wire up all the routes.
   */
  controllers: [AdminController],
  
  /**
   * 📚 LEARNING: Providers (Services)
   * 
   * Providers are classes that can be injected as dependencies.
   * Our AdminService contains the business logic for admin operations.
   */
  providers: [AdminService],
  
  /**
   * 📚 LEARNING: Exports
   * 
   * If other modules need to use AdminService, we would list it here.
   * For now, admin functionality is self-contained, so we don't export anything.
   * 
   * Example: exports: [AdminService], // if other modules needed admin service
   */
  exports: [],
})
export class AdminModule {}

/**
 * 📚 LEARNING: How NestJS Module System Works
 * 
 * 🎯 Module Registration Process:
 * 1. NestJS scans for @Module() decorators
 * 2. Creates instances of controllers and providers
 * 3. Resolves dependencies through dependency injection
 * 4. Registers routes from controllers
 * 5. Makes exports available to importing modules
 * 
 * 🎯 Dependency Injection Flow:
 * 1. AdminController needs AdminService → NestJS provides it
 * 2. AdminService needs User repository → TypeORM provides it
 * 3. Everything is wired up automatically!
 * 
 * 🎯 Module Organization Benefits:
 * ✅ Clear separation of concerns
 * ✅ Reusable and testable components
 * ✅ Easy to understand project structure
 * ✅ Built-in dependency management
 * ✅ Supports lazy loading and dynamic modules
 */

/**
 * 📚 LEARNING: Integration with Main Application
 * 
 * To use this AdminModule in your main application, you need to:
 * 
 * 1. Import it in your main AppModule:
 * 
 * ```typescript
 * import { AdminModule } from './admin/admin.module';
 * 
 * @Module({
 *   imports: [
 *     // ... other modules
 *     AdminModule,
 *   ],
 *   // ...
 * })
 * export class AppModule {}
 * ```
 * 
 * 2. Make sure you have the required guards and decorators:
 *    - JwtAuthGuard (handles JWT authentication)
 *    - RolesGuard (handles role-based authorization)
 *    - @Roles() decorator
 *    - @GetUser() decorator
 * 
 * 3. Your routes will be available at:
 *    - GET /api/v1/admin/stats
 *    - GET /api/v1/admin/users
 *    - PUT /api/v1/admin/users/:id
 *    - DELETE /api/v1/admin/users/:id
 *    - POST /api/v1/admin/users/:id/activate
 *    - POST /api/v1/admin/users/:id/deactivate
 *    - GET /api/v1/admin/system/health
 *    - GET /api/v1/admin/audit-logs
 *    - GET /api/v1/admin/analytics/user-growth
 */

/**
 * 📚 LEARNING: What You've Completed
 * 
 * 🎉 Complete Admin System Built!
 * 
 * 🎯 Frontend Components:
 * ✅ AdminRoute - Role-based route protection
 * ✅ AdminSidebar - Responsive navigation
 * ✅ AdminLayout - Consistent layout wrapper
 * ✅ Admin Dashboard - Statistics and overview
 * ✅ User Management - Full CRUD interface
 * 
 * 🎯 Backend API:
 * ✅ AdminController - HTTP request handling
 * ✅ AdminService - Business logic implementation
 * ✅ AdminModule - Module organization
 * ✅ DTOs - Data validation and documentation
 * ✅ Security - JWT auth + role-based access
 * 
 * 🎯 Features Implemented:
 * ✅ Dashboard with real-time statistics
 * ✅ User management (view, edit, delete, role changes)
 * ✅ System health monitoring
 * ✅ Audit logging for admin actions
 * ✅ Search and filtering capabilities
 * ✅ Responsive design for all screen sizes
 * ✅ Loading states and error handling
 * ✅ Security best practices
 * 
 * Your admin system is now complete and ready for production use!
 */