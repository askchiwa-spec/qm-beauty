# 📱 Evolution API - WhatsApp Integration Setup

## 🌍 Why Evolution API for Tanzania?

Evolution API is a **self-hosted** WhatsApp solution that's perfect for Tanzanian businesses because:

✅ **No Meta Business Verification** - Start immediately without waiting weeks for approval  
✅ **Use Personal WhatsApp** - Connect any WhatsApp number (personal or business)  
✅ **Free & Open Source** - No monthly fees like Meta charges  
✅ **Full Control** - Host on your own server or local machine  
✅ **Rich Features** - Send text, images, documents, location, and more  
✅ **Reliable for Tanzania** - Works perfectly with local networks  

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Docker

Download and install Docker Desktop from: https://www.docker.com/products/docker-desktop/

### Step 2: Start Evolution API

Open PowerShell in your project folder and run:

```powershell
docker-compose -f docker-compose.evolution.yml up -d
```

This will:
- Download Evolution API image
- Start WhatsApp server on `http://localhost:8080`
- Create persistent storage for your WhatsApp sessions

### Step 3: Configure Environment Variables

Edit your `.env.local` file:

```env
# Enable Evolution API
USE_EVOLUTION_API="true"
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="your-strong-password-here"
EVOLUTION_INSTANCE_NAME="qm-beauty"
```

**Important:** Change `EVOLUTION_API_KEY` to a strong random password!

### Step 4: Connect WhatsApp

1. Start your Next.js app:
```powershell
npm run dev
```

2. In a new PowerShell window, create WhatsApp instance:
```powershell
curl -X POST http://localhost:8080/instance/create `
  -H "Content-Type: application/json" `
  -H "apikey: your-strong-password-here" `
  -d '{\"instanceName\":\"qm-beauty\",\"qrcode\":true}'
```

3. Get QR code:
```powershell
curl http://localhost:8080/instance/qrcode/qm-beauty `
  -H "apikey: your-strong-password-here"
```

4. **Scan the QR code** with WhatsApp on your phone:
   - Open WhatsApp → Settings → Linked Devices → Link a Device
   - Scan the QR code shown in the response

5. You're connected! 🎉

---

## 📋 API Endpoints

### Admin Endpoints (Your Next.js API)

#### Get Instance Status
```bash
GET http://localhost:3000/api/whatsapp/evolution
```

#### Create New Instance
```bash
POST http://localhost:3000/api/whatsapp/evolution
```

#### Logout Instance
```bash
DELETE http://localhost:3000/api/whatsapp/evolution?action=logout
```

#### Delete Instance
```bash
DELETE http://localhost:3000/api/whatsapp/evolution?action=delete
```

### Evolution API Direct Endpoints

#### Send Text Message
```bash
POST http://localhost:8080/message/sendText/qm-beauty
Headers:
  apikey: your-api-key
  Content-Type: application/json

Body:
{
  "number": "255715727085",
  "text": "Hello from QM Beauty!"
}
```

#### Send Image/Media
```bash
POST http://localhost:8080/message/sendMedia/qm-beauty
Headers:
  apikey: your-api-key
  Content-Type: application/json

Body:
{
  "number": "255715727085",
  "mediaUrl": "https://example.com/image.jpg",
  "caption": "Check out our products!"
}
```

#### Send Location
```bash
POST http://localhost:8080/message/sendLocation/qm-beauty
Headers:
  apikey: your-api-key
  Content-Type: application/json

Body:
{
  "number": "255715727085",
  "latitude": -6.7924,
  "longitude": 39.2083,
  "name": "QM Beauty Spa",
  "address": "Dar es Salaam, Tanzania"
}
```

---

## 💻 Usage in Your Code

The system automatically uses Evolution API if enabled, otherwise falls back to Meta Business API.

```typescript
import { unifiedWhatsApp } from '@/lib/unified-whatsapp';

// Send order confirmation
await unifiedWhatsApp.sendTextMessage(
  '+255715727085',
  'Thank you for your order! Order #QB-12345 confirmed.'
);

// Send product image
await unifiedWhatsApp.sendMediaMessage(
  '+255715727085',
  'https://qmbeauty.co.tz/images/product.jpg',
  'Check out our new organic face cream!'
);

// Send location
await unifiedWhatsApp.sendLocation(
  '+255715727085',
  -6.7924,
  39.2083,
  'QM Beauty Spa',
  'Dar es Salaam'
);
```

---

## 🔧 Advanced Configuration

### Enable Database Persistence (PostgreSQL)

Edit `docker-compose.evolution.yml` and uncomment the PostgreSQL section:

```yaml
postgres:
  container_name: qm-beauty-postgres
  image: postgres:15-alpine
  restart: always
  environment:
    POSTGRES_USER: evolution
    POSTGRES_PASSWORD: change-me-strong-password
    POSTGRES_DB: evolution
```

Also uncomment the database environment variables in the `evolution-api` service.

Then restart:
```powershell
docker-compose -f docker-compose.evolution.yml down
docker-compose -f docker-compose.evolution.yml up -d
```

### Enable Redis Cache

Uncomment the Redis service in `docker-compose.evolution.yml` and restart.

### Custom Port

Change port in `docker-compose.evolution.yml`:
```yaml
ports:
  - "9000:8080"  # External:Internal
```

Update `EVOLUTION_API_URL` in `.env.local`:
```env
EVOLUTION_API_URL="http://localhost:9000"
```

---

## 🛠️ Testing

### Test Connection Status
```powershell
# Check if Evolution API is running
curl http://localhost:8080
# Should return: {"status":"ok"}

# Check instance status
curl http://localhost:8080/instance/connectionState/qm-beauty `
  -H "apikey: your-api-key"
```

### Test Sending Message
```powershell
curl -X POST http://localhost:8080/message/sendText/qm-beauty `
  -H "Content-Type: application/json" `
  -H "apikey: your-api-key" `
  -d '{\"number\":\"255715727085\",\"text\":\"Test message from QM Beauty\"}'
```

### Check Logs
```powershell
docker logs qm-beauty-whatsapp
```

---

## 🔐 Production Deployment

### 1. Use Strong API Key
Generate a strong random key:
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### 2. Use HTTPS
Set up a reverse proxy (Nginx/Caddy) with SSL certificate for your Evolution API.

### 3. Restrict Access
Add IP whitelist in your firewall to only allow your Next.js server.

### 4. Enable Database
Use PostgreSQL to persist sessions across container restarts.

### 5. Backup Sessions
Regularly backup the Docker volumes:
```powershell
docker run --rm -v evolution_instances:/data -v ${PWD}:/backup `
  alpine tar czf /backup/whatsapp-backup.tar.gz /data
```

---

## 🆚 Evolution API vs Meta Business API

| Feature | Evolution API | Meta Business API |
|---------|--------------|-------------------|
| **Setup Time** | 5 minutes | 1-2 weeks (verification) |
| **Cost** | Free | Free tier + paid |
| **Number Type** | Any WhatsApp | Business verified only |
| **Approval** | None needed | Meta review required |
| **Message Types** | Text, Media, Location, Documents | Text, Templates only |
| **Template Requirement** | No | Yes (pre-approved) |
| **Hosting** | Self-hosted | Meta Cloud |
| **Tanzania Support** | Excellent | Good |
| **Rate Limits** | None | 1000 msg/day (free) |

**Recommendation:** Start with Evolution API for quick setup, then add Meta Business API later for scale.

---

## 📚 Resources

- **Evolution API Docs:** https://doc.evolution-api.com
- **API Reference:** https://doc.evolution-api.com/v2/pt/api-reference
- **GitHub:** https://github.com/EvolutionAPI/evolution-api
- **Community:** https://github.com/EvolutionAPI/evolution-api/discussions

---

## ❓ Troubleshooting

### QR Code Not Showing
```powershell
# Restart instance
curl -X DELETE http://localhost:8080/instance/logout/qm-beauty `
  -H "apikey: your-api-key"

# Get new QR code
curl http://localhost:8080/instance/qrcode/qm-beauty `
  -H "apikey: your-api-key"
```

### Connection Lost
WhatsApp will disconnect if:
- Phone is off for 14+ days
- Multiple devices linked
- WhatsApp app uninstalled

**Fix:** Just scan QR code again to reconnect.

### Messages Not Sending
1. Check instance is connected:
```powershell
curl http://localhost:8080/instance/connectionState/qm-beauty `
  -H "apikey: your-api-key"
```

2. Check Docker logs:
```powershell
docker logs qm-beauty-whatsapp --tail 100
```

3. Verify number format (should be `255XXXXXXXXX` - no plus, no spaces)

### Container Won't Start
```powershell
# Check if port 8080 is already in use
netstat -ano | findstr :8080

# If in use, stop other service or change port in docker-compose.yml
```

---

## 🎯 Next Steps

1. ✅ **Start Evolution API** - `docker-compose up -d`
2. ✅ **Configure `.env.local`** - Add API key
3. ✅ **Scan QR Code** - Connect WhatsApp
4. ✅ **Test Sending** - Try the curl commands
5. ✅ **Update Your Code** - Use `unifiedWhatsApp` client
6. 🚀 **Go Live!** - Start sending order confirmations

---

**Need Help?** Check the Evolution API documentation or create an issue on GitHub.

**Ready for Production?** Follow the production deployment section above for security best practices.
