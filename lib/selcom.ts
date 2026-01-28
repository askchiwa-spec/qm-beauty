// Selcom Payment Gateway Client for Tanzania
// Supports M-Pesa, Tigo Pesa, Airtel Money, Halopesa

import crypto from 'crypto';

interface SelcomConfig {
  apiKey: string;
  apiSecret: string;
  vendorId: string;
  baseUrl: string;
}

interface PaymentRequest {
  orderId: string;
  amount: number;
  phone: string;
  email?: string;
  customerName?: string;
}

interface PaymentResponse {
  success: boolean;
  reference?: string;
  transactionId?: string;
  redirectUrl?: string;
  error?: string;
}

interface WebhookData {
  reference: string;
  transactionId: string;
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  amount: number;
  phone: string;
  timestamp: string;
}

class SelcomClient {
  private config: SelcomConfig;

  constructor() {
    this.config = {
      apiKey: process.env.SELCOM_API_KEY || '',
      apiSecret: process.env.SELCOM_API_SECRET || '',
      vendorId: process.env.SELCOM_VENDOR_ID || '',
      baseUrl: process.env.SELCOM_BASE_URL || 'https://apigw.selcommobile.com/v1',
    };

    if (!this.isConfigured()) {
      console.warn('Selcom not configured. Set SELCOM_API_KEY, SELCOM_API_SECRET, and SELCOM_VENDOR_ID');
    }
  }

  /**
   * Initiate a payment request
   * Supports M-Pesa, Tigo Pesa, Airtel Money
   */
  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Selcom payment gateway not configured',
        };
      }

      // Generate unique reference
      const reference = this.generateReference(request.orderId);

      // Prepare payload
      const payload = {
        vendor: this.config.vendorId,
        order_id: request.orderId,
        buyer_email: request.email || 'customer@qmbeauty.co.tz',
        buyer_name: request.customerName || 'QM Beauty Customer',
        buyer_phone: this.formatPhoneNumber(request.phone),
        amount: request.amount,
        currency: 'TZS',
        no_of_items: 1,
        buyer_remarks: `Payment for order ${request.orderId}`,
        merchant_remarks: 'QM Beauty Purchase',
        no_redirection: 0,
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      };

      // Generate signed digest
      const timestamp = new Date().toISOString();
      const digest = this.generateDigest(payload, timestamp);

      // Make API call
      const response = await fetch(`${this.config.baseUrl}/checkout/create-order-minimal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `SELCOM ${this.config.apiKey}`,
          'Digest-Method': 'HS256',
          'Digest': digest,
          'Timestamp': timestamp,
          'Signed-Fields': this.extractSignedFields(payload).join(','),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.result_code !== 0) {
        console.error('Selcom Payment Error:', data);
        return {
          success: false,
          error: data.message || 'Failed to initiate payment',
        };
      }

      return {
        success: true,
        reference: reference,
        transactionId: data.order_id,
        redirectUrl: data.payment_gateway_url,
      };
    } catch (error: any) {
      console.error('Selcom Payment Exception:', error);
      return {
        success: false,
        error: error.message || 'Payment initiation failed',
      };
    }
  }

  /**
   * Initiate USSD push payment (for mobile money)
   * This triggers SIM toolkit on customer's phone
   */
  async initiatePushPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Selcom payment gateway not configured',
        };
      }

      const reference = this.generateReference(request.orderId);

      // Detect payment method from phone prefix
      const paymentMethod = this.detectPaymentMethod(request.phone);

      const payload = {
        vendor: this.config.vendorId,
        order_id: request.orderId,
        msisdn: this.formatPhoneNumber(request.phone),
        amount: request.amount,
        currency: 'TZS',
        payment_method: paymentMethod,
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      };

      const timestamp = new Date().toISOString();
      const digest = this.generateDigest(payload, timestamp);

      const response = await fetch(`${this.config.baseUrl}/checkout/wallet-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `SELCOM ${this.config.apiKey}`,
          'Digest-Method': 'HS256',
          'Digest': digest,
          'Timestamp': timestamp,
          'Signed-Fields': this.extractSignedFields(payload).join(','),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.result_code !== 0) {
        console.error('Selcom Push Payment Error:', data);
        return {
          success: false,
          error: data.message || 'Failed to initiate push payment',
        };
      }

      return {
        success: true,
        reference: reference,
        transactionId: data.transaction_id,
      };
    } catch (error: any) {
      console.error('Selcom Push Payment Exception:', error);
      return {
        success: false,
        error: error.message || 'Push payment failed',
      };
    }
  }

  /**
   * Query payment status
   */
  async queryPaymentStatus(orderId: string): Promise<any> {
    try {
      const payload = {
        vendor: this.config.vendorId,
        order_id: orderId,
      };

      const timestamp = new Date().toISOString();
      const digest = this.generateDigest(payload, timestamp);

      const response = await fetch(`${this.config.baseUrl}/checkout/order-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `SELCOM ${this.config.apiKey}`,
          'Digest-Method': 'HS256',
          'Digest': digest,
          'Timestamp': timestamp,
          'Signed-Fields': this.extractSignedFields(payload).join(','),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      return data;
    } catch (error: any) {
      console.error('Selcom Query Error:', error);
      return null;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    const webhookSecret = process.env.SELCOM_WEBHOOK_SECRET || '';
    const computed = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return computed === signature;
  }

  /**
   * Generate payment reference
   */
  private generateReference(orderId: string): string {
    const timestamp = Date.now();
    return `QB-${orderId}-${timestamp}`;
  }

  /**
   * Generate HMAC digest for authentication following Selcom API specification
   */
  private generateDigest(payload: any, timestamp: string): string {
    const signedFields = this.extractSignedFields(payload);
    const message = `timestamp=${timestamp}&${signedFields.map(field => `${field}=${payload[field]}`).join('&')}`;
    
    return crypto
      .createHmac('sha256', this.config.apiSecret)
      .update(message)
      .digest('base64');
  }

  /**
   * Extract field names for Signed-Fields header
   */
  private extractSignedFields(payload: any): string[] {
    const keys = Object.keys(payload).sort();

    return keys.filter(key => payload[key] !== null && payload[key] !== undefined);
  }

  /**
   * Format phone number for Selcom (Tanzania)
   * Input: 0715727085, 715727085, +255715727085
   * Output: 255715727085
   */
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[\s-]/g, '');

    if (cleaned.startsWith('+255')) {
      cleaned = cleaned.substring(1);
    } else if (cleaned.startsWith('0')) {
      cleaned = '255' + cleaned.substring(1);
    } else if (!cleaned.startsWith('255')) {
      cleaned = '255' + cleaned;
    }

    return cleaned;
  }

  /**
   * Detect payment method from phone number
   */
  private detectPaymentMethod(phone: string): string {
    const cleaned = this.formatPhoneNumber(phone);

    // M-Pesa (Vodacom): 255 74x, 75x, 76x
    if (/^255(74|75|76)/.test(cleaned)) {
      return 'MPESA';
    }
    
    // Tigo Pesa: 255 71x, 65x, 67x
    if (/^255(71|65|67)/.test(cleaned)) {
      return 'TIGOPESA';
    }
    
    // Airtel Money: 255 68x, 69x, 78x
    if (/^255(68|69|78)/.test(cleaned)) {
      return 'AIRTELMONEY';
    }
    
    // Halopesa (Halotel): 255 62x
    if (/^25562/.test(cleaned)) {
      return 'HALOPESA';
    }

    // Default to M-Pesa
    return 'MPESA';
  }

  /**
   * Check if Selcom is properly configured
   */
  isConfigured(): boolean {
    return Boolean(
      this.config.apiKey &&
      this.config.apiSecret &&
      this.config.vendorId
    );
  }
}

// Export singleton instance
export const selcomClient = new SelcomClient();

// Export for testing
export { SelcomClient };
