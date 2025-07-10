# Email Service Documentation

This module provides SMTP email functionality for the CryptoTracker application.

## Features

- **Email Verification**: Send verification emails to new users
- **Password Reset**: Send password reset emails with secure tokens
- **Welcome Emails**: Send welcome emails after successful verification
- **Portfolio Alerts**: Send alerts for portfolio events
- **Transaction Confirmations**: Send confirmations for portfolio transactions

## Configuration

Set the following environment variables in your `.env` file:

### Gmail Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="CryptoTracker" <noreply@ptracker.com>
APP_URL=http://localhost:3000
```

### Other Providers

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## Setup Instructions

### Gmail Setup
1. Enable 2-factor authentication on your Google account
2. Generate an app password: https://support.google.com/accounts/answer/185833
3. Use the app password as `SMTP_PASS`

### SendGrid Setup (Recommended for Production)
SendGrid offers better deliverability and analytics compared to personal email accounts.

**Quick Setup:**
1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Generate an API key with "Mail Send" permissions
3. Use the following configuration:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=SG.your-actual-api-key-here
   SMTP_FROM="CryptoTracker" <noreply@yourdomain.com>
   ```

**📖 For detailed setup instructions, see [SENDGRID_SETUP.md](./SENDGRID_SETUP.md)**

## Usage

The email service is automatically injected into the AuthService and used for:

- **User Registration**: Sends verification email
- **Password Reset**: Sends reset link via email
- **Email Verification**: Confirms user email addresses

### Manual Usage

```typescript
import { MailService } from './mail/mail.service';

constructor(private mailService: MailService) {}

// Send verification email
await this.mailService.sendEmailVerification(
  'user@example.com',
  'John Doe',
  'verification-token'
);

// Send password reset
await this.mailService.sendPasswordReset(
  'user@example.com',
  'John Doe',
  'reset-token'
);

// Send welcome email
await this.mailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

## Templates

Email templates are located in `src/mail/templates/` and use Handlebars syntax:

- `email-verification.hbs` - Email verification template
- `password-reset.hbs` - Password reset template  
- `welcome.hbs` - Welcome email template
- `portfolio-alert.hbs` - Portfolio alerts and notifications
- `transaction-confirmation.hbs` - Transaction confirmation emails

### Template Variables

#### Email Verification
- `{{name}}` - User's full name
- `{{email}}` - User's email address
- `{{verificationUrl}}` - Verification link

#### Password Reset
- `{{name}}` - User's full name
- `{{resetUrl}}` - Password reset link
- `{{expiresIn}}` - Token expiration time

#### Welcome Email
- `{{name}}` - User's full name
- `{{loginUrl}}` - Login page URL

#### Portfolio Alert
- `{{name}}` - User's full name
- `{{alertType}}` - Type of alert (e.g., "Price Alert", "Portfolio Change")
- `{{details.symbol}}` - Asset symbol (e.g., "BTC")
- `{{details.name}}` - Asset name (e.g., "Bitcoin")
- `{{details.currentPrice}}` - Current asset price
- `{{details.priceChange}}` - Price change percentage
- `{{details.isPositive}}` - Boolean for positive/negative change
- `{{details.portfolioValue}}` - Total portfolio value
- `{{details.threshold}}` - Alert threshold that was triggered
- `{{details.triggeredAt}}` - When the alert was triggered
- `{{dashboardUrl}}` - Dashboard URL

#### Transaction Confirmation
- `{{name}}` - User's full name
- `{{transaction.id}}` - Transaction ID
- `{{transaction.type}}` - Transaction type (BUY/SELL)
- `{{transaction.symbol}}` - Asset symbol
- `{{transaction.quantity}}` - Transaction quantity
- `{{transaction.price}}` - Price per unit
- `{{transaction.total}}` - Total transaction amount
- `{{transaction.fees}}` - Transaction fees
- `{{transaction.source}}` - Transaction source (MANUAL, API, etc.)
- `{{transaction.notes}}` - Optional transaction notes
- `{{transaction.executedAt}}` - Transaction execution time
- `{{portfolioUrl}}` - Portfolio URL

## Security Features

- SMTP connections use TLS encryption
- Email verification tokens expire in 24 hours
- Password reset tokens expire in 1 hour
- Templates include security warnings
- Production mode enforces strict TLS

## Error Handling

The email service includes error handling to prevent authentication failures due to email issues:

- Email failures are logged but don't block user registration
- Network timeouts are handled gracefully
- Invalid SMTP configurations are logged with details

## Testing

### Quick Email Test
Test your email configuration with a single command:

```bash
# Test with default email
npm run test:email

# Test with specific email
npm run test:email your-email@example.com
```

### Provider Switching
Easily switch between email providers:

```bash
# Switch to Gmail
./scripts/switch-email-provider.sh gmail

# Switch to SendGrid  
./scripts/switch-email-provider.sh sendgrid
```

### Development Testing Services
For development and testing, consider:
- [Mailtrap](https://mailtrap.io/) - Email testing service
- [MailHog](https://github.com/mailhog/MailHog) - Local email testing
- [Ethereal Email](https://ethereal.email/) - Fake SMTP service