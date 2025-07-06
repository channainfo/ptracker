#!/bin/bash

# Email Provider Switcher Script
# Usage: ./scripts/switch-email-provider.sh [gmail|sendgrid]

set -e

PROVIDER=$1
ENV_FILE=".env"

if [ -z "$PROVIDER" ]; then
    echo "📧 Email Provider Switcher"
    echo ""
    echo "Usage: ./scripts/switch-email-provider.sh [provider]"
    echo ""
    echo "Available providers:"
    echo "  gmail     - Switch to Gmail SMTP"
    echo "  sendgrid  - Switch to SendGrid SMTP"
    echo ""
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "🔄 Switching to $PROVIDER..."

case $PROVIDER in
    "gmail")
        echo "📱 Configuring Gmail SMTP..."
        
        # Comment out SendGrid config
        sed -i.bak 's/^SMTP_HOST=smtp\.sendgrid\.net/#SMTP_HOST=smtp.sendgrid.net/' "$ENV_FILE"
        sed -i.bak 's/^SMTP_USER=apikey/#SMTP_USER=apikey/' "$ENV_FILE"
        sed -i.bak 's/^SMTP_PASS=SG\./#SMTP_PASS=SG./' "$ENV_FILE"
        
        # Uncomment Gmail config
        sed -i.bak 's/#SMTP_HOST=smtp\.gmail\.com/SMTP_HOST=smtp.gmail.com/' "$ENV_FILE"
        sed -i.bak 's/#SMTP_USER=.*@gmail\.com/SMTP_USER=your-email@gmail.com/' "$ENV_FILE"
        sed -i.bak 's/#SMTP_PASS=.*app-password/SMTP_PASS=your-app-password/' "$ENV_FILE"
        
        echo "✅ Gmail configuration activated!"
        echo ""
        echo "📝 Don't forget to update:"
        echo "   - SMTP_USER with your Gmail address"
        echo "   - SMTP_PASS with your Gmail app password"
        echo ""
        echo "📖 Gmail setup guide: https://support.google.com/accounts/answer/185833"
        ;;
        
    "sendgrid")
        echo "📬 Configuring SendGrid SMTP..."
        
        # Comment out Gmail config
        sed -i.bak 's/^SMTP_HOST=smtp\.gmail\.com/#SMTP_HOST=smtp.gmail.com/' "$ENV_FILE"
        sed -i.bak 's/^SMTP_USER=.*@gmail\.com/#SMTP_USER=your-email@gmail.com/' "$ENV_FILE"
        sed -i.bak 's/^SMTP_PASS=.*[^S][^G]\./SMTP_PASS=your-app-password/' "$ENV_FILE"
        
        # Uncomment SendGrid config
        sed -i.bak 's/#SMTP_HOST=smtp\.sendgrid\.net/SMTP_HOST=smtp.sendgrid.net/' "$ENV_FILE"
        sed -i.bak 's/#SMTP_USER=apikey/SMTP_USER=apikey/' "$ENV_FILE"
        sed -i.bak 's/#SMTP_PASS=SG\./SMTP_PASS=SG.your-sendgrid-api-key/' "$ENV_FILE"
        
        echo "✅ SendGrid configuration activated!"
        echo ""
        echo "📝 Don't forget to update:"
        echo "   - SMTP_PASS with your SendGrid API key"
        echo "   - SMTP_FROM with your verified sender address"
        echo ""
        echo "📖 SendGrid setup guide: src/mail/SENDGRID_SETUP.md"
        ;;
        
    *)
        echo "❌ Unknown provider: $PROVIDER"
        echo "Available providers: gmail, sendgrid"
        exit 1
        ;;
esac

echo ""
echo "🧪 Test your configuration:"
echo "   npm run test:email your-test-email@example.com"
echo ""
echo "🚀 Restart your application to apply changes:"
echo "   npm run start"

# Clean up backup file
rm -f "$ENV_FILE.bak"