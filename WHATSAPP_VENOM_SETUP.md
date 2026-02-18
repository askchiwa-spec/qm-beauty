# QM Beauty WhatsApp - Venom Bot Setup

## Overview
This guide sets up WhatsApp automation using Venom Bot instead of Evolution API.

## Prerequisites
- Node.js 18+ installed
- PM2 installed globally: `npm install -g pm2`
- Chrome/Chromium dependencies (for puppeteer)

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Puppeteer Dependencies (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils
```

### 3. Start WhatsApp Server

#### Development Mode:
```bash
npm run whatsapp:dev
```

#### Production Mode (with PM2):
```bash
npm run whatsapp:start
```

### 4. Scan QR Code
- When you start the server, a QR code will appear in the terminal
- Open WhatsApp on your phone
- Go to Settings > Linked Devices > Link a Device
- Scan the QR code displayed in the terminal

### 5. Managing the Service

```bash
# View logs
npm run whatsapp:logs

# Stop service
npm run whatsapp:stop

# Restart service
npm run whatsapp:restart

# PM2 commands
pm2 status
pm2 logs qm-beauty-whatsapp
pm2 stop qm-beauty-whatsapp
pm2 restart qm-beauty-whatsapp
```

## File Structure

```
lib/
  venom-whatsapp.ts    # Main Venom Bot integration
  whatsapp-chatbot.ts  # AI chatbot logic (existing)
whatsapp-server.ts     # Server startup script
ecosystem.config.js    # PM2 configuration
```

## Environment Variables

Add to your `.env.local`:

```env
# WhatsApp Configuration
WHATSAPP_ENABLED=true
WHATSAPP_SESSION_NAME=qm-beauty-session
```

## Troubleshooting

### QR Code Not Showing
- Make sure you have all puppeteer dependencies installed
- Check logs: `npm run whatsapp:logs`
- Try deleting the session folder: `rm -rf tokens/`

### Session Expired
- The session is saved automatically
- If you need to re-scan, delete the tokens folder and restart

### Memory Issues
- Venom Bot uses puppeteer which can be memory intensive
- The PM2 config limits memory to 1GB with auto-restart

## Migration from Evolution API

The following files were removed/modified:
- Removed: Evolution API Docker containers
- Removed: Evolution API integration files
- Added: Venom Bot integration (lib/venom-whatsapp.ts)
- Added: WhatsApp server (whatsapp-server.ts)
- Added: PM2 configuration (ecosystem.config.js)

Your existing chatbot logic in `lib/whatsapp-chatbot.ts` works with the new system.
