'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderCode = searchParams.get('order');
  const transactionId = searchParams.get('transaction');
  
  const [status, setStatus] = useState<'checking' | 'success' | 'failed' | 'pending'>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderCode || !transactionId) {
      router.push('/');
      return;
    }

    // Poll payment status
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payment/status?orderId=${orderCode}`);
        const data = await response.json();

        if (data.success) {
          if (data.data.status === 'COMPLETED') {
            setStatus('success');
          } else if (data.data.status === 'FAILED') {
            setStatus('failed');
            setError('Payment was not successful');
          } else {
            setStatus('pending');
          }
        }
      } catch (err: any) {
        setError('Failed to check payment status');
      }
    };

    // Check immediately
    checkStatus();

    // Poll every 3 seconds for 2 minutes
    const interval = setInterval(checkStatus, 3000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (status === 'checking' || status === 'pending') {
        setStatus('pending');
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderCode, transactionId, router]);

  if (!orderCode) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {status === 'checking' && (
            <>
              <div className="w-20 h-20 border-4 border-[var(--sage-green)] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-3">
                Checking Payment Status
              </h1>
              <p className="text-gray-600 mb-6">
                Please wait while we confirm your payment...
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  If you received a USSD prompt, please complete the payment on your phone
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-3">
                Payment Successful! 🎉
              </h1>
              <p className="text-gray-600 mb-2">
                Your payment has been confirmed
              </p>
              <p className="text-lg font-mono font-semibold text-[var(--sage-green)] mb-8">
                Order: {orderCode}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-700">
                  We've received your payment and will start preparing your order. You'll receive updates on WhatsApp.
                </p>
              </div>
              <div className="flex gap-4 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/shop')}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-3">
                Payment Failed
              </h1>
              <p className="text-gray-600 mb-8">
                {error || 'Your payment was not successful'}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-700 mb-3">
                  Please try again or contact us for assistance
                </p>
                <p className="text-xs text-gray-600">
                  Order: {orderCode}
                </p>
              </div>
              <div className="flex gap-4 flex-col sm:flex-row">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(`/payment?order=${orderCode}`)}
                  className="flex-1"
                >
                  Try Again
                </Button>
                <a 
                  href="https://wa.me/255657120151"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="primary" size="lg" className="w-full">
                    Contact Support
                  </Button>
                </a>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <span className="text-6xl mb-4 block">⏳</span>
              <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-3">
                Payment Pending
              </h1>
              <p className="text-gray-600 mb-8">
                We're still waiting for payment confirmation
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-gray-700 mb-3">
                  Your payment is being processed. This may take a few minutes.
                </p>
                <p className="text-xs text-gray-600">
                  We'll send you a WhatsApp message once payment is confirmed
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.reload()}
              >
                Check Again
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentStatusContent />
    </Suspense>
  );
}
