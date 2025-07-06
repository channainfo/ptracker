# SendGrid Email Setup Guide

SendGrid is a cloud-based email service that's highly recommended for production applications. It offers better deliverability, analytics, and scalability compared to personal email accounts.

## Why Choose SendGrid?

- ✅ **High Deliverability**: Better inbox placement rates
- ✅ **Analytics**: Track opens, clicks, bounces, and more
- ✅ **Scalability**: Handle thousands of emails per day
- ✅ **Reliability**: 99.9% uptime SLA
- ✅ **Security**: Built-in spam and fraud protection
- ✅ **Free Tier**: 100 emails/day forever free

## Step-by-Step Setup

### 1. Create SendGrid Account

1. Go to [SendGrid.com](https://sendgrid.com/)
2. Click "Start for Free"
3. Complete the registration process
4. Verify your email address

### 2. Domain Authentication (Recommended)

Domain authentication improves deliverability and removes "via sendgrid.net" from emails.

1. In SendGrid dashboard, go to **Settings > Sender Authentication**
2. Click **Authenticate Your Domain**
3. Choose your DNS provider
4. Enter your domain (e.g., `cryptotracker.com`)
5. Add the provided DNS records to your domain
6. Wait for verification (can take up to 48 hours)

### 3. Create API Key

1. Go to **Settings > API Keys**
2. Click **Create API Key**
3. Choose **Restricted Access**
4. Give it a name like "CryptoTracker API"
5. Grant the following permissions:
   - **Mail Send**: Full Access
   - **Suppressions**: Read Access (optional)
   - **Stats**: Read Access (optional)
6. Copy the generated API key (save it securely!)

### 4. Configure Environment Variables

Update your `.env` file with SendGrid configuration:

```env
# SendGrid Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-actual-api-key-here
SMTP_FROM="CryptoTracker" <noreply@yourdomain.com>
```

**Important Notes:**
- Always use `apikey` as the SMTP_USER (not your SendGrid username)
- The SMTP_PASS should be your actual API key starting with "SG."
- Use your authenticated domain in SMTP_FROM for better deliverability

### 5. Verify Configuration

Test your setup with a simple email:

```bash
# Start your application
npm run start

# In another terminal, test the API
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Check your email and SendGrid dashboard for delivery confirmation.

## Configuration Examples

### Basic Production Setup
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.abc123def456ghi789jkl012mno345pqr678stu901vwx234yzA
SMTP_FROM="CryptoTracker" <noreply@cryptotracker.com>
```

### Development/Testing Setup
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.test-api-key-for-development
SMTP_FROM="CryptoTracker Dev" <dev@cryptotracker.com>
```

### High-Volume Setup (with SSL)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=apikey
SMTP_PASS=SG.production-api-key-here
SMTP_FROM="CryptoTracker" <notifications@cryptotracker.com>
```

## Best Practices

### 1. Sender Reputation
- Always authenticate your domain
- Use consistent "From" addresses
- Monitor your sender reputation in SendGrid dashboard

### 2. Email Content
- Avoid spam trigger words
- Include clear unsubscribe links
- Use proper text-to-image ratios
- Test emails before sending to large lists

### 3. List Management
- Implement double opt-in for newsletters
- Remove bounced email addresses
- Respect unsubscribe requests immediately

### 4. Monitoring
- Set up event webhooks for bounce/spam notifications
- Monitor delivery rates in SendGrid dashboard
- Set up alerts for unusual activity

## Alternative Ports

SendGrid supports multiple SMTP ports:

| Port | Security | Use Case |
|------|----------|----------|
| 25   | None     | Not recommended |
| 587  | STARTTLS | Recommended (default) |
| 465  | SSL/TLS  | Legacy, but works |
| 2525 | STARTTLS | Alternative to 587 |

Use port 587 with `SMTP_SECURE=false` for most cases.

## Troubleshooting

### Common Issues

**1. Authentication Failed**
- Verify API key is correct and starts with "SG."
- Ensure SMTP_USER is exactly "apikey"
- Check API key permissions include "Mail Send"

**2. Emails Not Delivered**
- Check SendGrid Activity Feed for delivery status
- Verify sender domain is authenticated
- Check recipient spam folder
- Ensure "From" address matches authenticated domain

**3. Rate Limiting**
- Free tier: 100 emails/day
- Check your current usage in SendGrid dashboard
- Upgrade plan if needed

**4. Invalid From Address**
- Use authenticated domain in "From" address
- Format: `"Display Name" <email@domain.com>`
- Avoid generic domains (gmail.com, yahoo.com) in production

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// In mail.module.ts, add logging
transport: {
  host: configService.get('SMTP_HOST'),
  port: configService.get('SMTP_PORT'),
  secure: configService.get('SMTP_SECURE', false),
  auth: {
    user: configService.get('SMTP_USER'),
    pass: configService.get('SMTP_PASS'),
  },
  debug: true, // Enable debug logging
  logger: true, // Enable logger
},
```

## Scaling Tips

### For High Volume (1000+ emails/day)
1. Upgrade to paid SendGrid plan
2. Use dedicated IP address
3. Implement proper list segmentation
4. Set up IP warming schedule
5. Monitor sender reputation closely

### For Enterprise Use
1. Consider SendGrid's Marketing Campaigns for newsletters
2. Implement event webhooks for real-time tracking
3. Use SendGrid's template engine
4. Set up multiple API keys for different services
5. Implement proper error handling and retry logic

## Security Considerations

1. **Never commit API keys** to version control
2. **Rotate API keys** regularly (every 90 days)
3. **Use environment variables** for all credentials
4. **Restrict API key permissions** to minimum required
5. **Monitor API key usage** for suspicious activity
6. **Use HTTPS** for all webhook endpoints

## Cost Estimation

SendGrid pricing (as of 2025):

- **Free**: 100 emails/day forever
- **Essentials**: $14.95/month for 50,000 emails
- **Pro**: $89.95/month for 100,000 emails
- **Premier**: Custom pricing for enterprise

For CryptoTracker with moderate user base:
- User registration emails: ~100/day
- Password resets: ~20/day  
- Notifications: ~500/day
- **Recommended**: Start with Free tier, upgrade to Essentials when needed

## Support Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [SMTP Integration Guide](https://docs.sendgrid.com/for-developers/sending-email/smtp-api-overview)
- [SendGrid Status Page](https://status.sendgrid.com/)
- [Community Support](https://support.sendgrid.com/)

---

**Ready to switch to SendGrid?** Just uncomment the SendGrid configuration in your `.env` file and restart your application!