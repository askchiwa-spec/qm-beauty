'use client';

import { useState } from 'react';

export default function SelcomPaymentButton({ amount, orderId }: { amount: number; orderId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, orderId })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ Payment initiated!\nTransaction: ${data.transactionId}\nAmount: TZS ${amount}`);
        window.location.href = '/payment-status?success=true';
      }
    } catch (error) {
      alert('❌ Payment failed');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-[#b49a7b] text-white py-3 px-6 rounded-lg hover:bg-[#9a8266] transition-colors font-medium disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Pay TZS ${amount.toLocaleString()}`}
    </button>
  );
}
