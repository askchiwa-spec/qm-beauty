'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { checkoutCart } from '@/lib/api/cart';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    deliveryMethod: 'delivery',
    paymentMethod: 'whatsapp'
  });
  
  const formatPrice = (price: number) => `${(price / 1000).toFixed(0)}k TSh`;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Get cart ID from localStorage
      const cartId = localStorage.getItem('qm-beauty-cart-id');
      if (!cartId) {
        throw new Error('Cart session expired. Please refresh and try again.');
      }
      
      // Prepare checkout data
      const checkoutData = {
        cartId,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        deliveryAddress: formData.deliveryMethod === 'delivery' 
          ? `${formData.address}, ${formData.city}` 
          : 'Pickup from Store - Upanga',
        items: items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.salePrice || item.product.price,
          subtotal: (item.product.salePrice || item.product.price) * item.quantity
        })),
        totalAmount: getTotalPrice()
      };
      
      // Submit checkout to backend (sends WhatsApp automatically)
      const result = await checkoutCart(checkoutData);
      
      if (!result.success) {
        throw new Error(result.error || 'Checkout failed. Please try again.');
      }
      
      // Handle payment method
      if (formData.paymentMethod === 'mobile') {
        // Redirect to payment page
        const orderCode = result.data?.orderCode;
        router.push(`/payment?order=${orderCode}`);
      } else {
        // WhatsApp or COD - show success message
        clearCart();
        
        // If manual notification links are provided (when WhatsApp API is not available),
        // pass them to the order confirmation page
        if (result.data?.manualNotification) {
          router.push(`/order-confirmation?order=${result.data?.orderCode}&manualNotification=true`);
          // Store the manual notification data in localStorage for the confirmation page
          localStorage.setItem('manualNotificationData', JSON.stringify(result.data.manualNotification));
        } else {
          router.push(`/order-confirmation?order=${result.data?.orderCode}`);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-6xl mb-4 block">🛒</span>
          <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some products to your cart before checking out
          </p>
          <Button variant="primary" onClick={() => router.push('/shop')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-8">
          Checkout
        </h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Customer Information</h2>
                
                <div className="space-y-4">
                  <Input
                    label="Full Name *"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                  />
                  
                  <Input
                    label="Phone Number *"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+255 XXX XXX XXX"
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Delivery Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--charcoal)] mb-2">
                      Delivery Method *
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="delivery"
                          value="delivery"
                          checked={formData.deliveryMethod === 'delivery'}
                          onChange={(e) => setFormData({...formData, deliveryMethod: e.target.value})}
                          className="w-4 h-4"
                        />
                        <span>Home Delivery (Dar es Salaam)</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="delivery"
                          value="pickup"
                          checked={formData.deliveryMethod === 'pickup'}
                          onChange={(e) => setFormData({...formData, deliveryMethod: e.target.value})}
                          className="w-4 h-4"
                        />
                        <span>Pickup from Store (Upanga)</span>
                      </label>
                    </div>
                  </div>
                  
                  {formData.deliveryMethod === 'delivery' && (
                    <>
                      <Input
                        label="Delivery Address *"
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Street address"
                      />
                      
                      <Input
                        label="City/Area *"
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="e.g., Oysterbay, Mikocheni"
                      />
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="whatsapp"
                      checked={formData.paymentMethod === 'whatsapp'}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-4 h-4"
                    />
                    <span>Order via WhatsApp (Confirm payment details on WhatsApp)</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-4 h-4"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="mobile"
                      checked={formData.paymentMethod === 'mobile'}
                      onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      className="w-4 h-4"
                    />
                    <span>Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)</span>
                  </label>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (
                  formData.paymentMethod === 'mobile' 
                    ? 'Continue to Payment' 
                    : 'Complete Order via WhatsApp'
                )}
              </Button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 pb-4 border-b">
                    <div className="w-16 h-16 bg-[var(--soft-beige)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🌿</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--charcoal)]">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--sage-green)]">
                        {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>To be confirmed</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[var(--charcoal)] pt-4 border-t">
                  <span>Total</span>
                  <span className="text-[var(--sage-green)]">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
              
              <div className="bg-[var(--cream)] rounded-lg p-4 text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Note:</strong> Final delivery charges will be confirmed on WhatsApp based on your location.
                </p>
                <p>
                  Payment can be made via mobile money or cash on delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
