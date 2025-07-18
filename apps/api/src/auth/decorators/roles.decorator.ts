import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

/**
 * 📚 LEARNING: Custom Decorator for Role-Based Authorization
 * 
 * This decorator creates metadata that can be read by guards to determine
 * which roles are allowed to access specific routes or controllers.
 * 
 * How it works:
 * 1. @Roles(UserRole.ADMIN) attaches metadata to the route/controller
 * 2. RolesGuard reads this metadata during request processing
 * 3. Guard compares user's role with required roles
 * 4. Access granted if user has any of the required roles
 */

export const ROLES_KEY = 'roles';

/**
 * 📚 LEARNING: Decorator Function Explanation
 * 
 * @param roles - Variable number of UserRole enum values
 * @returns SetMetadata decorator that stores roles under ROLES_KEY
 * 
 * Usage Examples:
 * - @Roles(UserRole.ADMIN) - Only admins can access
 * - @Roles(UserRole.ADMIN, UserRole.MODERATOR) - Admins OR moderators
 * - @Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN) - Any role
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);