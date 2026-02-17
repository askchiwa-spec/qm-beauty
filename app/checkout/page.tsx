'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState('pickup');
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('qm-beauty-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Calculate total from cart items
        const total = parsedCart.reduce((sum: number, item: any) => {
          const price = item.product.salePrice || item.product.price;
          return sum + (price * item.quantity);
        }, 0);
        
        // Set cart with items and total
        setCart({
          items: parsedCart,
          total: total
        });
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf7f2] py-16">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h1 className="text-4xl font-light text-[#6b4f3a] mb-4">Your Cart is Empty</h1>
          <p className="text-[#8b7356] mb-8">Add some products to your cart before checking out</p>
          <Link 
            href="/shop" 
            className="inline-block bg-[#b49a7b] text-white px-8 py-3 rounded-lg hover:bg-[#9a8266] transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} Tsh`;
  };

  const handleCheckout = () => {
    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }
    
    // Create order data
    const orderData = {
      customerName: customerInfo.fullName,
      customerPhone: '+255' + customerInfo.phone,
      customerEmail: customerInfo.email,
      deliveryAddress: selectedDelivery === 'home' ? customerInfo.address : 'In-store pickup',
      items: cart.items.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.salePrice || item.product.price,
        subtotal: (item.product.salePrice || item.product.price) * item.quantity,
      })),
      totalAmount: cart.total + (selectedDelivery === 'home' ? 5000 : 0),
    };
    
    // Process payment based on selected method
    if (selectedPayment === 'whatsapp') {
      // Send WhatsApp message
      const cartItemsMessage = cart.items.map((item: any) => 
        `${item.quantity}x ${item.product.name} - ${(item.product.salePrice || item.product.price).toLocaleString()} Tsh each`
      ).join('\n');
      const total = cart.total + (selectedDelivery === 'home' ? 5000 : 0);
      const deliveryMsg = selectedDelivery === 'home' ? '\nDelivery: TZS 5,000\nAddress: ' + customerInfo.address : '\nDelivery: Free (Store Pickup)';
      const message = `Hello! I would like to place an order for the following items:\n\n${cartItemsMessage}\n\nTotal: ${total.toLocaleString()} Tsh${deliveryMsg}\n\nCustomer: ${customerInfo.fullName}\nPhone: +255${customerInfo.phone}\nEmail: ${customerInfo.email}`;
      
      window.open(
        `https://wa.me/255657120151?text=${encodeURIComponent(message)}`,
        '_blank'
      );
    } else if (['mpesa', 'tigopesa', 'airtel', 'halopesa'].includes(selectedPayment)) {
      // Redirect to payment page with order data
      const orderCode = 'QB-' + Date.now();
      localStorage.setItem('current-order', JSON.stringify({...orderData, orderCode}));
      window.location.href = `/payment?order=${orderCode}`;
    } else if (['visa', 'mastercard'].includes(selectedPayment)) {
      // Inform user that card payments are coming soon
      alert('Card payments (Visa/Mastercard) are coming soon. Please select another payment method.');
      return;
    } else {
      // Handle other payment methods
      alert(`Thank you for your order! We'll process your ${selectedPayment} payment shortly.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--cream)] to-[var(--soft-beige)] py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-serif font-light text-[var(--deep-charcoal)] mb-2">Complete Your Order</h1>
          <p className="text-[var(--textLight)]">Secure checkout process</p>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--rose-gold)] flex items-center justify-center text-white font-medium">1</div>
                <span className="mt-2 text-xs text-[var(--deep-charcoal)]">Cart</span>
              </div>
              <div className="w-16 h-0.5 bg-[var(--borderSoft)]"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--rose-gold)] flex items-center justify-center text-white font-medium">2</div>
                <span className="mt-2 text-xs text-[var(--deep-charcoal)]">Information</span>
              </div>
              <div className="w-16 h-0.5 bg-[var(--borderSoft)]"></div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">3</div>
                <span className="mt-2 text-xs text-[var(--deep-charcoal)]">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Customer & Delivery Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Information Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-[var(--borderSoft)]">
              <h2 className="text-xl font-serif font-semibold text-[var(--deep-charcoal)] mb-6 flex items-center">
                <span className="w-8 h-8 bg-[var(--rose-gold)] rounded-full flex items-center justify-center text-white text-sm mr-3">1</span>
                Customer Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--deep-charcoal)] mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) => handleCustomerInfoChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-[var(--borderSoft)] rounded-lg focus:ring-2 focus:ring-[var(--rose-gold)] focus:border-[var(--rose-gold)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--deep-charcoal)] mb-2">Phone Number *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-[var(--borderSoft)] bg-[var(--cream)] text-[var(--deep-charcoal)] text-sm">
                      +255
                    </span>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                      placeholder="712 345 678"
                      className="flex-1 px-4 py-3 border border-[var(--borderSoft)] rounded-r-lg focus:ring-2 focus:ring-[var(--rose-gold)] focus:border-[var(--rose-gold)] transition-colors"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--deep-charcoal)] mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 border border-[var(--borderSoft)] rounded-lg focus:ring-2 focus:ring-[var(--rose-gold)] focus:border-[var(--rose-gold)] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-[var(--borderSoft)]">
              <h2 className="text-xl font-serif font-semibold text-[var(--deep-charcoal)] mb-6 flex items-center">
                <span className="w-8 h-8 bg-[var(--rose-gold)] rounded-full flex items-center justify-center text-white text-sm mr-3">2</span>
                Delivery Information
              </h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setSelectedDelivery('home')}
                    className={`p-5 border-2 rounded-xl text-left transition-all ${
                      selectedDelivery === 'home'
                        ? 'border-[var(--rose-gold)] bg-[var(--cream)]'
                        : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[var(--deep-charcoal)]">Home Delivery</span>
                      <span className="text-sm bg-[var(--rose-gold)] text-white px-3 py-1 rounded">+ TZS 5,000</span>
                    </div>
                    <p className="text-sm text-[var(--textLight)]">Delivery within 2-3 business days</p>
                    <p className="text-xs text-[var(--textLight)] mt-1 opacity-70">Dar es Salaam only</p>
                  </button>

                  <button
                    onClick={() => setSelectedDelivery('pickup')}
                    className={`p-5 border-2 rounded-xl text-left transition-all ${
                      selectedDelivery === 'pickup'
                        ? 'border-[var(--rose-gold)] bg-[var(--cream)]'
                        : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[var(--deep-charcoal)]">Store Pickup</span>
                      <span className="text-sm bg-green-600 text-white px-3 py-1 rounded">Free</span>
                    </div>
                    <p className="text-sm text-[var(--textLight)]">Pick up from our Oysterbay store</p>
                    <p className="text-xs text-[var(--textLight)] mt-1 opacity-70">Ready in 24 hours</p>
                  </button>
                </div>

                {selectedDelivery === 'home' && (
                  <div className="mt-4 p-4 bg-[var(--cream)] rounded-lg border border-[var(--borderSoft)]">
                    <label className="block text-sm font-medium text-[var(--deep-charcoal)] mb-2">Delivery Address *</label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                      placeholder="Street address, Landmark, Area (e.g., Oysterbay, Mikocheni)"
                      rows={3}
                      className="w-full px-4 py-3 border border-[var(--borderSoft)] rounded-lg focus:ring-2 focus:ring-[var(--rose-gold)] focus:border-[var(--rose-gold)] transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods Card - WITH LOGOS */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-[var(--borderSoft)]">
              <h2 className="text-xl font-serif font-semibold text-[var(--deep-charcoal)] mb-6 flex items-center">
                <span className="w-8 h-8 bg-[var(--rose-gold)] rounded-full flex items-center justify-center text-white text-sm mr-3">3</span>
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* WhatsApp Payment - with logo */}
                <button
                  onClick={() => setSelectedPayment('whatsapp')}
                  className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                    selectedPayment === 'whatsapp'
                      ? 'border-[var(--rose-gold)] bg-[var(--cream)]'
                      : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
                  }`}
                >
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.01.61 3.96 1.76 5.61L2.05 22l4.63-1.8c1.63.9 3.46 1.38 5.36 1.38 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-[var(--deep-charcoal)]">Order via WhatsApp</p>
                    <p className="text-sm text-[var(--textLight)]">Confirm payment details on WhatsApp</p>
                  </div>
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">Fast</span>
                </button>

                {/* Cash on Delivery */}
                <button
                  onClick={() => setSelectedPayment('cod')}
                  className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                    selectedPayment === 'cod'
                      ? 'border-[var(--rose-gold)] bg-[var(--cream)]'
                      : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-[var(--deep-charcoal)]">Cash on Delivery</p>
                    <p className="text-sm text-[var(--textLight)]">Pay when you receive your order</p>
                  </div>
                </button>

                {/* Card Payments - Coming Soon */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[var(--deep-charcoal)] px-1">Card Payments</p>
                  
                  {/* Visa */}
                  <div className="w-full p-4 border-2 rounded-xl flex items-center space-x-4 opacity-60">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      V
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[var(--deep-charcoal)]">Visa</p>
                      <p className="text-sm text-[var(--textLight)]">Coming soon</p>
                    </div>
                    <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">Soon</span>
                  </div>

                  {/* Mastercard */}
                  <div className="w-full p-4 border-2 rounded-xl flex items-center space-x-4 opacity-60">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      M
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[var(--deep-charcoal)]">Mastercard</p>
                      <p className="text-sm text-[var(--textLight)]">Coming soon</p>
                    </div>
                    <span className="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">Soon</span>
                  </div>
                </div>

                {/* Mobile Money - WITH ALL MNO LOGOS */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-[var(--deep-charcoal)] px-1">Mobile Money</p>
                  
                  {/* M-Pesa */}
                  <button
                    onClick={() => setSelectedPayment('mpesa')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                      selectedPayment === 'mpesa'
                        ? 'border-[var(--rose-gold)] bg-[var(--cream)]'
                        : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
                    }`}
                  >
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      M
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[var(--deep-charcoal)]">M-Pesa</p>
                      <p className="text-sm text-[var(--textLight)]">Pay with Vodacom M-Pesa</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Popular</span>
                  </button>

                  {/* Tigo Pesa */}
                  <button
                    onClick={() => setSelectedPayment('tigopesa')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                      selectedPayment === 'tigopesa'
                        ? 'border-[var(--rose-gold)] bg-[var(--cream)]'
                        : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      T
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[var(--deep-charcoal)]">Tigo Pesa</p>
                      <p className="text-sm text-[var(--textLight)]">Pay with Tigo Pesa</p>
                    </div>
                  </button>

                  {/* Airtel Money */}
                  <button
                    onClick={() => setSelectedPayment('airtel')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                      selectedPayment === 'airtel'
                        ? 'border-[var(--rose-gold)] bg-[var(--cream)]'
                        : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
                    }`}
                  >
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      A
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[var(--deep-charcoal)]">Airtel Money</p>
                      <p className="text-sm text-[var(--textLight)]">Pay with Airtel Money</p>
                    </div>
                  </button>

                  {/* HaloPesa */}
                  <button
                    onClick={() => setSelectedPayment('halopesa')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                      selectedPayment === 'halopesa'
                        ? 'border-[var(--rose-gold)] bg-[var(--cream)]'
                        : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
                    }`}
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      H
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[var(--deep-charcoal)]">HaloPesa</p>
                      <p className="text-sm text-[var(--textLight)]">Pay with Halopesa</p>
                    </div>
                  </button>
                </div>

                {/* Bank Transfer */}
                <button
                  onClick={() => setSelectedPayment('bank')}
                  className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                    selectedPayment === 'bank'
                      ? 'border-[var(--rose-gold)] bg-[var(--cream)]'
                      : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-[var(--deep-charcoal)]">Bank Transfer</p>
                    <p className="text-sm text-[var(--textLight)]">Pay via CRDB, NMB, NBC</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-[var(--borderSoft)]">
              <h2 className="text-xl font-serif font-semibold text-[var(--deep-charcoal)] mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {cart.items.map((item: any, index: number) => (
                  <div key={index} className="flex space-x-4">
                    <div className="w-16 h-16 bg-[var(--cream)] rounded-lg overflow-hidden flex-shrink-0 border border-[var(--borderSoft)]">
                      {item.product.images && item.product.images[0] ? (
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--textLight)]">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--deep-charcoal)]">{item.product.name}</p>
                      <p className="text-xs text-[var(--textLight)]">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-[var(--rose-gold)] mt-1">
                        {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--borderSoft)] mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--textLight)]">Subtotal</span>
                  <span className="font-medium text-[var(--deep-charcoal)]">{formatPrice(cart.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--textLight)]">Delivery</span>
                  <span className="font-medium text-[var(--deep-charcoal)]">{selectedDelivery === 'home' ? formatPrice(5000) : 'Free'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[var(--deep-charcoal)] pt-2">
                  <span>Total</span>
                  <span>{formatPrice(cart.total + (selectedDelivery === 'home' ? 5000 : 0))}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!selectedPayment}
                className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-all ${
                  selectedPayment
                    ? 'bg-[var(--rose-gold)] text-white hover:bg-[var(--accent-gold)]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedPayment === 'whatsapp' 
                  ? 'Continue to WhatsApp'
                  : selectedPayment === 'cod'
                  ? 'Place Order'
                  : selectedPayment === 'visa' || selectedPayment === 'mastercard'
                  ? 'Coming Soon'
                  : 'Pay Now'
                }
              </button>

              <div className="flex items-center justify-center mt-4 space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">M</div>
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">T</div>
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">A</div>
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">H</div>
                <p className="text-xs text-[var(--textLight)] ml-2">Secure payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
