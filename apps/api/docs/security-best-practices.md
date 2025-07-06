# Security Best Practices Guide

This guide outlines security best practices for implementing and using the CryptoTracker authentication system, both for API integration and frontend development.

## API Security Implementation

### 1. Environment Configuration

**Environment Variables Setup:**
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars-long
JWT_REFRESH_SECRET=different-refresh-secret-key-even-longer
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database Security
DB_SSL_MODE=require
DB_SSL_CERT_PATH=/path/to/cert.pem

# Email Security
SMTP_TLS_ENABLED=true
SMTP_STARTTLS_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# Session Security
SESSION_SECURE=true
SESSION_SAME_SITE=strict
```

**Security Checklist:**
- ✅ Use strong, unique secrets (minimum 32 characters)
- ✅ Enable SSL/TLS for database connections
- ✅ Configure proper CORS policies
- ✅ Set secure session cookies
- ✅ Enable rate limiting
- ✅ Use environment-specific configurations

### 2. Password Security

**Implementation Requirements:**
```typescript
// Password validation rules
const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  noCommonPatterns: true
};

// Secure password hashing
const saltRounds = 12; // Recommended for production
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

**Best Practices:**
- Use bcrypt with minimum 12 salt rounds
- Implement password strength validation
- Prevent password reuse (store hash history)
- Implement progressive delays for failed attempts
- Never log or store plaintext passwords

### 3. JWT Token Security

**Secure JWT Implementation:**
```typescript
// Short-lived access tokens
const accessTokenConfig = {
  expiresIn: '15m',
  algorithm: 'HS256',
  issuer: 'cryptotracker-api',
  audience: 'cryptotracker-app'
};

// Longer-lived refresh tokens
const refreshTokenConfig = {
  expiresIn: '7d',
  algorithm: 'HS256',
  // Store in database for revocation capability
};
```

**Token Security Measures:**
- Use short expiration times (15 minutes for access tokens)
- Store refresh tokens in database for revocation
- Implement token rotation on refresh
- Add issuer/audience claims for validation
- Never expose tokens in URLs or logs

### 4. Rate Limiting Strategy

**Implementation Example:**
```typescript
// Login endpoint protection
const loginRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false
};

// Registration protection
const registerRateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many accounts created, please try again later'
};

// Password reset protection
const passwordResetLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset attempts per hour per email
  keyGenerator: (req) => req.body.email // Rate limit by email
};
```

### 5. Input Validation & Sanitization

**Validation Pipeline:**
```typescript
// Email validation
const emailSchema = z.string()
  .email()
  .max(255)
  .transform(email => email.toLowerCase().trim());

// Password validation
const passwordSchema = z.string()
  .min(8)
  .max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .refine(password => !commonPasswords.includes(password));

// Name validation
const nameSchema = z.string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z\s'-]+$/)
  .transform(name => name.trim());
```

**Sanitization Rules:**
- Validate all input data
- Sanitize HTML content
- Escape SQL queries (use parameterized queries)
- Limit input length
- Remove dangerous characters

## Frontend Security Implementation

### 1. Token Storage Security

**Secure Storage Strategy:**
```typescript
// AVOID: Storing in localStorage (XSS vulnerable)
// localStorage.setItem('token', accessToken); // ❌

// RECOMMENDED: Secure storage approaches
class SecureTokenStorage {
  // Option 1: HttpOnly cookies (most secure)
  static setTokenCookie(token: string) {
    // Set via secure HTTP-only cookie from backend
    document.cookie = `token=${token}; Secure; HttpOnly; SameSite=Strict`;
  }

  // Option 2: In-memory storage (lost on refresh)
  private static tokenStore = new Map<string, string>();
  
  static setToken(key: string, token: string) {
    this.tokenStore.set(key, token);
  }

  static getToken(key: string): string | null {
    return this.tokenStore.get(key) || null;
  }

  // Option 3: Encrypted localStorage (if other options not viable)
  static setEncryptedToken(token: string) {
    const encrypted = CryptoJS.AES.encrypt(token, userKey).toString();
    localStorage.setItem('token', encrypted);
  }
}
```

### 2. XSS Protection

**Content Security Policy:**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.cryptotracker.com;">
```

**Input Sanitization:**
```typescript
import DOMPurify from 'dompurify';

// Sanitize user input before rendering
const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []
  });
};

// Use in components
const UserProfile = ({ user }) => {
  const safeName = sanitizeInput(user.firstName);
  return <div>{safeName}</div>;
};
```

### 3. CSRF Protection

**Implementation:**
```typescript
// CSRF token handling
class CSRFProtection {
  static async getCSRFToken(): Promise<string> {
    const response = await fetch('/api/csrf-token');
    const { token } = await response.json();
    return token;
  }

  static async makeSecureRequest(url: string, options: RequestInit = {}) {
    const csrfToken = await this.getCSRFToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies
    });
  }
}
```

### 4. Secure Authentication Flow

**Login Implementation:**
```typescript
const SecureLoginForm = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous requests
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Validate input client-side
      const validation = loginSchema.safeParse(credentials);
      if (!validation.success) {
        throw new Error('Invalid input');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(validation.data)
      });

      if (response.status === 429) {
        setRateLimited(true);
        return;
      }

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Handle 2FA if required
      if (data.requires2FA) {
        // Redirect to 2FA page
        return;
      }

      // Successful login - redirect
      window.location.href = '/dashboard';
      
    } catch (error) {
      // Handle errors securely (don't expose sensitive info)
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
      // Clear password field for security
      setCredentials(prev => ({ ...prev, password: '' }));
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Form implementation */}
    </form>
  );
};
```

## Network Security

### 1. HTTPS Enforcement

**Server Configuration:**
```typescript
// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Security headers
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

### 2. API Security Headers

**Essential Headers:**
```typescript
// Security middleware
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature policy
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
});
```

## Database Security

### 1. Secure Database Configuration

**Connection Security:**
```typescript
const dbConfig = {
  type: 'postgres',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-cert.pem'),
    cert: fs.readFileSync('/path/to/client-cert.pem'),
    key: fs.readFileSync('/path/to/client-key.pem')
  } : false,
  logging: process.env.NODE_ENV === 'development',
  // Never log queries in production that might contain sensitive data
  logNotifications: false
};
```

### 2. Query Security

**Parameterized Queries:**
```typescript
// SECURE: Using TypeORM query builder
const user = await userRepository
  .createQueryBuilder('user')
  .where('user.email = :email', { email: sanitizedEmail })
  .getOne();

// SECURE: Using repository methods
const user = await userRepository.findOne({
  where: { email: sanitizedEmail }
});

// AVOID: String concatenation (SQL injection vulnerable)
// const query = `SELECT * FROM users WHERE email = '${email}'`; // ❌
```

### 3. Data Encryption

**Sensitive Data Encryption:**
```typescript
import { createCipher, createDecipher } from 'crypto';

class DataEncryption {
  private static algorithm = 'aes-256-gcm';
  private static key = process.env.ENCRYPTION_KEY;

  static encrypt(text: string): string {
    const cipher = createCipher(this.algorithm, this.key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  static decrypt(encrypted: string): string {
    const decipher = createDecipher(this.algorithm, this.key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

// Encrypt sensitive fields before storing
@Entity()
export class User {
  // ... other fields

  @Column({ 
    type: 'text',
    transformer: {
      to: (value: string) => DataEncryption.encrypt(value),
      from: (value: string) => DataEncryption.decrypt(value)
    }
  })
  phoneNumber: string;
}
```

## Monitoring & Logging

### 1. Security Event Logging

**Audit Trail Implementation:**
```typescript
interface SecurityEvent {
  userId?: string;
  email?: string;
  eventType: 'login' | 'logout' | 'failed_login' | 'password_change' | '2fa_enabled';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: any;
}

class SecurityLogger {
  static async logEvent(event: SecurityEvent) {
    // Log to secure audit system
    await auditRepository.save({
      ...event,
      id: uuidv4(),
      timestamp: new Date()
    });

    // Alert on suspicious activity
    if (event.eventType === 'failed_login') {
      await this.checkFailedLoginPattern(event);
    }
  }

  private static async checkFailedLoginPattern(event: SecurityEvent) {
    const recentFailures = await auditRepository.count({
      where: {
        eventType: 'failed_login',
        ipAddress: event.ipAddress,
        timestamp: MoreThan(new Date(Date.now() - 15 * 60 * 1000)) // 15 minutes
      }
    });

    if (recentFailures >= 5) {
      // Trigger security alert
      await securityAlerts.notify({
        type: 'brute_force_attempt',
        ipAddress: event.ipAddress,
        failureCount: recentFailures
      });
    }
  }
}
```

### 2. Error Handling

**Secure Error Responses:**
```typescript
// Error handler middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log full error details securely
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Return safe error message to client
  const isProduction = process.env.NODE_ENV === 'production';
  const errorResponse = {
    statusCode: 500,
    message: isProduction ? 'Internal server error' : error.message,
    ...(isProduction ? {} : { stack: error.stack })
  };

  res.status(500).json(errorResponse);
});
```

## Security Testing

### 1. Automated Security Testing

**Testing Checklist:**
```typescript
describe('Security Tests', () => {
  test('Should prevent SQL injection', async () => {
    const maliciousEmail = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/auth/login')
      .send({ email: maliciousEmail, password: 'test' });
    
    expect(response.status).toBe(400);
    
    // Verify database integrity
    const userCount = await userRepository.count();
    expect(userCount).toBeGreaterThan(0);
  });

  test('Should prevent XSS attacks', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: xssPayload,
        lastName: 'Test',
        email: 'test@example.com',
        password: 'Test123!'
      });
    
    expect(response.status).toBe(400);
  });

  test('Should enforce rate limiting', async () => {
    const requests = Array(10).fill(null).map(() => 
      request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' })
    );
    
    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

### 2. Security Scanning

**Regular Security Audits:**
```bash
# Dependency vulnerability scanning
npm audit

# Security linting
npm run security-lint

# OWASP dependency check
dependency-check --project "CryptoTracker" --scan ./

# Static security analysis
semgrep --config=auto .
```

## Deployment Security

### 1. Production Checklist

**Pre-deployment Security Verification:**
- [ ] All secrets stored in environment variables
- [ ] SSL/TLS certificates configured
- [ ] Database connections encrypted
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Error messages sanitized
- [ ] Logging configured (no sensitive data)
- [ ] Dependency vulnerabilities resolved
- [ ] Security tests passing

### 2. Infrastructure Security

**Docker Security:**
```dockerfile
# Use official, minimal base images
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set secure permissions
COPY --chown=nextjs:nodejs . .
USER nextjs

# Expose minimal ports
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

**Environment Security:**
```bash
# Firewall configuration
ufw allow 22     # SSH
ufw allow 80     # HTTP (redirect to HTTPS)
ufw allow 443    # HTTPS
ufw enable

# Fail2ban configuration for SSH protection
sudo apt-get install fail2ban

# Regular security updates
sudo apt-get update && sudo apt-get upgrade -y
```

This comprehensive security guide ensures that your CryptoTracker authentication system is protected against common vulnerabilities and follows industry best practices for both API and frontend security.