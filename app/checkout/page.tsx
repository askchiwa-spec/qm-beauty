'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState('pickup');

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('qm-cart') || localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
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

  return (
    <div className="min-h-screen bg-[#faf7f2] py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-[#6b4f3a]">Checkout</h1>
          <p className="text-[#8b7356] mt-2">Complete your order in a few steps</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Customer & Delivery Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Information Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#6b4f3a] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[#b49a7b] rounded-full flex items-center justify-center text-white text-sm mr-3">1</span>
                Customer Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b49a7b] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                      +255
                    </span>
                    <input
                      type="tel"
                      placeholder="712345678"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-[#b49a7b] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b49a7b] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#6b4f3a] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[#b49a7b] rounded-full flex items-center justify-center text-white text-sm mr-3">2</span>
                Delivery Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedDelivery('home')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      selectedDelivery === 'home'
                        ? 'border-[#b49a7b] bg-[#faf7f2]'
                        : 'border-gray-200 hover:border-[#b49a7b]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#6b4f3a]">Home Delivery</span>
                      <span className="text-sm bg-[#b49a7b] text-white px-2 py-1 rounded">+ TZS 5,000</span>
                    </div>
                    <p className="text-sm text-gray-600">Delivery within 2-3 business days</p>
                    <p className="text-xs text-gray-500 mt-1">Dar es Salaam only</p>
                  </button>

                  <button
                    onClick={() => setSelectedDelivery('pickup')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      selectedDelivery === 'pickup'
                        ? 'border-[#b49a7b] bg-[#faf7f2]'
                        : 'border-gray-200 hover:border-[#b49a7b]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#6b4f3a]">Store Pickup</span>
                      <span className="text-sm bg-green-600 text-white px-2 py-1 rounded">Free</span>
                    </div>
                    <p className="text-sm text-gray-600">Pick up from our Upanga store</p>
                    <p className="text-xs text-gray-500 mt-1">Ready in 24 hours</p>
                  </button>
                </div>

                {selectedDelivery === 'home' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <textarea
                      placeholder="Street address, Landmark, Area (e.g., Oysterbay, Mikocheni)"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#b49a7b] focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Payment Methods Card - WITH LOGOS */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-[#6b4f3a] mb-4 flex items-center">
                <span className="w-8 h-8 bg-[#b49a7b] rounded-full flex items-center justify-center text-white text-sm mr-3">3</span>
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* WhatsApp Payment - with logo */}
                <button
                  onClick={() => setSelectedPayment('whatsapp')}
                  className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                    selectedPayment === 'whatsapp'
                      ? 'border-[#b49a7b] bg-[#faf7f2]'
                      : 'border-gray-200 hover:border-[#b49a7b]'
                  }`}
                >
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.01.61 3.96 1.76 5.61L2.05 22l4.63-1.8c1.63.9 3.46 1.38 5.36 1.38 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">Order via WhatsApp</p>
                    <p className="text-sm text-gray-500">Confirm payment details on WhatsApp</p>
                  </div>
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">Fast</span>
                </button>

                {/* Cash on Delivery */}
                <button
                  onClick={() => setSelectedPayment('cod')}
                  className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                    selectedPayment === 'cod'
                      ? 'border-[#b49a7b] bg-[#faf7f2]'
                      : 'border-gray-200 hover:border-[#b49a7b]'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">Pay when you receive your order</p>
                  </div>
                </button>

                {/* Mobile Money - WITH ALL MNO LOGOS */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 px-1">Mobile Money</p>
                  
                  {/* M-Pesa */}
                  <button
                    onClick={() => setSelectedPayment('mpesa')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                      selectedPayment === 'mpesa'
                        ? 'border-[#b49a7b] bg-[#faf7f2]'
                        : 'border-gray-200 hover:border-[#b49a7b]'
                    }`}
                  >
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      M
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">M-Pesa</p>
                      <p className="text-sm text-gray-500">Pay with Vodacom M-Pesa</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Popular</span>
                  </button>

                  {/* Tigo Pesa */}
                  <button
                    onClick={() => setSelectedPayment('tigopesa')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                      selectedPayment === 'tigopesa'
                        ? 'border-[#b49a7b] bg-[#faf7f2]'
                        : 'border-gray-200 hover:border-[#b49a7b]'
                    }`}
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      T
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">Tigo Pesa</p>
                      <p className="text-sm text-gray-500">Pay with Tigo Pesa</p>
                    </div>
                  </button>

                  {/* Airtel Money */}
                  <button
                    onClick={() => setSelectedPayment('airtel')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                      selectedPayment === 'airtel'
                        ? 'border-[#b49a7b] bg-[#faf7f2]'
                        : 'border-gray-200 hover:border-[#b49a7b]'
                    }`}
                  >
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      A
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">Airtel Money</p>
                      <p className="text-sm text-gray-500">Pay with Airtel Money</p>
                    </div>
                  </button>

                  {/* HaloPesa */}
                  <button
                    onClick={() => setSelectedPayment('halopesa')}
                    className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                      selectedPayment === 'halopesa'
                        ? 'border-[#b49a7b] bg-[#faf7f2]'
                        : 'border-gray-200 hover:border-[#b49a7b]'
                    }`}
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      H
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-800">HaloPesa</p>
                      <p className="text-sm text-gray-500">Pay with Halopesa</p>
                    </div>
                  </button>
                </div>

                {/* Bank Transfer */}
                <button
                  onClick={() => setSelectedPayment('bank')}
                  className={`w-full p-4 border-2 rounded-xl flex items-center space-x-4 transition-all ${
                    selectedPayment === 'bank'
                      ? 'border-[#b49a7b] bg-[#faf7f2]'
                      : 'border-gray-200 hover:border-[#b49a7b]'
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">Bank Transfer</p>
                    <p className="text-sm text-gray-500">Pay via CRDB, NMB, NBC</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-[#6b4f3a] mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {cart.items.map((item: any, index: number) => (
                  <div key={index} className="flex space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-[#b49a7b] mt-1">
                        TZS {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">TZS {cart.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">{selectedDelivery === 'home' ? 'TZS 5,000' : 'Free'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#6b4f3a] pt-2">
                  <span>Total</span>
                  <span>TZS {(cart.total + (selectedDelivery === 'home' ? 5000 : 0)).toLocaleString()}</span>
                </div>
              </div>

              <button
                disabled={!selectedPayment}
                className={`w-full mt-6 py-3 px-6 rounded-lg font-medium transition-all ${
                  selectedPayment
                    ? 'bg-[#b49a7b] text-white hover:bg-[#9a8266]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedPayment === 'whatsapp' 
                  ? 'Continue to WhatsApp'
                  : selectedPayment === 'cod'
                  ? 'Place Order'
                  : 'Pay Now'
                }
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Secure payment processing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
