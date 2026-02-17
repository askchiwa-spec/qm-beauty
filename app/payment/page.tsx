'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { PaymentProviderCard, PhoneNumberField, OrderSummaryCard } from '@/components/PaymentComponents';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('order');
  
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'tigo' | 'airtel' | 'halopesa' | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderCode) {
      router.push('/checkout');
    }
  }, [orderCode, router]);

  const handlePayment = async () => {
    if (!paymentMethod || !phoneNumber) {
      setError('Please select a payment method and enter a phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First, try to get order details from localStorage
      let orderData = null;
      try {
        const storedOrder = localStorage.getItem('current-order');
        if (storedOrder) {
          const parsedOrder = JSON.parse(storedOrder);
          // Check if the stored order matches the order code in URL
          if (parsedOrder.orderCode === orderCode) {
            orderData = {
              success: true,
              data: parsedOrder
            };
          }
        }
      } catch (storageErr) {
        console.error('Error reading from localStorage:', storageErr);
      }
      
      // If not found in localStorage, fetch from API
      if (!orderData || !orderData.success) {
        try {
          const orderResponse = await fetch(`/api/orders/${orderCode}`);
          orderData = await orderResponse.json();
        } catch (fetchErr) {
          console.error('Error fetching order from API:', fetchErr);
          throw new Error('Could not retrieve order details from any source');
        }
      }
      
      if (!orderData.success) {
        throw new Error('Could not retrieve order details');
      }
      
      // Validate phone number format
      const phoneRegex = /^(0|\+?255)?([0-9]{9})$/;
      if (!phoneRegex.test(phoneNumber)) {
        throw new Error('Please enter a valid Tanzania phone number (9 digits)');
      }
      
      // Format phone number to ensure it starts with +255
      const formattedPhone = phoneNumber.startsWith('0') ? '+255' + phoneNumber.substring(1) : 
                           phoneNumber.startsWith('255') ? '+' + phoneNumber : 
                           '+255' + phoneNumber;
      
      // For mobile money payments in Tanzania, we need to use the specific payment method
      // Selcom will auto-detect the method based on the phone number prefix when using wallet-payment
      // Map our payment method names to Selcom API format
      let selcomPaymentType = 'push';
      if (paymentMethod === 'halopesa') {
        selcomPaymentType = 'HALOPESA';
      } else if (paymentMethod === 'tigo') {
        selcomPaymentType = 'TIGOPESA';
      } else if (paymentMethod === 'airtel') {
        selcomPaymentType = 'AIRTELMONEY';
      } else if (paymentMethod === 'mpesa') {
        selcomPaymentType = 'MPESA';
      }
      
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderCode,
          amount: orderData.data.totalAmount,
          customer: {
            name: orderData.data.customerName || 'Customer',
            phone: formattedPhone,
            email: orderData.data.customerEmail || ''
          },
          paymentType: selcomPaymentType  // Use the Selcom-formatted payment type
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      // Store transaction ID for reference
      localStorage.setItem('current-transaction', data.data.transactionId || data.data.id);
      
      // Redirect to payment status page
      router.push(`/payment-status?order=${orderCode}&transaction=${data.data.transactionId || data.data.id}`);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  if (!orderCode) {
    return null;
  }

  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  // Get order details from localStorage or API
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // First, try to get order details from localStorage
        let orderData = null;
        try {
          const storedOrder = localStorage.getItem('current-order');
          if (storedOrder) {
            const parsedOrder = JSON.parse(storedOrder);
            // Check if the stored order matches the order code in URL
            if (parsedOrder.orderCode === orderCode) {
              orderData = {
                success: true,
                data: parsedOrder
              };
            }
          }
        } catch (storageErr) {
          console.error('Error reading from localStorage:', storageErr);
        }
        
        // If not found in localStorage, fetch from API
        if (!orderData || !orderData.success) {
          try {
            const orderResponse = await fetch(`/api/orders/${orderCode}`);
            orderData = await orderResponse.json();
          } catch (fetchErr) {
            console.error('Error fetching order from API:', fetchErr);
          }
        }
        
        if (orderData && orderData.success) {
          setOrderDetails(orderData.data);
        }
      } catch (err) {
        console.error('Error loading order details:', err);
      }
    };
    
    if (orderCode) {
      fetchOrderDetails();
    }
  }, [orderCode]);

  return (
    <div className="min-h-screen bg-[#f8f3ef] flex flex-col">
      <Head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Head>
      {/* Header Navigation */}
      <header className="bg-[#1b2a2c] py-4 px-8 border-b-4 border-[#e0b89d] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <a href="/" className="text-2xl font-medium bg-[#f5c842] text-[#1b2a2c] px-3 py-1 rounded-md mr-4">
            QM<span className="bg-transparent">Beauty</span>
          </a>
          <div className="hidden md:flex gap-8 flex-wrap">
            <a href="/" className="text-[#f0e2d8] hover:text-[#f5c842] text-sm font-medium uppercase tracking-[0.5px] transition-colors">
              Home
            </a>
            <a href="/shop" className="text-[#f0e2d8] hover:text-[#f5c842] text-sm font-medium uppercase tracking-[0.5px] transition-colors">
              Shop
            </a>
            <a href="/services" className="text-[#f0e2d8] hover:text-[#f5c842] text-sm font-medium uppercase tracking-[0.5px] transition-colors">
              Services
            </a>
            <a href="/appointments" className="text-[#f0e2d8] hover:text-[#f5c842] text-sm font-medium uppercase tracking-[0.5px] transition-colors">
              Appointments
            </a>
            <a href="/about" className="text-[#f0e2d8] hover:text-[#f5c842] text-sm font-medium uppercase tracking-[0.5px] transition-colors">
              About
            </a>
            <a href="/contact" className="text-[#f0e2d8] hover:text-[#f5c842] text-sm font-medium uppercase tracking-[0.5px] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </header>

      {/* Main Payment Content */}
      <div className="max-w-6xl mx-auto w-full py-10 px-8 flex flex-col lg:flex-row gap-8 flex-1">
        {/* Left Column - Payment Methods */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[rgba(210,170,150,0.3)]">
            <div className="bg-[#1b2a2c] text-white p-6">
              <h1 className="text-2xl font-light mb-2">Complete Payment</h1>
              <span className="inline-block bg-[#f5c842] text-[#1b2a2c] px-4 py-2 rounded-full font-bold text-sm">
                Order: {orderCode}
              </span>
            </div>
            
            <div className="p-8">
              <h2 className="text-lg font-semibold text-[#1b2a2c] mb-6 flex items-center gap-2">
                <i className="fas fa-credit-card"></i>
                Payment Method
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* M-Pesa */}
                <div 
                  className={`bg-[#f9f4ef] border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                    paymentMethod === 'mpesa' 
                      ? 'border-[#f5c842] bg-[#fffaf2] shadow-lg shadow-[rgba(181,141,122,0.3)]' 
                      : 'border-[#e9dbd0] hover:border-[#b58d7a] bg-[#fff5ed]'
                  } flex items-center gap-3`}
                  onClick={() => setPaymentMethod('mpesa')}
                >
                  <div className="w-12 h-12 bg-[#1b2a2c] rounded-full flex items-center justify-center text-[#f5c842] text-lg font-bold">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1b2a2c] text-sm">M-Pesa (Vodacom)</h3>
                    <div className="text-xs text-[#7f6a5c]">074, 075, 076</div>
                  </div>
                </div>

                {/* Tigo Pesa */}
                <div 
                  className={`bg-[#f9f4ef] border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                    paymentMethod === 'tigo' 
                      ? 'border-[#f5c842] bg-[#fffaf2] shadow-lg shadow-[rgba(181,141,122,0.3)]' 
                      : 'border-[#e9dbd0] hover:border-[#b58d7a] bg-[#fff5ed]'
                  } flex items-center gap-3`}
                  onClick={() => setPaymentMethod('tigo')}
                >
                  <div className="w-12 h-12 bg-[#1b2a2c] rounded-full flex items-center justify-center text-[#f5c842] text-lg font-bold">
                    <i className="fas fa-wifi"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1b2a2c] text-sm">Tigo Pesa</h3>
                    <div className="text-xs text-[#7f6a5c]">071, 065, 067</div>
                  </div>
                </div>

                {/* Airtel Money */}
                <div 
                  className={`bg-[#f9f4ef] border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                    paymentMethod === 'airtel' 
                      ? 'border-[#f5c842] bg-[#fffaf2] shadow-lg shadow-[rgba(181,141,122,0.3)]' 
                      : 'border-[#e9dbd0] hover:border-[#b58d7a] bg-[#fff5ed]'
                  } flex items-center gap-3`}
                  onClick={() => setPaymentMethod('airtel')}
                >
                  <div className="w-12 h-12 bg-[#1b2a2c] rounded-full flex items-center justify-center text-[#f5c842] text-lg font-bold">
                    <i className="fas fa-sim-card"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1b2a2c] text-sm">Airtel Money</h3>
                    <div className="text-xs text-[#7f6a5c]">068, 069, 078</div>
                  </div>
                </div>

                {/* HaloPesa */}
                <div 
                  className={`bg-[#f9f4ef] border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                    paymentMethod === 'halopesa' 
                      ? 'border-[#f5c842] bg-[#fffaf2] shadow-lg shadow-[rgba(181,141,122,0.3)]' 
                      : 'border-[#e9dbd0] hover:border-[#b58d7a] bg-[#fff5ed]'
                  } flex items-center gap-3`}
                  onClick={() => setPaymentMethod('halopesa')}
                >
                  <div className="w-12 h-12 bg-[#1b2a2c] rounded-full flex items-center justify-center text-[#f5c842] text-lg font-bold">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1b2a2c] text-sm">HaloPesa</h3>
                    <div className="text-xs text-[#7f6a5c]">062</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1b2a2c] mb-2">
                  Mobile Money Number
                </label>
                <div className="flex items-center bg-[#f9f4ef] border-2 border-[#e9dbd0] rounded-full px-4 transition-all focus-within:border-[#f5c842] focus-within:shadow-[0_0_0_4px_rgba(245,200,66,0.1)]">
                  <span className="text-lg font-medium text-[#b58d7a] mr-2">+255</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="712 345 678"
                    disabled={!paymentMethod}
                    className="flex-1 bg-transparent py-4 text-lg outline-none text-[#1b2a2c] placeholder-[#cbb5a8]"
                  />
                </div>
                <p className="text-xs text-[#7f6a5c] mt-2 ml-4">
                  Enter the phone number registered with your mobile money account
                </p>
              </div>

              <div className="bg-[#f9f4ef] rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-[#1b2a2c] mb-4 flex items-center gap-2">
                  <i className="fas fa-lightbulb text-[#f5c842]"></i>
                  How it works:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#e0b89d] rounded-full flex items-center justify-center text-[#1b2a2c] font-bold text-xs">
                      1
                    </div>
                    <span className="text-sm text-[#3a2e28]">Select your mobile money provider</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#e0b89d] rounded-full flex items-center justify-center text-[#1b2a2c] font-bold text-xs">
                      2
                    </div>
                    <span className="text-sm text-[#3a2e28]">Enter your mobile number</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#e0b89d] rounded-full flex items-center justify-center text-[#1b2a2c] font-bold text-xs">
                      3
                    </div>
                    <span className="text-sm text-[#3a2e28]">Click "Pay Now" to receive USSD prompt</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#e0b89d] rounded-full flex items-center justify-center text-[#1b2a2c] font-bold text-xs">
                      4
                    </div>
                    <span className="text-sm text-[#3a2e28]">Check your phone and approve the payment</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isLoading || !paymentMethod || !phoneNumber}
                  className={`py-4 px-6 rounded-full font-bold text-lg transition-all flex-2 justify-center items-center gap-2 ${
                    isLoading || !paymentMethod || !phoneNumber
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-[#f5c842] text-[#1b2a2c] hover:bg-[#f7d672] transform hover:-translate-y-1 shadow-lg shadow-[rgba(245,200,66,0.4)]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-[#1b2a2c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing…
                    </>
                  ) : 'Pay Now'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  disabled={isLoading}
                  className={`py-4 px-6 rounded-full font-semibold text-lg transition-all flex-1 justify-center items-center gap-1 ${
                    isLoading
                      ? 'bg-transparent border-2 border-[#b58d7a] text-[#1b2a2c] cursor-not-allowed'
                      : 'bg-transparent border-2 border-[#b58d7a] text-[#1b2a2c] hover:bg-[#b58d7a] hover:text-white'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-[rgba(210,170,150,0.3)] sticky top-24">
            <h2 className="text-xl font-semibold text-[#1b2a2c] mb-6 flex items-center gap-2">
              <i className="fas fa-receipt"></i>
              Order Summary
            </h2>
            
            {orderDetails ? (
              <>
                <div className="text-sm text-[#1b2a2c] mb-4">
                  <span className="font-medium">Order ID:</span> {orderDetails.orderCode}
                </div>
                
                {orderDetails.items && orderDetails.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between py-4 border-b border-[#f0e2d8]">
                    <div>
                      <div className="font-medium text-[#1b2a2c]">{item.name}</div>
                      <div className="text-sm text-[#7f6a5c]">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-[#1b2a2c]">
                      {(item.price * item.quantity).toLocaleString()} Tsh
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between py-6 font-bold text-lg text-[#1b2a2c]">
                  <span>Total</span>
                  <span>{orderDetails.totalAmount?.toLocaleString() || '0'} Tsh</span>
                </div>
              </>
            ) : (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            )}
            
            <div className="bg-[#edf0e6] rounded-full py-3 px-4 flex items-center justify-center gap-2 text-[#2f5e5e] text-sm mt-6">
              <i className="fas fa-shield-alt"></i>
              <span>Secured by QMBeauty Payment Gateway</span>
            </div>
            
            <div className="mt-6 text-center text-sm text-[#7f6a5c]">
              <i className="fas fa-check-circle text-[#2f7d4f]"></i> We accept: Mastercard, Visa, M-Pesa, Tigo Pesa, Airtel Money, Selcom
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#1b2a2c] text-[#ece2d9] py-6 px-8 mt-10 border-t-4 border-[#e0b89d]">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4 text-sm">
          <div>© 2026 QMBeauty Africa — natural · organic · ethical</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#f5c842] transition-colors">Privacy</a> | 
            <a href="#" className="hover:text-[#f5c842] transition-colors">Terms</a> | 
            <a href="#" className="hover:text-[#f5c842] transition-colors">Contact</a> | 
            <a href="#" className="hover:text-[#f5c842] transition-colors">
              <i className="fas fa-map-marker-alt"></i> View Map
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
