'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<{ items: CartItem[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('qm-cart') || localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (!cart) return;
    
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cart.items.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newCart = { items: updatedItems, total: newTotal };
    
    setCart(newCart);
    localStorage.setItem('qm-cart', JSON.stringify(newCart));
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (itemId: number) => {
    if (!cart) return;
    
    const updatedItems = cart.items.filter(item => item.id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newCart = { items: updatedItems, total: newTotal };
    
    setCart(newCart);
    localStorage.setItem('qm-cart', JSON.stringify(newCart));
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleWhatsAppOrder = () => {
    if (!cart || cart.items.length === 0) return;
    
    const phoneNumber = "255657120151"; // Your WhatsApp number
    let message = "Hello QM Beauty! I'd like to order:\n\n";
    
    cart.items.forEach(item => {
      message += `• ${item.name} - ${item.quantity}x @ TZS ${item.price.toLocaleString()}\n`;
    });
    
    message += `\nTotal: TZS ${cart.total.toLocaleString()}`;
    message += `\n\nDelivery: Home Delivery (Dar es Salaam)`;
    message += `\nPayment: Via WhatsApp`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#b49a7b] border-r-transparent"></div>
          <p className="mt-4 text-[#6b4f3a]">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf7f2] py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-2xl shadow-sm p-12">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h1 className="text-2xl font-light text-[#6b4f3a] mb-4">Your cart is empty</h1>
            <p className="text-[#8b7356] mb-8">Add some products to start shopping</p>
            <Link 
              href="/shop" 
              className="inline-block bg-[#b49a7b] text-white px-8 py-3 rounded-lg hover:bg-[#9a8266] transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-[#6b4f3a]">Shopping Cart</h1>
          <p className="text-[#8b7356] mt-1">{cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/96x96?text=QM';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#b49a7b] to-[#9a8266] flex items-center justify-center">
                        <span className="text-white text-xl font-bold">QM</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">TZS {item.price.toLocaleString()} each</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center mt-4">
                      <span className="text-sm text-gray-600 mr-3">Quantity:</span>
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 text-gray-800 border-x border-gray-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="ml-auto font-medium text-[#b49a7b]">
                        TZS {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-[#6b4f3a] mb-4">Order Summary</h2>
              
              {/* Subtotal */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">TZS {cart.total.toLocaleString()}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Shipping</span>
                <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Free</span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4">
                <span className="text-lg font-semibold text-[#6b4f3a]">Total</span>
                <span className="text-xl font-bold text-[#b49a7b]">TZS {cart.total.toLocaleString()}</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-4">
                {/* WhatsApp Order Button - MATCHES YOUR SCREENSHOT */}
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-green-500 text-white py-4 px-6 rounded-xl hover:bg-green-600 transition-all flex items-center justify-center space-x-3 font-medium"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.01.61 3.96 1.76 5.61L2.05 22l4.63-1.8c1.63.9 3.46 1.38 5.36 1.38 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.92-9.91-9.92z"/>
                  </svg>
                  <span>Order via WhatsApp</span>
                </button>

                {/* Proceed to Checkout Button - WITH MORE PAYMENT OPTIONS */}
                <Link
                  href="/checkout"
                  className="w-full bg-[#b49a7b] text-white py-4 px-6 rounded-xl hover:bg-[#9a8266] transition-all flex items-center justify-center space-x-3 font-medium"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Proceed to Checkout</span>
                </Link>
              </div>

              {/* Accepted Payments */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center mb-3">We accept</p>
                <div className="flex justify-center space-x-4">
                  <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center text-white text-[10px] font-bold">M</div>
                  <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-[10px] font-bold">T</div>
                  <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-[10px] font-bold">A</div>
                  <div className="w-10 h-6 bg-purple-600 rounded flex items-center justify-center text-white text-[10px] font-bold">H</div>
                  <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-[10px] font-bold">S</div>
                </div>
              </div>

              {/* Continue Shopping Link */}
              <Link
                href="/shop"
                className="block text-center text-sm text-gray-500 hover:text-[#b49a7b] transition-colors mt-4"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}