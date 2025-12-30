# QM Beauty Backend Library (`/lib`)

This directory contains all the core backend services and utilities for QM Beauty.

## 📁 Structure

```
lib/
├── supabase.ts              # Database client (Supabase/PostgreSQL)
├── whatsapp.ts              # WhatsApp Business Cloud API client
├── selcom.ts                # Selcom payment gateway integration
├── templates/
│   └── order-message.ts     # WhatsApp message templates
└── INSTALL.ts               # Installation helper
```

---

## 🔧 Core Services

### 1. **Supabase Client** ([supabase.ts](file:///c:/Users/mazag/.qoder/QM%20BEAUTY/qm-beauty/lib/supabase.ts))

**Purpose:** Database access layer for PostgreSQL via Supabase

**Usage:**
```typescript
import { supabase, createServerSupabaseClient } from '@/lib/supabase';

// Client-side usage
const { data, error } = await supabase
  .from('products')
  .select('*');

// Server-side usage (API routes)
const serverClient = createServerSupabaseClient();
```

**Configuration Required:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. **WhatsApp Client** ([whatsapp.ts](file:///c:/Users/mazag/.qoder/QM%20BEAUTY/qm-beauty/lib/whatsapp.ts))

**Purpose:** Send messages via WhatsApp Business Cloud API

**Usage:**
```typescript
import { whatsappClient } from '@/lib/whatsapp';

// Send text message
const result = await whatsappClient.sendTextMessage(
  '+255715123456',
  'Hello from QM Beauty!'
);

// Check if configured
if (whatsappClient.isConfigured()) {
  // Send message
}
```

**Key Features:**
- ✅ Text message sending
- ✅ Template message support
- ✅ Tanzania phone number formatting
- ✅ Error handling
- ✅ Configuration validation

**Configuration Required:**
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_RECIPIENT_NUMBER`

---

### 3. **Selcom Payment Client** ([selcom.ts](file:///c:/Users/mazag/.qoder/QM%20BEAUTY/qm-beauty/lib/selcom.ts))

**Purpose:** Process payments via Selcom Tanzania gateway

**Usage:**
```typescript
import { selcomClient } from '@/lib/selcom';

// Initiate web gateway payment
const payment = await selcomClient.initiatePayment({
  orderId: 'QB-123456',
  phone: '+255715123456',
  amount: 45000,
  customerName: 'Jane Doe',
});

// Initiate USSD push payment (SIM toolkit)
const pushPayment = await selcomClient.initiatePushPayment({
  orderId: 'QB-123456',
  phone: '+255715123456',
  amount: 45000,
  customerName: 'Jane Doe',
});

// Query payment status
const status = await selcomClient.queryPaymentStatus('QB-123456');

// Verify webhook signature
const isValid = selcomClient.verifyWebhookSignature(
  requestBody,
  signatureHeader
);
```

**Key Features:**
- ✅ Web gateway payments (redirect)
- ✅ USSD push payments (SIM toolkit)
- ✅ Auto-detect mobile money network
- ✅ Payment status queries
- ✅ Webhook signature verification
- ✅ HMAC authentication

**Supported Networks:**
- M-Pesa (Vodacom): 074, 075, 076
- Tigo Pesa: 071, 065, 067
- Airtel Money: 068, 069, 078
- Halopesa: 062

**Configuration Required:**
- `SELCOM_API_KEY`
- `SELCOM_API_SECRET`
- `SELCOM_VENDOR_ID`
- `SELCOM_BASE_URL`
- `SELCOM_WEBHOOK_SECRET`

---

### 4. **WhatsApp Message Templates** ([templates/order-message.ts](file:///c:/Users/mazag/.qoder/QM%20BEAUTY/qm-beauty/lib/templates/order-message.ts))

**Purpose:** Generate formatted WhatsApp messages

**Available Templates:**

#### **Order Message (to QM Beauty team)**
```typescript
import { generateOrderMessage } from '@/lib/templates/order-message';

const message = generateOrderMessage({
  orderCode: 'QB-123456',
  customerName: 'Jane Doe',
  customerPhone: '+255715123456',
  items: [
    { name: 'Face Cream', quantity: 1, price: 45000, subtotal: 45000 }
  ],
  totalAmount: 45000,
  timestamp: new Date(),
});
```

#### **Customer Confirmation**
```typescript
import { generateCustomerConfirmation } from '@/lib/templates/order-message';

const message = generateCustomerConfirmation({
  orderCode: 'QB-123456',
  customerName: 'Jane Doe',
  customerPhone: '+255715123456',
  items: [...],
  totalAmount: 45000,
});
```

#### **Booking Notification**
```typescript
import { generateBookingMessage } from '@/lib/templates/order-message';

const message = generateBookingMessage({
  customerName: 'Jane Doe',
  customerPhone: '+255715123456',
  customerEmail: 'jane@example.com',
  serviceName: 'Spa Treatment',
  startTime: new Date('2025-01-15T10:00:00Z'),
  endTime: new Date('2025-01-15T11:00:00Z'),
});
```

#### **Payment Confirmation**
```typescript
import { generatePaymentConfirmation } from '@/lib/templates/order-message';

const message = generatePaymentConfirmation({
  orderCode: 'QB-123456',
  amount: 45000,
  paymentMethod: 'M-PESA',
  transactionId: 'TXN789',
});
```

**Key Features:**
- ✅ Professional emoji formatting
- ✅ Tanzania currency formatting (TZS)
- ✅ Phone number validation
- ✅ Consistent messaging style

---

## 🔐 Security Best Practices

### **1. Environment Variables**

Never commit `.env.local` to Git. Always use environment variables for:
- API keys
- Secrets
- Database URLs
- Access tokens

### **2. Webhook Verification**

Always verify webhook signatures:

```typescript
// Selcom webhook
const isValid = selcomClient.verifyWebhookSignature(body, signature);
if (!isValid) {
  return res.status(403).json({ error: 'Invalid signature' });
}

// Calendly webhook
const isValid = verifyCalendlySignature(body, signature);
```

### **3. Phone Number Validation**

Use built-in validators:

```typescript
import { validateTanzaniaPhone } from '@/lib/templates/order-message';

if (!validateTanzaniaPhone(phone)) {
  throw new Error('Invalid phone number format');
}
```

---

## 📊 Error Handling

All services use consistent error handling patterns:

```typescript
interface Response {
  success: boolean;
  error?: string;
  data?: any;
}

// Example usage
const result = await whatsappClient.sendTextMessage(...);

if (!result.success) {
  console.error('WhatsApp Error:', result.error);
  // Handle error
} else {
  console.log('Message sent:', result.messageId);
}
```

---

## 🧪 Testing

### **Test WhatsApp Client**
```typescript
import { whatsappClient } from '@/lib/whatsapp';

// In API route or test file
export async function GET() {
  const result = await whatsappClient.sendTextMessage(
    '+255715727085',
    'Test message from QM Beauty'
  );
  
  return Response.json(result);
}
```

### **Test Selcom Payment**
```typescript
import { selcomClient } from '@/lib/selcom';

export async function POST(request: Request) {
  const result = await selcomClient.initiatePayment({
    orderId: 'TEST-001',
    phone: '+255715123456',
    amount: 1000, // 1,000 TZS for testing
    customerName: 'Test User',
  });
  
  return Response.json(result);
}
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Selcom API Guide](https://www.selcommobile.com/developer)
- [Calendly API Docs](https://developer.calendly.com)

---

## 🔄 Common Patterns

### **Pattern 1: API Route with Database + WhatsApp**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { whatsappClient } from '@/lib/whatsapp';

export async function POST(request: NextRequest) {
  // 1. Get data
  const body = await request.json();
  
  // 2. Save to database
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('orders')
    .insert(body)
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // 3. Send WhatsApp notification
  await whatsappClient.sendTextMessage(
    process.env.WHATSAPP_RECIPIENT_NUMBER!,
    `New order: ${data.orderCode}`
  );
  
  // 4. Return response
  return NextResponse.json({ success: true, data });
}
```

### **Pattern 2: Webhook Handler**

```typescript
export async function POST(request: NextRequest) {
  // 1. Get body and signature
  const body = await request.json();
  const signature = request.headers.get('x-signature');
  
  // 2. Verify signature
  const isValid = verifySignature(body, signature);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }
  
  // 3. Process webhook
  // ... handle event
  
  // 4. Always return 200 (prevent retries)
  return NextResponse.json({ success: true });
}
```

---

**For full setup instructions, see [BACKEND_SETUP.md](file:///c:/Users/mazag/.qoder/QM%20BEAUTY/qm-beauty/BACKEND_SETUP.md)**
