# Telegram Authentication Setup Guide

This guide explains how to set up Telegram authentication for PTracker.

## Overview

Telegram authentication allows users to log in using their Telegram account. This provides a secure and convenient way for users to access PTracker without creating a separate account.

## Prerequisites

1. A Telegram account
2. Access to create a Telegram bot via @BotFather

## Step 1: Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather and send `/newbot`
3. **Choose a name** for your bot (e.g., "PTracker Auth Bot")
4. **Choose a username** for your bot (must end with 'bot', e.g., "ptracker_auth_bot")
5. **Save the bot token** that BotFather provides

## Step 2: Configure Domain

1. Send `/setdomain` to @BotFather
2. Select your bot
3. Enter your domain: `https://trailer.ngrok.io` (or your production domain)

## Step 3: Set Up Login Widget

1. Send `/setjoingroups` to @BotFather
2. Select your bot
3. Choose "Disable" (for security)

## Step 4: Update Environment Variables

Add the following to your `.env` file:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ123456789
TELEGRAM_BOT_NAME=ptracker_auth_bot
```

Replace:
- `TELEGRAM_BOT_TOKEN`: The token from BotFather (Step 1)
- `TELEGRAM_BOT_NAME`: Your bot's username (without @)

## Step 5: Testing

1. **Restart your API server** to load the new environment variables
2. **Visit your login page** and look for the Telegram button
3. **Click the Telegram button** and complete the authentication flow

## Authentication Flow

1. User clicks "Login with Telegram" on your website
2. Telegram widget opens asking for permission to share user data
3. User authorizes the request
4. Telegram sends encrypted user data to your frontend
5. Frontend sends the data to your API endpoint `/api/v1/auth/telegram`
6. API verifies the data using your bot token
7. API creates/finds user account and returns JWT tokens
8. User is logged in successfully

## Security Features

- **Data Verification**: All Telegram auth data is cryptographically verified using HMAC-SHA256
- **Time Validation**: Auth data expires after 24 hours
- **Domain Restriction**: Bot only works on configured domains
- **No Email Required**: Users are identified by Telegram ID

## Troubleshooting

### "Authentication data is too old"
- The auth data is older than 24 hours
- User needs to authenticate again

### "Invalid Telegram authentication data"
- Bot token might be incorrect
- Domain might not be configured properly
- Data might have been tampered with

### "Telegram bot token not configured"
- Environment variable `TELEGRAM_BOT_TOKEN` is missing or empty
- Restart the API server after adding the token

## Production Considerations

1. **Use HTTPS**: Telegram widgets require HTTPS in production
2. **Domain Verification**: Make sure your production domain is registered with @BotFather
3. **Rate Limiting**: Consider implementing rate limiting for the `/auth/telegram` endpoint
4. **User Privacy**: Inform users about what data is collected from Telegram

## API Endpoint

### POST /api/v1/auth/telegram

Authenticates a user using Telegram auth data.

**Request Body:**
```json
{
  "id": "123456789",
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://t.me/i/userpic/320/...",
  "auth_date": "1640995200",
  "hash": "abc123..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "telegram_123456789@ptracker.local",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

## Frontend Integration

The Telegram login button automatically handles the authentication flow when properly configured:

```tsx
import { TelegramLogin } from '@/components/auth/telegram-login';

// Use the widget component
<TelegramLogin
  botName="ptracker_auth_bot"
  buttonSize="large"
  onAuth={(user) => console.log('Authenticated:', user)}
/>

// Or use the simple button component
<TelegramLoginButton
  onClick={() => handleTelegramLogin()}
  disabled={loading}
/>
```

## Support

For additional help with Telegram authentication:
1. Check the [Telegram Bot API documentation](https://core.telegram.org/bots/api)
2. Review the [Login Widget documentation](https://core.telegram.org/widgets/login)
3. Contact support with your bot configuration details