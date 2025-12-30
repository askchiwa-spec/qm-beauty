# QM Beauty Backend Setup Guide

## 🎯 Overview

Complete backend implementation for QM Beauty e-commerce website with:
- ✅ Shopping cart with WhatsApp checkout
- ✅ Selcom Tanzania payment gateway (M-Pesa, Tigo, Airtel)
- ✅ WhatsApp Business Cloud API integration
- ✅ Calendly booking webhooks
- ✅ PostgreSQL database with Prisma ORM
- ✅ Supabase hosting

---

## 📦 Installation Steps

### 1. Install Dependencies

```bash
cd "c:\Users\mazag\.qoder\QM BEAUTY\qm-beauty"
npm install @prisma/client @supabase/supabase-js prisma
```

### 2. Configure Environment Variables

Copy the example file:
```bash
copy .env.local.example .env.local
```

Edit `.env.local` and fill in your credentials:

```env
# DATABASE (Supabase PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# WHATSAPP BUSINESS CLOUD API (Meta)
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_ACCESS_TOKEN="your-access-token"
WHATSAPP_RECIPIENT_NUMBER="+255715727085"

# SELCOM PAYMENT GATEWAY (Tanzania)
SELCOM_API_KEY="your-selcom-api-key"
SELCOM_API_SECRET="your-selcom-api-secret"
SELCOM_VENDOR_ID="your-vendor-id"
SELCOM_BASE_URL="https://apigw.selcommobile.com"
SELCOM_WEBHOOK_SECRET="your-webhook-secret"

# CALENDLY INTEGRATION
CALENDLY_API_KEY="your-calendly-api-key"
CALENDLY_WEBHOOK_SIGNING_KEY="your-webhook-signing-key"

# APPLICATION SETTINGS
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_CONTACT_PHONE="+255715727085"
```

### 3. Set Up Database

**Generate Prisma Client:**
```bash
npx prisma generate
```

**Push Database Schema:**
```bash
npx prisma db push
```

**Open Prisma Studio (optional):**
```bash
npx prisma studio
```

---

## 🔧 Configuration Guides

### A. Supabase Setup

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get your credentials:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`
4. Get Database URL:
   - Settings → Database → Connection String (URI)
   - Copy and update `DATABASE_URL`

### B. WhatsApp Business Cloud API Setup

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app → Business → WhatsApp
3. Get your credentials:
   - Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`
   - Access Token → `WHATSAPP_ACCESS_TOKEN`
4. Set recipient number (your QM Beauty WhatsApp):
   - `WHATSAPP_RECIPIENT_NUMBER="+255715727085"`

**Testing WhatsApp:**
```bash
# Use Meta's test phone numbers first
# Then verify with your actual business number
```

### C. Selcom Payment Gateway Setup

1. Contact Selcom Tanzania: [https://www.selcommobile.com](https://www.selcommobile.com)
2. Register as a merchant
3. Get your credentials:
   - API Key → `SELCOM_API_KEY`
   - API Secret → `SELCOM_API_SECRET`
   - Vendor ID → `SELCOM_VENDOR_ID`
4. Configure webhook URL:
   - Webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Set webhook secret → `SELCOM_WEBHOOK_SECRET`

**Supported Mobile Money:**
- M-Pesa (Vodacom): 074, 075, 076
- Tigo Pesa: 071, 065, 067
- Airtel Money: 068, 069, 078
- Halopesa: 062

### D. Calendly Integration Setup

1. Go to [Calendly Developer](https://developer.calendly.com)
2. Get API key → `CALENDLY_API_KEY`
3. Create webhook:
   - Webhook URL: `https://yourdomain.com/api/calendly/webhook`
   - Events: `invitee.created`, `invitee.canceled`, `invitee.rescheduled`
   - Get signing key → `CALENDLY_WEBHOOK_SIGNING_KEY`

---

## 🚀 API Endpoints

### Cart APIs

**Create Cart**
```bash
POST /api/cart/create
Content-Type: application/json

{
  "sessionId": "abc123",
  "userId": null
}
```

**Add to Cart**
```bash
POST /api/cart/add
Content-Type: application/json

{
  "cartId": "uuid-here",
  "productId": "product-123",
  "quantity": 2,
  "price": 45000
}
```

**Checkout**
```bash
POST /api/cart/checkout
Content-Type: application/json

{
  "cartId": "uuid-here",
  "customerName": "Jane Doe",
  "customerPhone": "+255715123456",
  "customerEmail": "jane@example.com",
  "deliveryAddress": "Dar es Salaam, Tanzania",
  "items": [
    {
      "name": "Luxury Face Cream",
      "quantity": 1,
      "price": 45000,
      "subtotal": 45000
    }
  ],
  "totalAmount": 45000
}
```

### Payment APIs

**Initiate Payment (Web Gateway)**
```bash
POST /api/payment/initiate
Content-Type: application/json

{
  "orderId": "QB-123456",
  "phone": "+255715123456",
  "amount": 45000,
  "customerName": "Jane Doe",
  "paymentType": "web"
}
```

**Initiate Payment (USSD Push)**
```bash
POST /api/payment/initiate
Content-Type: application/json

{
  "orderId": "QB-123456",
  "phone": "+255715123456",
  "amount": 45000,
  "customerName": "Jane Doe",
  "paymentType": "push"
}
```

**Check Payment Status**
```bash
GET /api/payment/status?orderId=QB-123456
```

**Payment Webhook** (Selcom calls this)
```bash
POST /api/payment/webhook
X-Selcom-Signature: hmac-signature-here

{
  "order_id": "QB-123456",
  "transaction_id": "TXN789",
  "status": "COMPLETED",
  "amount": 45000,
  "payment_method": "MPESA",
  "payment_phone": "+255715123456"
}
```

### Calendly Webhook

**Booking Webhook** (Calendly calls this)
```bash
POST /api/calendly/webhook
Calendly-Webhook-Signature: signature-here

{
  "event": "invitee.created",
  "payload": {
    "event": {
      "name": "Spa Treatment",
      "start_time": "2025-01-15T10:00:00Z"
    },
    "invitee": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "text_reminder_number": "+255715123456"
    }
  }
}
```

---

## 📊 Database Schema

### Tables Created

1. **User** - Customer accounts (optional)
2. **Product** - Product catalog
3. **Cart** - Shopping carts (session or user-based)
4. **CartItem** - Items in cart
5. **Order** - Placed orders
6. **Payment** - Payment transactions
7. **Booking** - Calendly appointments
8. **WhatsAppNumber** - Multi-number configuration
9. **ActivityLog** - Audit trail

### Key Features

- **Guest Checkout**: Session-based carts
- **Price Locking**: Cart items store price snapshot
- **Order Codes**: Format `QB-XXXXXX`
- **Phone Formats**: Tanzania `+255` format
- **Currency**: Stored as integers (avoid float issues)

---

## 🧪 Testing

### Test Cart Flow

```bash
# 1. Create cart
curl -X POST http://localhost:3001/api/cart/create \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-123"}'

# 2. Add item
curl -X POST http://localhost:3001/api/cart/add \
  -H "Content-Type: application/json" \
  -d '{"cartId": "YOUR_CART_ID", "productId": "prod-1", "quantity": 1, "price": 45000}'

# 3. Checkout (sends WhatsApp)
curl -X POST http://localhost:3001/api/cart/checkout \
  -H "Content-Type: application/json" \
  -d @test-checkout.json
```

### Test Payment Flow

```bash
# 1. Initiate payment
curl -X POST http://localhost:3001/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{"orderId": "QB-123456", "phone": "+255715123456", "amount": 45000, "customerName": "Test User", "paymentType": "push"}'

# 2. Check status
curl http://localhost:3001/api/payment/status?orderId=QB-123456
```

### Test Webhooks (Use ngrok for local testing)

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3001

# Use ngrok URL for webhook configuration:
# https://abc123.ngrok.io/api/payment/webhook
# https://abc123.ngrok.io/api/calendly/webhook
```

---

## 🔐 Security Checklist

- [x] Webhook signature verification (Selcom)
- [x] HMAC SHA256 authentication (Selcom)
- [x] Calendly signature verification
- [x] Environment variables (never commit `.env.local`)
- [x] HTTPS for webhooks (production)
- [x] Tanzania phone number validation
- [x] Idempotent webhook processing

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Settings → Environment Variables → Add all from .env.local
```

### Update Webhook URLs

After deployment, update:
1. Selcom webhook: `https://qmbeauty.vercel.app/api/payment/webhook`
2. Calendly webhook: `https://qmbeauty.vercel.app/api/calendly/webhook`

---

## 📱 WhatsApp Message Examples

### Order Confirmation (to QM Beauty)

```
🛍️ NEW ORDER - QM BEAUTY

📋 Order Details:
Order ID: QB-123456
Customer: Jane Doe
Phone: +255715123456

🛒 ITEMS ORDERED:
1. Luxury Face Cream
   Qty: 1 × TZS 45,000/= = TZS 45,000/=

━━━━━━━━━━━━━━━━
💰 TOTAL: TZS 45,000/=
━━━━━━━━━━━━━━━━

NEXT STEPS:
✅ Reply CONFIRM to proceed
❌ Reply CANCEL if unable to fulfill
```

### Payment Confirmation (to Customer)

```
✅ PAYMENT SUCCESSFUL - QM BEAUTY

Order: QB-123456
Amount Paid: TZS 45,000/=
Method: M-PESA
Transaction: TXN789

📦 Your order is being processed!
We'll contact you shortly for delivery.

Thank you for choosing QM Beauty! 💕
```

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset
```

### WhatsApp Not Sending

- Check `WHATSAPP_ACCESS_TOKEN` is valid
- Verify phone number format (`+255...`)
- Check Meta developer console for errors
- Ensure recipient number is verified

### Payment Webhook Not Receiving

- Use ngrok for local testing
- Check Selcom dashboard webhook logs
- Verify signature verification logic
- Ensure HTTPS in production

### Calendly Webhook Not Working

- Check signature key is correct
- Verify webhook URL is accessible
- Test with ngrok URL first
- Check Calendly dashboard webhook status

---

## 📞 Support

For issues:
1. Check logs: `console.log` in API routes
2. Test with Postman/cURL first
3. Verify all environment variables
4. Check third-party service dashboards

---

## 🎉 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Set up Supabase database
4. ✅ Test API endpoints locally
5. ✅ Configure WhatsApp Business
6. ✅ Register with Selcom
7. ✅ Set up Calendly webhooks
8. ✅ Deploy to Vercel
9. ✅ Test complete order flow
10. ✅ Go live! 🚀

---

**Built for QM Beauty Tanzania 🇹🇿**
