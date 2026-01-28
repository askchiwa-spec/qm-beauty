# Selcom Payment Integration Guide

## Configuration

### Required Environment Variables

Add these to your `.env.local` file for development or production:

```env
# Selcom Payment Gateway (Tanzania)
SELCOM_API_KEY="your_api_key_here"
SELCOM_API_SECRET="your_api_secret_here"
SELCOM_VENDOR_ID="your_vendor_id_here"
SELCOM_BASE_URL="https://apigw.selcommobile.com/v1"
SELCOM_WEBHOOK_SECRET="your_webhook_secret_here"

# Application URL (important for redirects)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"  # Update for production
```

### IP Whitelisting Requirement

Selcom has IP address restrictions. Your server's IP address must be whitelisted with Selcom. If you don't know your static IP address, use:

```bash
curl https://paypoint.selcommobile.com/getip.php
```

Contact Selcom support to whitelist your production server's IP address.

## API Endpoints

### 1. Payment Initiation
- **Endpoint**: `POST /api/payment/initiate`
- **Purpose**: Create a new payment request
- **Request Body**:
```json
{
  "orderRef": "ORDER123",
  "amount": 50000,
  "customer": {
    "name": "John Doe",
    "phone": "0715727085",
    "email": "john@example.com"
  },
  "description": "QM Beauty Product Purchase"
}
```

### 2. Payment Status Check
- **Endpoint**: `POST /api/payment/status`
- **Purpose**: Check the status of a payment
- **Request Body**:
```json
{
  "transactionId": "TRANSACTION123"
}
```

### 3. Payment Webhook
- **Endpoint**: `POST /api/payment/webhook`
- **Purpose**: Receive payment notifications from Selcom
- **Security**: Requires signature verification

## Supported Payment Methods

The system automatically detects the payment method based on the phone number prefix:
- **M-Pesa (Vodacom)**: Numbers starting with 074x, 075x, 076x
- **Tigo Pesa**: Numbers starting with 071x, 065x, 067x
- **Airtel Money**: Numbers starting with 068x, 069x, 078x
- **Halopesa (Halotel)**: Numbers starting with 062x

## Phone Number Format

The system accepts phone numbers in these formats:
- `0715727085`
- `715727085`
- `+255715727085`

All will be converted to Selcom-compatible format: `255715727085`

## Webhook Security

Webhooks from Selcom include a signature that must be verified using the `SELCOM_WEBHOOK_SECRET`. The webhook endpoint automatically handles this verification.

## Testing

For development, you can test the configuration status with:
- `GET /api/test/selcom`

## Production Deployment

1. Ensure your production server's IP is whitelisted with Selcom
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Set the correct environment variables in production
4. Configure SSL certificates for webhook security
5. Monitor logs for payment processing issues

## Troubleshooting

- **Connection Timeout**: Usually indicates IP address not whitelisted
- **Invalid Signature**: Check webhook secret matches what's configured in Selcom portal
- **Payment Failed**: Verify phone number format and sufficient balance in customer account

## Selcom Resources

- **Developer Documentation**: https://developers.selcommobile.com
- **Huduma Portal**: https://portal.selcompay.com
- **Support Email**: support@selcom.net
- **Mobile App**: Download "Selcom Huduma" from Play Store or App Store