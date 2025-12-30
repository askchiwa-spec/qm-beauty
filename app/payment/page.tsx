'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('order');
  
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'tigo' | 'airtel' | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderCode) {
      router.push('/checkout');
    }
  }, [orderCode, router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!paymentMethod) {
        throw new Error('Please select a payment method');
      }

      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderCode,
          phone: phoneNumber,
          amount: 0, // This should come from order data
          customerName: '', // This should come from order data
          paymentType: 'push', // USSD push payment
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      // Redirect to payment status page
      router.push(`/payment-status?order=${orderCode}&transaction=${data.data.transactionId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  if (!orderCode) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 block">💳</span>
            <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-2">
              Complete Payment
            </h1>
            <p className="text-gray-600">
              Order: <span className="font-mono font-semibold">{orderCode}</span>
            </p>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            {/* Mobile Money Selection */}
            <div>
              <label className="block text-lg font-semibold text-[var(--charcoal)] mb-4">
                Select Payment Method
              </label>
              <div className="grid grid-cols-1 gap-3">
                <label 
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'mpesa' 
                      ? 'border-[var(--sage-green)] bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="mpesa"
                    checked={paymentMethod === 'mpesa'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'mpesa')}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--charcoal)]">M-Pesa (Vodacom)</div>
                    <div className="text-sm text-gray-600">074, 075, 076</div>
                  </div>
                  <span className="text-2xl">📱</span>
                </label>

                <label 
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'tigo' 
                      ? 'border-[var(--sage-green)] bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="tigo"
                    checked={paymentMethod === 'tigo'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'tigo')}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--charcoal)]">Tigo Pesa</div>
                    <div className="text-sm text-gray-600">071, 065, 067</div>
                  </div>
                  <span className="text-2xl">📱</span>
                </label>

                <label 
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'airtel' 
                      ? 'border-[var(--sage-green)] bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="airtel"
                    checked={paymentMethod === 'airtel'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'airtel')}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-[var(--charcoal)]">Airtel Money</div>
                    <div className="text-sm text-gray-600">068, 069, 078</div>
                  </div>
                  <span className="text-2xl">📱</span>
                </label>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <Input
                label="Mobile Money Number"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+255 XXX XXX XXX"
                disabled={!paymentMethod}
              />
              <p className="text-sm text-gray-600 mt-2">
                Enter the phone number registered with your mobile money account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-semibold mb-2">How it works:</p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Select your mobile money provider</li>
                <li>Enter your mobile number</li>
                <li>Click "Pay Now" to receive USSD prompt</li>
                <li>Check your phone and approve the payment</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/checkout')}
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={isLoading || !paymentMethod || !phoneNumber}
              >
                {isLoading ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </form>
        </div>
      </div>
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
