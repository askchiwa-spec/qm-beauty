# WhatsApp Integration Setup Instructions

## Current Status
The QM Beauty website has WhatsApp integration functionality, but the automated messaging system is not working because the Evolution API is not running.

## What's Currently Working
- Direct WhatsApp Web links (click-to-chat buttons) are functional
- Users can click WhatsApp buttons and start conversations
- The main floating WhatsApp button works with the correct business number (+255 657 120 151)

## What's NOT Working
- Automated order notifications to the business via WhatsApp
- Automated customer confirmations via WhatsApp
- These require the Evolution API to be running

## To Fully Restore Automated WhatsApp Messaging

### Option 1: Set Up Evolution API (Recommended for Production)

1. **Install Docker Desktop**:
   - Download from https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop

2. **Start the Evolution API**:
   ```bash
   # Using the provided script
   ./start-evolution.bat
   ```

3. **Connect Your WhatsApp**:
   - Open browser to: http://localhost:8080/instance/qrcode/qm-beauty
   - On your phone with +255 657 120 151:
     - Open WhatsApp
     - Go to Settings → Linked Devices
     - Tap "Link a Device"
     - Scan the QR code from your browser

4. **Verify the Setup**:
   - Visit: http://localhost:3002/test/whatsapp
   - You can send test messages and check the instance status

### Option 2: Use Meta WhatsApp Business API (Alternative)

1. **Get Meta WhatsApp Business API access**:
   - Register your business on Meta for Business
   - Apply for WhatsApp Business API access
   - Set up a WhatsApp Business Account

2. **Update Environment Variables**:
   ```env
   USE_EVOLUTION_API="false"
   WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
   WHATSAPP_BUSINESS_ACCOUNT_ID="your-business-account-id"
   WHATSAPP_ACCESS_TOKEN="your-access-token"
   WHATSAPP_WEBHOOK_VERIFY_TOKEN="your-webhook-verify-token"
   ```

## Current Configuration
Your `.env.local` file is already configured with:
- `USE_EVOLUTION_API="true"` (for when Evolution API is running)
- Business number: `+255657120151`
- API URL: `http://localhost:8080`
- Instance name: `qm-beauty`

## Testing WhatsApp Functionality
1. **For Direct Links**: Click any WhatsApp button on the site
2. **For Automated Messages**: Once Evolution API is running, place a test order
3. **Test Dashboard**: Visit http://localhost:3002/test/whatsapp when the API is running

## Troubleshooting
- If messages aren't sending: Check if Evolution API is running at http://localhost:8080
- If QR code isn't showing: Verify the instance is created properly
- Check logs: `docker logs qm-beauty-whatsapp` (when Docker is running)

## Important Notes
- The Evolution API is the recommended solution for Tanzania market
- It's self-hosted and doesn't require Meta approval
- It supports all Tanzanian mobile money providers
- The API handles both sending and receiving WhatsApp messages