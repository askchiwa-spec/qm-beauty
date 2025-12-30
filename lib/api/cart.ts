// Cart API utilities
export interface CartResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Generate or get session ID for guest users
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('qm-beauty-session');
  if (!sessionId) {
    sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('qm-beauty-session', sessionId);
  }
  return sessionId;
}

// Create or get cart from backend
export async function createCart(sessionId: string): Promise<CartResponse> {
  try {
    const response = await fetch('/api/cart/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Add item to cart via API
export async function addToCartAPI(
  cartId: string,
  productId: string,
  quantity: number,
  price: number
): Promise<CartResponse> {
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartId, productId, quantity, price }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Checkout cart and send WhatsApp
export async function checkoutCart(checkoutData: {
  cartId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  totalAmount: number;
}): Promise<CartResponse> {
  try {
    const response = await fetch('/api/cart/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
