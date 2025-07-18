import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 📚 LEARNING: How Role-Based Authorization Works
 * 
 * This guard is the bridge between @Roles() decorator and actual authorization.
 * It runs BEFORE your controller method executes and decides if access is allowed.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * 📚 LEARNING: Step-by-Step Authorization Process
   * 
   * This method is called for EVERY request to a protected route.
   * Let's trace through what happens when someone hits /admin/users:
   */
  canActivate(context: ExecutionContext): boolean {
    console.log('🔐 RolesGuard: Checking authorization...');
    
    /**
     * 📚 STEP 1: Read the @Roles() metadata
     * 
     * This looks for @Roles(UserRole.ADMIN) on the controller or method
     * and extracts [UserRole.ADMIN] from the metadata
     */
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Check method-level @Roles()
      context.getClass(),   // Check controller-level @Roles()
    ]);
    
    console.log('📋 Required roles:', requiredRoles);
    
    /**
     * 📚 STEP 2: If no @Roles() decorator, allow access
     * 
     * Routes without @Roles() are considered public
     */
    if (!requiredRoles) {
      console.log('✅ No role requirements - access granted');
      return true;
    }
    
    /**
     * 📚 STEP 3: Get the current user from the request
     * 
     * This user object was added by JwtAuthGuard (which runs BEFORE this guard)
     * JwtAuthGuard validates the JWT token and adds user to request
     */
    const { user } = context.switchToHttp().getRequest();
    
    console.log('👤 Current user role:', user?.role);
    
    /**
     * 📚 STEP 4: Ensure user exists (should not happen if JwtAuthGuard works)
     */
    if (!user) {
      console.log('❌ No user found - access denied');
      return false;
    }
    
    /**
     * 📚 STEP 5: THE ACTUAL ROLE MATCHING HAPPENS HERE!
     * 
     * This is where user.role (from database) is compared with 
     * requiredRoles (from @Roles() decorator)
     * 
     * Example:
     * - requiredRoles = [UserRole.ADMIN] (from @Roles(UserRole.ADMIN))
     * - user.role = UserRole.ADMIN (from database User entity)
     * - user.role === UserRole.ADMIN → TRUE → Access granted!
     */
    const hasRequiredRole = requiredRoles.some((role) => {
      const matches = user.role === role;
      console.log(`🔍 Checking: ${user.role} === ${role} → ${matches}`);
      return matches;
    });
    
    console.log(hasRequiredRole ? '✅ Access granted!' : '❌ Access denied!');
    return hasRequiredRole;
  }
}

/**
 * 📚 LEARNING: Complete Flow Example
 * 
 * When a request hits the AdminController:
 * 
 * 1. REQUEST: GET /admin/users with JWT token
 * 
 * 2. JWTAUTHGUARD: 
 *    - Validates JWT token
 *    - Looks up user in database
 *    - Adds user object to request
 * 
 * 3. ROLESGUARD (this file):
 *    - Reads @Roles(UserRole.ADMIN) metadata
 *    - Gets user from request (added by JwtAuthGuard)
 *    - Compares user.role with UserRole.ADMIN
 *    - user.role = 'admin', UserRole.ADMIN = 'admin' → MATCH!
 *    - Returns true (access granted)
 * 
 * 4. CONTROLLER: AdminController.getAllUsers() executes
 * 
 * 5. RESPONSE: User list returned
 * 
 * If user.role was 'user' instead of 'admin':
 * - Step 3 would return false
 * - Controller method never executes  
 * - User gets 403 Forbidden error
 */