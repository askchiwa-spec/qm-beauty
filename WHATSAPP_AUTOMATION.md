# WhatsApp Automated Messaging System

## Overview
This system provides automated WhatsApp responses for booking confirmations and cart follow-ups using the Evolution API integration.

## Features Implemented

### 1. Automatic Booking Confirmations
- Sends detailed confirmation messages when bookings are made
- Includes service details, timing, location, and important information
- Triggered automatically when customers book services via WhatsApp

### 2. Cart Follow-up Messages
- Automatically identifies abandoned carts (inactive for 2+ hours)
- Sends personalized reminders with cart contents and special offers
- Encourages customers to complete their purchases

### 3. Message Templates

#### Booking Confirmation Template
```
✅ *Booking Confirmation*

Dear Valued Customer,

Your booking has been confirmed! 🎉

*Service*: Facial Treatment
*Date & Time*: 15/01/2026, 14:00
*Booking ID*: BK-A1B2C3D4

📍 *Location*
59 Ali Hassan Mwinyi Road
Oysterbay, Dar es Salaam

💡 *Important Information*
• Arrive 10 minutes early
• Bring this confirmation message
• Deposit of TZS 10,000/= is required

For any changes or questions, reply with your booking ID or call +255 657 120 151

We look forward to serving you! 💆‍♀️
```

#### Cart Follow-up Template
```
🛒 *Your Shopping Cart*

Hi there! 👋

We noticed you have items in your cart that haven't been checked out yet:

• Premium Face Cream x2 - TZS 30,000/=
• Natural Hair Oil x1 - TZS 12,000/=

*Total*: TZS 42,000/=

🎁 *Special Offer*
Complete your purchase now and get free delivery on orders over TZS 50,000/=

🛒 *Checkout Options*
1. Reply "CHECKOUT" to proceed
2. Visit: qmbeauty.co.tz/shop
3. Call: +255 657 120 151

⏰ *Hurry!* Items in your cart are reserved for 24 hours only.

Need help? Just ask! We're here to assist you. 💁‍♀️
```

## System Architecture

### Core Components

1. **`whatsapp-business-actions.ts`** - Main business logic handler
   - Processes incoming messages
   - Identifies business intents
   - Executes automated responses
   - New actions: `auto_booking_confirm`, `cart_followup`

2. **`whatsapp-cart-followup.ts`** - Cart abandonment detection
   - Monitors inactive carts
   - Identifies eligible customers
   - Triggers follow-up messages
   - Handles scheduling and rate limiting

3. **`app/api/whatsapp/automation/route.ts`** - API endpoints
   - RESTful interface for triggering automation
   - Authentication and security
   - Manual and scheduled triggering

### Integration Points

#### Booking System Integration
```typescript
// When a booking is created via WhatsApp
const booking = await prisma.booking.create({...});
// Automatic confirmation is sent 2 seconds later
setTimeout(() => {
  sendBookingConfirmation(phoneNumber, bookingDetails);
}, 2000);
```

#### Cart System Integration
```typescript
// Periodic check for abandoned carts
const result = await checkAbandonedCarts();
// Sends follow-up messages to customers with abandoned carts
```

## Setup and Configuration

### Environment Variables
```bash
WHATSAPP_AUTOMATION_SECRET=your-secret-key
DATABASE_URL=your-database-url
EVOLUTION_API_URL=your-evolution-api-url
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-token
```

### Scheduling Automation
The system can be triggered in multiple ways:

1. **Manual Testing**: 
   ```
   ./whatsapp-automation-demo.bat
   ```

2. **Cron Jobs** (Linux/Mac):
   ```bash
   # Run every hour
   0 * * * * /path/to/whatsapp-automation-demo.sh
   ```

3. **Task Scheduler** (Windows):
   - Create scheduled task to run `whatsapp-automation-demo.bat` hourly

4. **API Calls**:
   ```bash
   curl -X POST http://localhost:3000/api/whatsapp/automation \
     -H "Content-Type: application/json" \
     -d '{"action":"cart_followup","secret":"your-secret"}'
   ```

## Testing

### Health Check
```bash
curl http://localhost:3000/api/whatsapp/automation
```

### Manual Trigger
```bash
curl "http://localhost:3000/api/whatsapp/automation?action=cart_followup&secret=your-secret"
```

### Available Actions
- `cart_followup` - Check and message abandoned carts
- `scheduled_messages` - Run general scheduled tasks  
- `all` - Run all automation tasks

## Monitoring and Logging

All automated messages are logged with:
- Message content and recipient
- Success/failure status
- Error details if applicable
- Timing information

Check logs for:
```bash
# Success messages
INFO: Automatic booking confirmation sent
INFO: Cart follow-up message sent

# Error messages  
ERROR: Booking confirmation error
ERROR: Cart follow-up error
```

## Best Practices

1. **Rate Limiting**: Messages are delayed by 1 second between sends to avoid spamming
2. **Authentication**: All API endpoints require secret token verification
3. **Error Handling**: Comprehensive error handling with fallback responses
4. **Logging**: Detailed logging for monitoring and debugging
5. **Customer Privacy**: Only message customers who have opted in or have existing relationships

## Future Enhancements

- [ ] Personalized customer names in messages
- [ ] Dynamic special offers based on cart contents
- [ ] Multi-language support
- [ ] Advanced scheduling (different messages at different times)
- [ ] A/B testing for message effectiveness
- [ ] Integration with CRM system
- [ ] Analytics dashboard for message performance

## Troubleshooting

### Common Issues

1. **Messages not sending**
   - Check Evolution API connection
   - Verify phone number format (+255XXXXXXXXX)
   - Ensure customer has opted in to receive messages

2. **Automation not triggering**
   - Verify cron/task scheduler configuration
   - Check API endpoint accessibility
   - Review authentication secrets

3. **Database errors**
   - Ensure database connection
   - Check Prisma schema is up to date
   - Verify required tables exist

### Debug Commands

```bash
# Check API health
curl http://localhost:3000/api/whatsapp/automation

# Test specific action
curl -X POST http://localhost:3000/api/whatsapp/automation \
  -H "Content-Type: application/json" \
  -d '{"action":"cart_followup","secret":"demo-secret"}'

# View recent logs
tail -f /path/to/application/logs
```

This system provides a robust foundation for automated customer engagement through WhatsApp, helping to reduce booking drop-offs and recover abandoned shopping carts.