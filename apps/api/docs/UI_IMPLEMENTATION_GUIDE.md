# CryptoTracker Authentication & Security UI Implementation Guide

This guide provides comprehensive documentation for implementing user interfaces for the CryptoTracker authentication and security system.

## Overview

The CryptoTracker authentication system provides a complete solution for user management, security, and access control. This guide includes:

- Complete API documentation
- Ready-to-use React components
- Authentication hooks and utilities
- Security best practices
- Implementation examples

## Quick Start

### 1. Install Dependencies

```bash
npm install react react-dom
npm install @types/react @types/react-dom  # For TypeScript
npm install axios  # For API requests (optional)
```

### 2. Set Up Authentication Provider

```tsx
// App.tsx
import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <AuthProvider apiBaseUrl="https://api.ptracker.com/auth">
      <div className="app">
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><SecurityDashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}
```

### 3. Implement Protected Routes

```tsx
// components/ProtectedRoute.tsx
import React from 'react';
import { useRequireAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'moderator' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'user' 
}) => {
  const { isAuthenticated, isLoading } = useRequireAuth();
  const hasRole = useRoleAccess(requiredRole);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole) {
    return <div className="error">Access denied</div>;
  }

  return <>{children}</>;
};
```

## Component Documentation

### Authentication Components

#### LoginForm Component

**Features:**
- Email/password authentication
- Two-factor authentication support
- Social login (Google, Facebook)
- Form validation and error handling
- Rate limiting awareness
- Responsive design

**Usage:**
```tsx
import { LoginForm } from './components/LoginForm';

<LoginForm 
  onSuccess={() => navigate('/dashboard')}
  onRegisterClick={() => navigate('/register')}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `onSuccess` | `() => void` | Called after successful login |
| `onRegisterClick` | `() => void` | Called when user clicks register link |

#### RegisterForm Component

**Features:**
- User registration with validation
- Real-time password strength indicator
- Terms and conditions acceptance
- Social registration options
- Form validation with detailed feedback

**Usage:**
```tsx
import { RegisterForm } from './components/RegisterForm';

<RegisterForm 
  onSuccess={() => navigate('/email-verification')}
  onLoginClick={() => navigate('/login')}
/>
```

#### SecurityDashboard Component

**Features:**
- Security score overview
- Two-factor authentication management
- Activity log monitoring
- Security settings configuration
- Account management options

**Usage:**
```tsx
import { SecurityDashboard } from './components/SecurityDashboard';

<SecurityDashboard />
```

### Authentication Hooks

#### useAuth Hook

**Core authentication functionality:**
```tsx
const {
  user,                    // Current user object
  isAuthenticated,         // Authentication status
  isLoading,              // Loading state
  login,                  // Login function
  register,               // Registration function
  logout,                 // Logout function
  refreshTokens,          // Token refresh
  complete2FALogin,       // Complete 2FA login
  forgotPassword,         // Password reset request
  resetPassword,          // Password reset completion
  verifyEmail,           // Email verification
  updateProfile,         // Profile updates
  changePassword         // Password change
} = useAuth();
```

#### useRequireAuth Hook

**For protected routes:**
```tsx
const { isAuthenticated, isLoading } = useRequireAuth('/login');
```

#### useRoleAccess Hook

**For role-based access control:**
```tsx
const hasAdminAccess = useRoleAccess('admin');
const hasModeratorAccess = useRoleAccess('moderator');
```

#### useEmailVerification Hook

**For email verification management:**
```tsx
const {
  isEmailVerified,
  isVerifying,
  verificationSent,
  sendVerificationEmail,
  verify
} = useEmailVerification();
```

## API Integration

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | User registration |
| `/auth/login` | POST | User login |
| `/auth/logout` | POST | User logout |
| `/auth/refresh` | POST | Refresh tokens |
| `/auth/verify-email` | POST | Email verification |
| `/auth/forgot-password` | POST | Password reset request |
| `/auth/reset-password` | POST | Password reset completion |
| `/auth/2fa/enable` | POST | Enable 2FA |
| `/auth/2fa/verify` | POST | Verify 2FA setup |
| `/auth/2fa/login` | POST | Complete 2FA login |

### Request Examples

**User Registration:**
```typescript
const registerUser = async (userData: RegisterData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  return response.json();
};
```

**Protected API Requests:**
```typescript
const makeAuthenticatedRequest = async (url: string, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    // Handle token refresh or redirect to login
    await refreshTokens();
    // Retry request...
  }
  
  return response.json();
};
```

## Security Features

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character
- Maximum 128 characters

### Two-Factor Authentication

**Setup Flow:**
1. User enables 2FA in security settings
2. System generates QR code and backup codes
3. User scans QR code with authenticator app
4. User verifies setup with test code
5. 2FA is activated for account

**Login Flow with 2FA:**
1. User enters email/password
2. System validates credentials
3. If 2FA enabled, system requests verification code
4. User enters 6-digit code from authenticator
5. System validates and completes login

### Rate Limiting

- **Login attempts:** 5 per minute per IP
- **Registration:** 3 per minute per IP  
- **Password reset:** 1 per minute per email
- **Email verification:** 1 per minute per email

### Session Management

- **Access tokens:** 15-minute expiration
- **Refresh tokens:** 7-day expiration
- **Automatic refresh:** 14 minutes (before expiration)
- **Session invalidation:** On logout or password change

## Styling and Theming

### CSS Variables

```css
:root {
  /* Colors */
  --primary-color: #667eea;
  --primary-hover: #5a67d8;
  --secondary-color: #e2e8f0;
  --success-color: #48bb78;
  --error-color: #e53e3e;
  --warning-color: #ed8936;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
  --font-size-base: 16px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Borders */
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --border-width: 2px;
  
  /* Shadows */
  --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 10px 20px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 20px 40px rgba(0, 0, 0, 0.1);
}
```

### Component Theming

```css
/* Form styling */
.auth-form {
  background: white;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  width: 100%;
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-group input {
  width: 100%;
  padding: var(--spacing-md);
  border: var(--border-width) solid var(--secondary-color);
  border-radius: var(--border-radius);
  font-size: var(--font-size-base);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Button styling */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}
```

## Error Handling

### Error Types and Handling

```typescript
interface AuthError {
  code: string;
  message: string;
  field?: string;
}

const handleAuthError = (error: AuthError) => {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password';
    case 'EMAIL_NOT_VERIFIED':
      return 'Please verify your email before logging in';
    case 'ACCOUNT_LOCKED':
      return 'Account temporarily locked due to failed attempts';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Too many attempts. Please try again later';
    case 'WEAK_PASSWORD':
      return 'Password does not meet security requirements';
    case 'EMAIL_ALREADY_EXISTS':
      return 'An account with this email already exists';
    default:
      return 'An unexpected error occurred';
  }
};
```

### Error Display Components

```tsx
const ErrorBanner: React.FC<{ error: string }> = ({ error }) => (
  <div className="error-banner">
    <span className="error-icon">⚠️</span>
    <span className="error-message">{error}</span>
  </div>
);

const FieldError: React.FC<{ error?: string }> = ({ error }) => (
  error ? <span className="field-error">{error}</span> : null
);
```

## Accessibility

### ARIA Labels and Roles

```tsx
<form role="form" aria-labelledby="login-heading">
  <h2 id="login-heading">Sign In</h2>
  
  <div className="form-group">
    <label htmlFor="email">Email Address</label>
    <input
      type="email"
      id="email"
      name="email"
      aria-describedby="email-error"
      aria-invalid={!!errors.email}
      autoComplete="email"
    />
    <div id="email-error" role="alert" aria-live="polite">
      {errors.email}
    </div>
  </div>
  
  <button type="submit" aria-describedby="submit-status">
    Sign In
  </button>
  
  <div id="submit-status" role="status" aria-live="polite">
    {isLoading ? 'Signing in...' : ''}
  </div>
</form>
```

### Keyboard Navigation

```css
/* Focus indicators */
.btn:focus,
input:focus,
button:focus {
  outline: 3px solid var(--primary-color);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-color);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

## Testing

### Component Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  test('validates required fields', async () => {
    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    const onSuccess = jest.fn();
    render(<LoginForm onSuccess={onSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

### Integration Testing

```tsx
import { renderWithAuth } from '../test-utils';
import { SecurityDashboard } from '../SecurityDashboard';

describe('SecurityDashboard Integration', () => {
  test('enables 2FA successfully', async () => {
    const { user } = renderWithAuth(<SecurityDashboard />);
    
    fireEvent.click(screen.getByText('Enable 2FA'));
    
    await waitFor(() => {
      expect(screen.getByText('Scan the QR code')).toBeInTheDocument();
    });
    
    // Mock QR code scanning
    fireEvent.change(screen.getByPlaceholderText('000000'), {
      target: { value: '123456' }
    });
    
    fireEvent.click(screen.getByText('Complete Setup'));
    
    await waitFor(() => {
      expect(screen.getByText('Two-factor authentication enabled')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const SecurityDashboard = lazy(() => import('./components/SecurityDashboard'));
const RegisterForm = lazy(() => import('./components/RegisterForm'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      <Route path="/security" element={<SecurityDashboard />} />
      <Route path="/register" element={<RegisterForm />} />
    </Routes>
  </Suspense>
);
```

### Memoization

```tsx
import { memo, useMemo, useCallback } from 'react';

const LoginForm = memo(({ onSuccess, onRegisterClick }) => {
  const validationSchema = useMemo(() => ({
    email: z.string().email(),
    password: z.string().min(8)
  }), []);

  const handleSubmit = useCallback(async (data) => {
    // Handle form submission
  }, [onSuccess]);

  return (
    // Form implementation
  );
});
```

## Deployment Considerations

### Environment Variables

```bash
# Frontend environment variables
REACT_APP_API_URL=https://api.ptracker.com
REACT_APP_ENVIRONMENT=production
REACT_APP_SENTRY_DSN=your-sentry-dsn
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
```

### Build Optimization

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:analyze": "npm run build && npx bundle-analyzer build/static/js/*.js",
    "test:coverage": "npm test -- --coverage --watchAll=false"
  }
}
```

This comprehensive guide provides everything needed to implement a secure, user-friendly authentication system for the CryptoTracker application. The components are production-ready and follow modern React best practices.