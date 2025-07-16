# OAuth Setup Guide for PTracker

This guide provides step-by-step instructions for setting up OAuth authentication with Google, Facebook, and Telegram for the PTracker application.

## Table of Contents
- [Google OAuth Setup](#google-oauth-setup)
- [Facebook OAuth Setup](#facebook-oauth-setup)
- [Telegram Bot Setup](#telegram-bot-setup)
- [Environment Configuration](#environment-configuration)
- [Testing OAuth Flows](#testing-oauth-flows)
- [Troubleshooting](#troubleshooting)

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "PTracker Auth"
4. Click "Create"

### Step 2: Enable Google+ API
1. In the dashboard, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in application name: "PTracker"
   - Add your email as support email
   - Add authorized domains: `ngrok.io` (for development)
   - Save and continue through scopes (default is fine)

### Step 4: Configure OAuth Client
1. Application type: "Web application"
2. Name: "PTracker Web Client"
3. Authorized JavaScript origins:
   ```
   https://trailer.ngrok.io
   https://trailer-api.ngrok.io
   http://localhost:3000
   http://localhost:3900
   ```
4. Authorized redirect URIs:
   ```
   https://trailer-api.ngrok.io/api/v1/auth/google/callback
   http://localhost:3001/api/v1/auth/google/callback
   ```
5. Click "Create"

### Step 5: Save Credentials
You'll receive:
- **Client ID**: `123-abc.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-123`

### Environment Variables for Google
```bash
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
GOOGLE_CALLBACK_URL="https://your-domain.com/api/v1/auth/google/callback"
```

---

## Facebook OAuth Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. App name: "PTracker"
5. App contact email: your-email@example.com
6. Click "Create App"

### Step 2: Add Facebook Login
1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform
4. Site URL: `https://trailer.ngrok.io`

### Step 3: Configure Facebook Login Settings
1. Go to "Facebook Login" → "Settings" in the left sidebar
2. Valid OAuth Redirect URIs:
   ```
   https://trailer-api.ngrok.io/api/v1/auth/facebook/callback
   http://localhost:3001/api/v1/auth/facebook/callback
   ```
3. Enable "Embedded Browser OAuth Login"
4. Save Changes

### Step 4: Basic Settings Configuration
1. Go to "Settings" → "Basic"
2. App Domains:
   ```
   trailer-api.ngrok.io
   trailer.ngrok.io
   localhost
   ```
3. Privacy Policy URL: `https://trailer.ngrok.io/privacy`
4. Terms of Service URL: `https://trailer.ngrok.io/terms`
5. Category: "Business and Pages"
6. Save Changes

### Step 5: App Review Settings
1. Go to "App Review" → "Permissions and Features"
2. Ensure these permissions are available:
   - `public_profile` (default)
   - `email` (may need to be added)

### Step 6: Get App Credentials
From "Settings" → "Basic":
- **App ID**: `714640821544286`
- **App Secret**: Click "Show" and copy the secret

### Environment Variables for Facebook
```bash
FACEBOOK_APP_ID="your-app-id-here"
FACEBOOK_APP_SECRET="your-app-secret-here"
FACEBOOK_CALLBACK_URL="https://your-domain.com/api/v1/auth/facebook/callback"
```

### Important Notes for Facebook
- For development, keep the app in "Development" mode
- For production, you'll need to submit for app review
- Facebook now requires `public_profile` scope to be explicitly requested
- Email permission must be added in the Facebook Login settings

---

## Telegram Bot Setup

### Step 1: Create a Telegram Bot
1. Open Telegram (mobile or desktop app)
2. Search for `@BotFather` in the search bar
3. Start a conversation with BotFather
4. Send the command: `/newbot`

### Step 2: Configure Bot Details
1. **Bot name**: When prompted, enter a display name (e.g., "PTracker Auth Bot")
2. **Username**: Choose a unique username ending with 'bot' (e.g., "ptracker_auth_bot")
   - Must be unique across Telegram
   - Can only contain letters, numbers, and underscores
   - Must end with 'bot'

### Step 3: Save Bot Credentials
BotFather will respond with:
```
Done! Congratulations on your new bot. You will find it at t.me/ptracker_auth_bot.

Use this token to access the HTTP API:
8097971990:AAGQh_ZvQT59HqYoEEEmtfW_rbMzsQdp83c

Keep your token secure and store it safely...
```

Extract:
- **Bot Token**: The long string (e.g., `8097971990:AAGQh_ZvQT59HqYoEEEmtfW_rbMzsQdp83c`)
- **Bot Name**: The username without @ (e.g., `ptracker_auth_bot`)

### Step 4: Configure Bot Settings (Optional but Recommended)
Send these commands to BotFather:

**Set description:**
```
/setdescription
@ptracker_auth_bot
Secure authentication for PTracker cryptocurrency portfolio tracker
```

**Set about text:**
```
/setabouttext
@ptracker_auth_bot
This bot handles secure login for PTracker users
```

**Disable group joins (for security):**
```
/setjoingroups
@ptracker_auth_bot
Disable
```

### Step 5: Set Bot Domain (Required for Login Widget)
```
/setdomain
@ptracker_auth_bot
trailer.ngrok.io
```

For production, update this to your actual domain.

### Environment Variables for Telegram
```bash
TELEGRAM_BOT_TOKEN="your-bot-token-here"
TELEGRAM_BOT_NAME="your_bot_username_without_@"
```

### Security Notes for Telegram
- **NEVER** commit your bot token to version control
- Keep the token secret - it provides full control of your bot
- If token is compromised, regenerate it using `/revoke` command with BotFather
- The bot token in this guide is just an example - use your actual token

---

## Environment Configuration

### Complete .env Configuration
Here's a complete example of OAuth-related environment variables:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="123-abc.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-123"
GOOGLE_CALLBACK_URL="https://your-api-domain.com/api/v1/auth/google/callback"

# Facebook OAuth
FACEBOOK_APP_ID="714640821544286"
FACEBOOK_APP_SECRET="c8c2f3acfd114457f9f1c2d7c537e22f"
FACEBOOK_CALLBACK_URL="https://your-api-domain.com/api/v1/auth/facebook/callback"

# Telegram Bot
TELEGRAM_BOT_TOKEN="123456:token890-0"
TELEGRAM_BOT_NAME="ptracker_auth_bot"

# Frontend URL (for OAuth redirects)
FRONTEND_URL="https://your-frontend-domain.com"
```

### Development vs Production

For development with ngrok:
```bash
# API Domain: https://trailer-api.ngrok.io
# Frontend Domain: https://trailer.ngrok.io
```

For production:
```bash
# API Domain: https://api.ptracker.com
# Frontend Domain: https://ptracker.com
```

---

## Testing OAuth Flows

### Testing Google OAuth
1. Navigate to your login page
2. Click "Continue with Google"
3. You should be redirected to Google's login page
4. After authentication, you'll be redirected back to `/auth/success`
5. Check that tokens are properly stored

### Testing Facebook OAuth
1. Navigate to your login page
2. Click "Continue with Facebook"
3. You should see Facebook's login dialog
4. Grant permissions when prompted
5. Verify redirect to `/auth/success`

### Testing Telegram OAuth
1. Navigate to your login page
2. Click "Continue with Telegram"
3. You'll see a Telegram login widget or be prompted to authorize
4. Confirm in Telegram app if using mobile
5. Check that user is created without email requirement

---

## Troubleshooting

### Google OAuth Issues

**"Error 400: redirect_uri_mismatch"**
- Ensure the callback URL in your .env exactly matches one in Google Console
- Check for trailing slashes
- Verify protocol (http vs https)

**"Access blocked: This app's request is invalid"**
- Configure OAuth consent screen
- Add all required domains to authorized domains

### Facebook OAuth Issues

**"Can't Load URL: The domain isn't included"**
- Add all domains to App Domains in Facebook settings
- Include both API and frontend domains
- Save changes in Facebook dashboard

**"Invalid Scopes: email"**
- Update to use `['public_profile', 'email']` array format
- Enable email permission in Facebook Login settings

**"URL Blocked: Redirect URI is not whitelisted"**
- Add exact callback URL to Valid OAuth Redirect URIs
- Check for URL encoding issues

### Telegram Bot Issues

**"Invalid Telegram authentication data"**
- Verify bot token is correct
- Check that domain is set via BotFather
- Ensure HMAC verification is working

**"Authentication data is too old"**
- Telegram auth data expires after 24 hours
- User needs to re-authenticate

### General OAuth Issues

**Tokens not being stored**
- Check CORS configuration
- Verify frontend and backend URLs match
- Ensure cookies/localStorage are working

**Redirect loops**
- Check that frontend URL in .env is correct
- Verify auth guard logic
- Clear browser cookies/cache

---

## Security Best Practices

1. **Never commit credentials to version control**
   - Use .env files
   - Add .env to .gitignore
   - Use environment variables in production

2. **Use HTTPS in production**
   - All OAuth providers require HTTPS
   - Except localhost for development

3. **Implement rate limiting**
   - Protect OAuth endpoints from abuse
   - Especially important for Telegram (no captcha)

4. **Validate all OAuth data**
   - Always verify tokens server-side
   - Check token expiration
   - Validate user data

5. **Regular credential rotation**
   - Periodically update client secrets
   - Monitor for suspicious activity
   - Have a process for quick revocation

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Telegram Login Widget Documentation](https://core.telegram.org/widgets/login)
- [Passport.js Documentation](http://www.passportjs.org/docs/)

---

## Support

If you encounter issues not covered in this guide:
1. Check the error logs in your API server
2. Verify all environment variables are set correctly
3. Ensure all domains are properly configured with each provider
4. Test with browser developer tools open to see exact error messages

Remember to restart your API server after updating environment variables!