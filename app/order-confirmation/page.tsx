'use client';

import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Link from 'next/link';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderCode = searchParams.get('order');
  const manualNotification = searchParams.get('manualNotification') === 'true';
  
  // Get manual notification data from localStorage if available
  const [manualNotificationData, setManualNotificationData] = useState<any>(null);
  
  useEffect(() => {
    if (manualNotification) {
      const storedData = localStorage.getItem('manualNotificationData');
      if (storedData) {
        try {
          setManualNotificationData(JSON.parse(storedData));
        } catch (e) {
          console.error('Error parsing manual notification data:', e);
        }
      }
    }
  }, [manualNotification]);

  useEffect(() => {
    if (!orderCode) {
      router.push('/');
    }
  }, [orderCode, router]);

  if (!orderCode) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-[var(--charcoal)] mb-3">
            Order Confirmed! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your order
          </p>
          <p className="text-lg font-mono font-semibold text-[var(--sage-green)] mb-8">
            Order: {orderCode}
          </p>

          {/* WhatsApp Notification */}
          {manualNotification && manualNotificationData ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-4xl">⚠️</span>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-[var(--charcoal)] mb-2">
                    WhatsApp Notifications Pending
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Our system couldn't send automatic notifications. Please send the following messages manually:
                  </p>
                  <div className="space-y-3 mt-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">TO BUSINESS:</p>
                      <a 
                        href={manualNotificationData.businessLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-[var(--sage-green)] hover:bg-[var(--sage-green)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full text-center"
                      >
                        Send Order to Business
                      </a>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1">TO CUSTOMER:</p>
                      <a 
                        href={manualNotificationData.customerLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block bg-[var(--sage-green)] hover:bg-[var(--sage-green)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full text-center"
                      >
                        Send Confirmation to Customer
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-4xl">💬</span>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-[var(--charcoal)] mb-2">
                    We've sent your order to WhatsApp!
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Our team will contact you shortly on WhatsApp to confirm your order details and arrange delivery.
                  </p>
                  <p className="text-sm text-gray-600">
                    You'll also receive a confirmation message with your order details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-[var(--charcoal)] mb-3 flex items-center gap-2">
              <span>📋</span>
              What happens next?
            </h3>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-semibold text-[var(--sage-green)]">1.</span>
                <span>Check your WhatsApp for order confirmation</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[var(--sage-green)]">2.</span>
                <span>Our team will confirm delivery details with you</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[var(--sage-green)]">3.</span>
                <span>Payment instructions will be shared via WhatsApp</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-[var(--sage-green)]">4.</span>
                <span>Your order will be prepared and delivered</span>
              </li>
            </ol>
          </div>

          {/* Contact Info */}
          <div className="border-t pt-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Need help with your order?</p>
            <a 
              href="https://wa.me/255657120151" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--sage-green)] hover:underline font-semibold"
            >
              Contact us on WhatsApp
            </a>
          </div>

          {/* Action Buttons */}
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
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
