# Admin vs Public User Security Framework

## Overview

Managing admin and public users in a crypto platform requires different security approaches due to the varying levels of access and risk. This document outlines best practices for securing both user types while maintaining usability.

## User Role Hierarchy

### User Types Classification
```typescript
interface UserRoles {
  // Public Users (Customer-facing)
  public: {
    basic: 'Free tier users';
    premium: 'Paid subscription users';
    professional: 'High-volume traders';
  };
  
  // Internal Users (Platform management)
  admin: {
    support: 'Customer support agents';
    analyst: 'Data analysts and researchers';
    moderator: 'Content and community moderators';
    developer: 'Engineering team members';
    security: 'Security team members';
    superAdmin: 'Platform owners';
  };
}
```

## Public User Security Framework

### 1. Authentication & Authorization
```typescript
interface PublicUserSecurity {
  authentication: {
    methods: [
      'email/password + MFA',
      'social_oauth (Google, Facebook, Apple)',
      'crypto_wallet (MetaMask, Phantom, Sui)',
      'telegram_auth'
    ];
    
    security: {
      passwordPolicy: {
        minLength: 12,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        noCommonPasswords: true,
        rotationPeriod: '90 days (optional)'
      };
      
      mfa: {
        mandatory: true,
        gracePeriod: '7 days for setup',
        methods: ['TOTP', 'SMS', 'email', 'hardware_keys']
      };
      
      sessionManagement: {
        jwtExpiry: '15 minutes',
        refreshTokenExpiry: '7 days',
        maxConcurrentSessions: 5,
        ipBinding: false, // Users travel
        deviceFingerprinting: true
      };
    };
  };
  
  authorization: {
    model: 'RBAC (Role-Based Access Control)',
    permissions: [
      'portfolio.read',
      'portfolio.write',
      'alerts.manage',
      'profile.read',
      'profile.write',
      'api.basic'
    ];
    
    rateLimiting: {
      api: '1000 requests/hour',
      sensitiveActions: '10/minute',
      loginAttempts: '5 per 15 minutes'
    };
  };
}
```

### 2. Data Protection for Public Users
```typescript
interface PublicUserDataProtection {
  dataEncryption: {
    atRest: 'AES-256-GCM',
    inTransit: 'TLS 1.3',
    personalData: 'Field-level encryption',
    apiKeys: 'Client-side encryption before storage'
  };
  
  dataAccess: {
    ownDataOnly: true,
    noAdminAccess: 'Without explicit consent',
    auditLog: 'All data access logged',
    dataRetention: 'User-controlled deletion'
  };
  
  privacy: {
    dataMinimization: true,
    purposeLimitation: true,
    consentManagement: 'Granular consent controls',
    rightToDelete: 'Complete data erasure'
  };
}
```

### 3. Public User Security Monitoring
```typescript
interface PublicUserMonitoring {
  behavioralAnalysis: {
    loginPatterns: 'Unusual location/time detection',
    transactionPatterns: 'Anomaly detection',
    apiUsage: 'Abuse pattern recognition',
    deviceChanges: 'New device notifications'
  };
  
  riskScoring: {
    factors: [
      'login_frequency',
      'location_changes',
      'device_changes',
      'api_usage_patterns',
      'transaction_values'
    ];
    
    actions: {
      lowRisk: 'Normal access',
      mediumRisk: 'Additional verification',
      highRisk: 'Account freeze + manual review'
    };
  };
  
  alerting: {
    user: 'Suspicious activity notifications',
    security: 'Real-time security team alerts',
    automated: 'Auto-blocking of obvious attacks'
  };
}
```

## Admin User Security Framework

### 1. Enhanced Authentication for Admins
```typescript
interface AdminUserSecurity {
  authentication: {
    requirements: {
      mandatoryMFA: true,
      hardwareTokens: 'Required for superAdmin',
      biometrics: 'Required where available',
      certificateAuth: 'For critical operations'
    };
    
    methods: [
      'corporate_sso (Okta, Azure AD)',
      'hardware_security_keys (YubiKey)',
      'certificate_based_auth',
      'time_based_otp'
    ];
    
    stricterPolicies: {
      passwordRotation: '30 days mandatory',
      sessionTimeout: '30 minutes idle',
      ipWhitelisting: true,
      vpnRequired: true,
      workHoursOnly: true // Optional restriction
    };
  };
  
  authorization: {
    model: 'RBAC + ABAC (Attribute-Based)',
    principleOfLeastPrivilege: true,
    justInTimeAccess: true,
    approvalWorkflows: 'For sensitive operations';
    
    permissions: {
      support: [
        'user.read',
        'tickets.manage',
        'basic_analytics.read'
      ];
      
      analyst: [
        'analytics.read',
        'reports.generate',
        'data.export (anonymized)'
      ];
      
      developer: [
        'logs.read',
        'system.deploy (non-prod)',
        'debug.access'
      ];
      
      security: [
        'audit_logs.read',
        'security_events.manage',
        'user.suspend',
        'security_settings.write'
      ];
      
      superAdmin: [
        'system.admin',
        'user.admin',
        'financial.admin',
        'security.admin'
      ];
    };
  };
}
```

### 2. Admin Access Controls
```typescript
interface AdminAccessControls {
  networkSecurity: {
    vpnRequired: true,
    ipWhitelisting: true,
    dedicatedNetworkSegment: true,
    zeroTrustArchitecture: true
  };
  
  privilegedAccessManagement: {
    justInTimeAccess: {
      enabled: true,
      maxDuration: '8 hours',
      approvalRequired: true,
      automaticRevocation: true
    };
    
    breakGlassAccess: {
      emergencyAccess: true,
      immediateNotification: true,
      postIncidentReview: 'Mandatory',
      auditTrail: 'Complete logging'
    };
    
    sessionRecording: {
      adminSessions: true,
      criticalOperations: true,
      videoRecording: 'For sensitive actions',
      retentionPeriod: '1 year'
    };
  };
  
  segregationOfDuties: {
    requireApproval: [
      'user_account_changes',
      'financial_operations',
      'system_configuration',
      'security_policy_changes'
    ];
    
    dualControl: {
      enabled: true,
      requiredFor: [
        'production_deployments',
        'database_changes',
        'security_incidents'
      ];
    };
  };
}
```

### 3. Admin Activity Monitoring
```typescript
interface AdminActivityMonitoring {
  realTimeMonitoring: {
    allAdminActions: true,
    privilegedCommands: true,
    dataAccess: true,
    configurationChanges: true
  };
  
  auditLogging: {
    immutableLogs: true,
    signedLogs: true,
    realTimeReplication: true,
    longTermRetention: '7 years',
    
    logDetails: {
      who: 'User identity + role',
      what: 'Exact action performed',
      when: 'Precise timestamp',
      where: 'IP + location + device',
      why: 'Business justification',
      result: 'Success/failure + details'
    };
  };
  
  alerting: {
    anomalousBehavior: true,
    offHoursAccess: true,
    privilegeEscalation: true,
    massDataAccess: true,
    configurationChanges: true
  };
}
```

## Technical Implementation

### 1. Database Schema for User Management
```sql
-- Users table with role hierarchy
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  user_type ENUM('public', 'admin') NOT NULL,
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP NULL
);

-- Role definitions
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  user_type ENUM('public', 'admin') NOT NULL,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User role assignments
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT true
);

-- Admin access requests (Just-in-Time)
CREATE TABLE admin_access_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  requested_permissions JSONB NOT NULL,
  justification TEXT NOT NULL,
  duration_hours INTEGER NOT NULL,
  status ENUM('pending', 'approved', 'denied', 'expired') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Comprehensive audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  user_type ENUM('public', 'admin'),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  session_id VARCHAR(255)
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_action_timestamp ON audit_logs(action, timestamp DESC);
CREATE INDEX idx_user_roles_user_active ON user_roles(user_id, is_active);
```

### 2. Authentication Service Implementation
```typescript
class AuthenticationService {
  // Public user authentication
  async authenticatePublicUser(credentials: PublicUserCredentials): Promise<AuthResult> {
    // Rate limiting check
    await this.checkRateLimit(credentials.email, 'login');
    
    // Verify credentials
    const user = await this.verifyCredentials(credentials);
    if (!user) {
      await this.logFailedAttempt(credentials.email);
      throw new InvalidCredentialsError();
    }
    
    // Check account status
    if (user.status !== 'active') {
      throw new AccountSuspendedError();
    }
    
    // Check if MFA is required
    if (this.isMFARequired(user)) {
      return this.initiateMFAChallenge(user);
    }
    
    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    // Log successful login
    await this.auditLog.log({
      userId: user.id,
      action: 'login',
      success: true,
      userType: 'public'
    });
    
    return tokens;
  }
  
  // Admin user authentication (stricter)
  async authenticateAdminUser(credentials: AdminUserCredentials): Promise<AuthResult> {
    // Stricter rate limiting
    await this.checkRateLimit(credentials.email, 'admin_login');
    
    // IP whitelist check
    if (!await this.isIpWhitelisted(credentials.ip)) {
      throw new UnauthorizedIpError();
    }
    
    // VPN requirement check
    if (!await this.isVpnConnection(credentials.ip)) {
      throw new VpnRequiredError();
    }
    
    // Work hours check (optional)
    if (this.isWorkHoursRestricted() && !this.isWorkHours()) {
      throw new OutsideWorkHoursError();
    }
    
    // Verify credentials
    const user = await this.verifyCredentials(credentials);
    if (!user || user.user_type !== 'admin') {
      await this.logFailedAttempt(credentials.email);
      throw new InvalidCredentialsError();
    }
    
    // Mandatory MFA for all admins
    if (!credentials.mfaToken) {
      return this.initiateMFAChallenge(user);
    }
    
    // Verify MFA
    if (!await this.verifyMFA(user, credentials.mfaToken)) {
      throw new InvalidMFAError();
    }
    
    // Generate tokens with shorter expiry
    const tokens = await this.generateAdminTokens(user);
    
    // Log admin login
    await this.auditLog.log({
      userId: user.id,
      action: 'admin_login',
      success: true,
      userType: 'admin',
      ipAddress: credentials.ip,
      userAgent: credentials.userAgent
    });
    
    return tokens;
  }
}
```

### 3. Authorization Middleware
```typescript
class AuthorizationMiddleware {
  // Public user authorization
  public authorizePublicUser(requiredPermissions: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = this.extractToken(req);
        const user = await this.validateToken(token);
        
        if (user.user_type !== 'public') {
          throw new UnauthorizedError();
        }
        
        // Check rate limits
        await this.checkUserRateLimit(user.id);
        
        // Check permissions
        const hasPermissions = await this.checkPermissions(user, requiredPermissions);
        if (!hasPermissions) {
          throw new InsufficientPermissionsError();
        }
        
        req.user = user;
        next();
      } catch (error) {
        res.status(401).json({ error: error.message });
      }
    };
  }
  
  // Admin user authorization (stricter)
  public authorizeAdminUser(requiredPermissions: string[], requireApproval: boolean = false) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = this.extractToken(req);
        const user = await this.validateToken(token);
        
        if (user.user_type !== 'admin') {
          throw new UnauthorizedError();
        }
        
        // IP whitelist check
        if (!await this.isIpWhitelisted(req.ip)) {
          throw new UnauthorizedIpError();
        }
        
        // Session timeout check
        if (this.isSessionExpired(user.last_activity)) {
          throw new SessionExpiredError();
        }
        
        // Check if user has active access
        const hasActiveAccess = await this.checkActiveAccess(user, requiredPermissions);
        if (!hasActiveAccess && !requireApproval) {
          throw new AccessNotGrantedError();
        }
        
        // For critical operations, require approval workflow
        if (requireApproval) {
          const approvalStatus = await this.checkApprovalStatus(user.id, req.url, req.method);
          if (approvalStatus !== 'approved') {
            throw new ApprovalRequiredError();
          }
        }
        
        // Log admin action
        await this.auditLog.log({
          userId: user.id,
          action: `${req.method} ${req.url}`,
          userType: 'admin',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          success: true
        });
        
        req.user = user;
        next();
      } catch (error) {
        // Log failed authorization
        await this.auditLog.log({
          action: `failed_authorization_${req.method}_${req.url}`,
          ipAddress: req.ip,
          success: false,
          error: error.message
        });
        
        res.status(401).json({ error: error.message });
      }
    };
  }
}
```

### 4. Just-in-Time Access Implementation
```typescript
class JustInTimeAccessService {
  async requestAccess(adminId: string, permissions: string[], justification: string, durationHours: number): Promise<string> {
    // Validate request
    if (durationHours > 8) {
      throw new Error('Maximum access duration is 8 hours');
    }
    
    const request = await this.db.adminAccessRequests.create({
      userId: adminId,
      requestedPermissions: permissions,
      justification,
      durationHours,
      status: 'pending'
    });
    
    // Notify approvers
    await this.notificationService.notifyApprovers(request);
    
    return request.id;
  }
  
  async approveAccess(requestId: string, approverId: string): Promise<void> {
    const request = await this.db.adminAccessRequests.findById(requestId);
    
    if (!request || request.status !== 'pending') {
      throw new Error('Invalid or already processed request');
    }
    
    // Update request status
    await this.db.adminAccessRequests.update(requestId, {
      status: 'approved',
      approvedBy: approverId,
      approvedAt: new Date(),
      expiresAt: new Date(Date.now() + request.durationHours * 60 * 60 * 1000)
    });
    
    // Grant temporary permissions
    await this.grantTemporaryPermissions(request.userId, request.requestedPermissions, request.durationHours);
    
    // Log approval
    await this.auditLog.log({
      userId: approverId,
      action: 'approve_jit_access',
      resourceId: requestId,
      userType: 'admin',
      success: true
    });
  }
  
  async revokeExpiredAccess(): Promise<void> {
    const expiredRequests = await this.db.adminAccessRequests.findExpired();
    
    for (const request of expiredRequests) {
      await this.revokeTemporaryPermissions(request.userId, request.requestedPermissions);
      await this.db.adminAccessRequests.update(request.id, { status: 'expired' });
    }
  }
}
```

## Security Monitoring Dashboard

### Admin Security Dashboard
```typescript
interface AdminSecurityDashboard {
  realTimeAlerts: {
    failedLoginAttempts: 'Admin accounts with multiple failed logins',
    suspiciousAccess: 'Unusual IP/location/time access',
    privilegeEscalation: 'Users gaining higher permissions',
    massDataAccess: 'Large data export operations'
  };
  
  metrics: {
    activeAdminSessions: 'Current admin users online',
    failedLoginRate: 'Failed admin login attempts',
    accessRequestsPending: 'JIT access requests awaiting approval',
    criticalActionsToday: 'High-risk operations performed'
  };
  
  auditReports: {
    daily: 'All admin activities',
    weekly: 'Privilege usage summary',
    monthly: 'Security compliance report',
    quarterly: 'Access review and cleanup'
  };
}
```

This comprehensive framework ensures that both admin and public users have appropriate security measures while maintaining usability and compliance with security best practices.