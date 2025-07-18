import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * 📚 LEARNING: JWT Authentication Guard
 * 
 * This guard is responsible for validating JWT tokens and extracting user information.
 * It extends Passport's AuthGuard('jwt') which handles the heavy lifting of JWT validation.
 * 
 * How JWT Authentication Works:
 * 1. User logs in → Server creates JWT token with user info
 * 2. Frontend stores token (localStorage, cookies, etc.)
 * 3. Frontend sends token in Authorization header: "Bearer eyJ0eXAiOiJKV1Q..."
 * 4. This guard validates token and extracts user data
 * 5. User object gets added to request for other guards/controllers to use
 */

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 📚 LEARNING: canActivate - The Main Authorization Logic
   * 
   * This method runs for EVERY protected route and decides if the request can proceed.
   * Let's trace what happens when someone hits /admin/users:
   */
  canActivate(context: ExecutionContext) {
    console.log('🔑 JwtAuthGuard: Starting authentication check...');
    
    /**
     * 📚 STEP 1: Check if route is marked as public
     * 
     * Routes with @Public() decorator bypass authentication.
     * Examples: /auth/login, /auth/register, /health
     */
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check method-level @Public()
      context.getClass(),   // Check controller-level @Public()
    ]);

    if (isPublic) {
      console.log('🌐 Route is public - skipping authentication');
      return true;
    }

    console.log('🔒 Route is protected - validating JWT token...');

    /**
     * 📚 STEP 2: Delegate to Passport JWT strategy
     * 
     * super.canActivate() calls Passport's JWT strategy which:
     * 1. Extracts token from Authorization header
     * 2. Verifies token signature using secret key
     * 3. Checks if token is expired
     * 4. Calls JWT strategy's validate() method
     * 5. Returns user object or throws error
     */
    return super.canActivate(context);
  }

  /**
   * 📚 LEARNING: handleRequest - Processing Authentication Results
   * 
   * This method receives the result from Passport's JWT strategy.
   * It's called AFTER the JWT token has been validated.
   * 
   * @param err - Any error that occurred during validation
   * @param user - User object returned by JWT strategy's validate() method
   * @param info - Additional info (like token expiry details)
   */
  handleRequest(err: any, user: any, info: any) {
    console.log('📋 JwtAuthGuard: Processing authentication result...');
    console.log('👤 User from JWT:', user ? `${user.email} (${user.role})` : 'None');
    console.log('❌ Error:', err || 'None');
    console.log('ℹ️ Info:', info || 'None');

    /**
     * 📚 STEP 3: Handle authentication failures
     * 
     * Common scenarios:
     * - No token provided → err = null, user = false
     * - Invalid token → err = UnauthorizedException
     * - Expired token → err = null, user = false, info = 'jwt expired'
     * - Invalid signature → err = null, user = false, info = 'invalid signature'
     */
    if (err || !user) {
      console.log('🚫 Authentication failed - throwing UnauthorizedException');
      throw err || new UnauthorizedException('Invalid or expired token');
    }

    /**
     * 📚 STEP 4: Authentication success!
     * 
     * The user object returned here gets added to the request object.
     * This is how RolesGuard (and controllers) can access current user:
     * 
     * const { user } = context.switchToHttp().getRequest();
     */
    console.log('✅ Authentication successful - user added to request');
    return user;
  }
}

/**
 * 📚 LEARNING: Complete JWT Flow Example
 * 
 * When a request hits /admin/users with JWT token:
 * 
 * 1. REQUEST arrives with header:
 *    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
 * 
 * 2. JWTAUTHGUARD.canActivate():
 *    - Checks if route is public (it's not)
 *    - Calls super.canActivate() → Passport JWT strategy
 * 
 * 3. PASSPORT JWT STRATEGY:
 *    - Extracts token from "Bearer ..." header
 *    - Verifies token with secret key
 *    - Decodes payload: { sub: 'user-uuid', email: 'admin@example.com', role: 'admin' }
 *    - Calls JwtStrategy.validate() with decoded payload
 *    - Returns User object from database
 * 
 * 4. JWTAUTHGUARD.handleRequest():
 *    - Receives User object from strategy
 *    - Validates user exists
 *    - Returns user object
 * 
 * 5. USER ADDED TO REQUEST:
 *    - request.user = User { id: 'uuid', email: 'admin@example.com', role: 'admin' }
 * 
 * 6. ROLESGUARD runs next:
 *    - Gets user from request.user
 *    - Compares user.role ('admin') with @Roles(UserRole.ADMIN) ('admin')
 *    - Match! → Access granted
 * 
 * 7. CONTROLLER executes:
 *    - AdminController.getAllUsers() can access user via @GetUser() decorator
 * 
 * If any step fails:
 * - Steps 2-4 fail → 401 Unauthorized
 * - Step 6 fails → 403 Forbidden
 */

/**
 * 📚 LEARNING: What You Need for This to Work
 * 
 * This guard depends on several other components:
 * 
 * 1. JWT Strategy (jwt.strategy.ts):
 *    - Defines how to validate JWT tokens
 *    - Extracts user from database using token payload
 * 
 * 2. Public Decorator (@Public()):
 *    - Marks routes that don't need authentication
 *    - Used for login, register, health checks
 * 
 * 3. Passport Module Configuration:
 *    - Registers JWT strategy with secret key
 *    - Configures token extraction method
 * 
 * 4. User Entity:
 *    - Database model that JWT strategy returns
 *    - Contains role field for authorization
 */