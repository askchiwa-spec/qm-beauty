'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DELIVERY_FEE = 5000;

type PaymentId = 'whatsapp' | 'mpesa' | 'tigopesa' | 'airtel' | 'halopesa' | 'cod' | 'bank';
const MOBILE_MONEY: PaymentId[] = ['mpesa', 'tigopesa', 'airtel', 'halopesa'];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentId | ''>('');
  const [selectedDelivery, setSelectedDelivery] = useState<'pickup' | 'home'>('pickup');
  const [customerInfo, setCustomerInfo] = useState({ fullName: '', phone: '', email: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('qm-beauty-cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const total = parsed.reduce(
          (sum: number, item: any) => sum + (item.product.salePrice || item.product.price) * item.quantity,
          0
        );
        setCart({ items: parsed, total });
      } catch {}
    }
  }, []);

  const handleInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const formatPrice = (p: number) => `${p.toLocaleString()} Tsh`;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!customerInfo.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^\d{9}$/.test(customerInfo.phone.trim())) e.phone = 'Enter 9 digits after +255';
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email))
      e.email = 'Invalid email address';
    if (selectedDelivery === 'home' && !customerInfo.address.trim())
      e.address = 'Delivery address is required';
    if (!selectedPayment) e.payment = 'Please select a payment method';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleCheckout = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');

    const deliveryFee = selectedDelivery === 'home' ? DELIVERY_FEE : 0;
    const totalAmount = cart.total + deliveryFee;
    const customerPhone = '+255' + customerInfo.phone.trim();

    const orderData = {
      customerName: customerInfo.fullName.trim(),
      customerPhone,
      customerEmail: customerInfo.email || undefined,
      deliveryAddress: selectedDelivery === 'home' ? customerInfo.address.trim() : 'In-store pickup',
      deliveryOption: selectedDelivery,
      paymentMethod: selectedPayment,
      items: cart.items.map((item: any) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.salePrice || item.product.price,
        subtotal: (item.product.salePrice || item.product.price) * item.quantity,
      })),
      totalAmount,
    };

    try {
      const res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const result = await res.json();

      if (!result.success) {
        setSubmitError(result.error || 'Failed to place order. Please try again.');
        setLoading(false);
        return;
      }

      const { orderCode } = result.data;
      localStorage.removeItem('qm-beauty-cart');

      if (selectedPayment === 'whatsapp') {
        const lines = cart.items
          .map((i: any) =>
            `${i.quantity}x ${i.product.name} — ${((i.product.salePrice || i.product.price) * i.quantity).toLocaleString()} Tsh`
          )
          .join('\n');
        const deliveryNote =
          selectedDelivery === 'home'
            ? `\nDelivery: 5,000 Tsh\nAddress: ${customerInfo.address}`
            : '\nDelivery: Free (Store Pickup)';
        const msg = `Hello! I'd like to place an order:\n\n${lines}\n\nTotal: ${totalAmount.toLocaleString()} Tsh${deliveryNote}\n\nOrder: ${orderCode}\nName: ${customerInfo.fullName}\nPhone: ${customerPhone}`;
        window.open(`https://wa.me/255657120151?text=${encodeURIComponent(msg)}`, '_blank');
        router.push(`/order-confirmation?order=${orderCode}`);
      } else if (MOBILE_MONEY.includes(selectedPayment as PaymentId)) {
        localStorage.setItem('current-order', JSON.stringify({ ...orderData, orderCode }));
        router.push(`/payment?order=${orderCode}`);
      } else {
        router.push(`/order-confirmation?order=${orderCode}`);
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#f0e8dc] rounded-full flex items-center justify-center">
            <svg className="w-9 h-9 text-[#c4a882]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-[#4a3728] mb-2">Your cart is empty</h1>
          <p className="text-sm text-[#8b7356] mb-8">Add some products before checking out</p>
          <Link
            href="/shop"
            className="inline-block bg-[#c4a882] text-white px-8 py-3 rounded-xl font-medium text-sm hover:bg-[#b49270] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = selectedDelivery === 'home' ? DELIVERY_FEE : 0;
  const grandTotal = cart.total + deliveryFee;

  const field = (name: string) =>
    `w-full px-4 py-3 text-sm border rounded-xl outline-none transition focus:ring-2 focus:ring-[#c4a882]/40 ${
      errors[name] ? 'border-red-400 bg-red-50/60' : 'border-[#e8ddd0] bg-white focus:border-[#c4a882]'
    }`;

  const ctaLabel = loading
    ? 'Processing…'
    : selectedPayment === 'whatsapp'
    ? 'Continue to WhatsApp'
    : MOBILE_MONEY.includes(selectedPayment as PaymentId)
    ? 'Pay Now'
    : 'Place Order';

  return (
    <div className="min-h-screen bg-[#faf7f2]">

      {/* Top bar */}
      <div className="bg-white border-b border-[#ede4d8]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-[#8b7356] hover:text-[#4a3728] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to shop
          </Link>
          <span className="font-serif text-[#4a3728] text-lg">Checkout</span>
          <div className="flex items-center gap-1.5 text-xs text-[#a89070]">
            <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-6 items-start">

          {/* ── Left column ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* ── 1. Contact ── */}
            <div className="bg-white rounded-2xl border border-[#ede4d8] overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f0e8dc]">
                <span className="w-6 h-6 rounded-full bg-[#4a3728] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <h2 className="font-semibold text-[#4a3728] text-sm">Your Details</h2>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#6b4f3a] mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={e => handleInfoChange('fullName', e.target.value)}
                    placeholder="e.g. Amina Hassan"
                    className={field('fullName')}
                  />
                  {errors.fullName && <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6b4f3a] mb-1.5">Phone Number <span className="text-red-400">*</span></label>
                  <div className="flex">
                    <span className="flex items-center px-3.5 rounded-l-xl border border-r-0 border-[#e8ddd0] bg-[#f5ede3] text-[#6b4f3a] text-sm font-medium shrink-0">
                      +255
                    </span>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={e => handleInfoChange('phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="712 345 678"
                      maxLength={9}
                      className={`flex-1 px-4 py-3 text-sm border rounded-r-xl outline-none transition focus:ring-2 focus:ring-[#c4a882]/40 ${
                        errors.phone ? 'border-red-400 bg-red-50/60' : 'border-[#e8ddd0] focus:border-[#c4a882]'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6b4f3a] mb-1.5">
                    Email <span className="text-[#a89070] font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={e => handleInfoChange('email', e.target.value)}
                    placeholder="you@example.com"
                    className={field('email')}
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* ── 2. Delivery ── */}
            <div className="bg-white rounded-2xl border border-[#ede4d8] overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f0e8dc]">
                <span className="w-6 h-6 rounded-full bg-[#4a3728] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <h2 className="font-semibold text-[#4a3728] text-sm">Delivery</h2>
              </div>
              <div className="px-6 py-5">
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <DeliveryCard
                    id="pickup"
                    title="Store Pickup"
                    description="Oysterbay · Ready in 24 hrs"
                    badge="Free"
                    badgeCls="text-green-700 bg-green-50"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    }
                    selected={selectedDelivery === 'pickup'}
                    onSelect={() => setSelectedDelivery('pickup')}
                  />
                  <DeliveryCard
                    id="home"
                    title="Home Delivery"
                    description="Dar es Salaam · 2–3 days"
                    badge="+5,000 Tsh"
                    badgeCls="text-[#8b5e3c] bg-[#f5ede3]"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    }
                    selected={selectedDelivery === 'home'}
                    onSelect={() => setSelectedDelivery('home')}
                  />
                </div>

                {selectedDelivery === 'home' && (
                  <div className="mt-1">
                    <label className="block text-xs font-medium text-[#6b4f3a] mb-1.5">
                      Delivery Address <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={e => handleInfoChange('address', e.target.value)}
                      placeholder="Street, landmark, neighbourhood — e.g. Oysterbay, near Total petrol station"
                      rows={3}
                      className={`w-full px-4 py-3 text-sm border rounded-xl outline-none resize-none transition focus:ring-2 focus:ring-[#c4a882]/40 ${
                        errors.address ? 'border-red-400 bg-red-50/60' : 'border-[#e8ddd0] focus:border-[#c4a882]'
                      }`}
                    />
                    {errors.address && <p className="mt-1.5 text-xs text-red-500">{errors.address}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* ── 3. Payment ── */}
            <div className="bg-white rounded-2xl border border-[#ede4d8] overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-[#f0e8dc]">
                <span className="w-6 h-6 rounded-full bg-[#4a3728] text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <h2 className="font-semibold text-[#4a3728] text-sm">Payment Method</h2>
              </div>
              <div className="px-6 py-5 space-y-5">

                {/* WhatsApp — featured */}
                <PaymentRow
                  id="whatsapp"
                  selected={selectedPayment === 'whatsapp'}
                  onSelect={() => setSelectedPayment('whatsapp')}
                  icon={
                    <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.01.61 3.96 1.76 5.61L2.05 22l4.63-1.8c1.63.9 3.46 1.38 5.36 1.38 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z" />
                      </svg>
                    </div>
                  }
                  label="WhatsApp Order"
                  sub="Place order & confirm via WhatsApp chat"
                  badge="Recommended"
                  badgeCls="bg-green-100 text-green-700"
                />

                {/* Mobile Money group */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a89070] mb-2.5">Mobile Money</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'mpesa',     label: 'M-Pesa',      color: 'bg-[#00A651]', abbr: 'MP' },
                      { id: 'tigopesa', label: 'Tigo Pesa',    color: 'bg-[#0080C9]', abbr: 'TP' },
                      { id: 'airtel',   label: 'Airtel Money', color: 'bg-[#E40000]', abbr: 'AM' },
                      { id: 'halopesa', label: 'HaloPesa',     color: 'bg-[#7B2D8B]', abbr: 'HP' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedPayment(opt.id as PaymentId)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 transition-all text-left ${
                          selectedPayment === opt.id
                            ? 'border-[#c4a882] bg-[#fdf8f2]'
                            : 'border-[#ede4d8] hover:border-[#d4bfa0] bg-white'
                        }`}
                      >
                        <div className={`w-8 h-8 ${opt.color} rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                          {opt.abbr}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#4a3728] leading-tight truncate">{opt.label}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ml-auto shrink-0 ${
                          selectedPayment === opt.id ? 'border-[#c4a882] bg-[#c4a882]' : 'border-[#ddd]'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash on delivery */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a89070] mb-2.5">Other</p>
                  <div className="space-y-2">
                    <PaymentRow
                      id="cod"
                      selected={selectedPayment === 'cod'}
                      onSelect={() => setSelectedPayment('cod')}
                      icon={
                        <div className="w-10 h-10 rounded-xl bg-[#6b7280] flex items-center justify-center text-white shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      }
                      label="Cash on Delivery"
                      sub="Pay when your order arrives"
                    />
                    <PaymentRow
                      id="bank"
                      selected={selectedPayment === 'bank'}
                      onSelect={() => setSelectedPayment('bank')}
                      icon={
                        <div className="w-10 h-10 rounded-xl bg-[#1d4ed8] flex items-center justify-center text-white shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                          </svg>
                        </div>
                      }
                      label="Bank Transfer"
                      sub="CRDB · NMB · NBC"
                    />
                  </div>
                </div>

                {errors.payment && (
                  <p className="text-xs text-red-500 flex items-center gap-1.5 -mt-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.payment}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* ── Right column: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#ede4d8] overflow-hidden sticky top-6">
              <div className="px-6 py-4 border-b border-[#f0e8dc]">
                <h2 className="font-semibold text-[#4a3728] text-sm">
                  Order Summary
                  <span className="ml-2 text-xs font-normal text-[#a89070]">
                    ({cart.items.reduce((n: number, i: any) => n + i.quantity, 0)} item{cart.items.reduce((n: number, i: any) => n + i.quantity, 0) !== 1 ? 's' : ''})
                  </span>
                </h2>
              </div>

              {/* Items */}
              <div className="px-6 py-4 space-y-3 max-h-52 overflow-y-auto">
                {cart.items.map((item: any, i: number) => {
                  const price = item.product.salePrice || item.product.price;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-[#f5ede3] overflow-hidden shrink-0 border border-[#ede4d8]">
                        {item.product.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#c4a882]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#4a3728] truncate leading-tight">{item.product.name}</p>
                        <p className="text-xs text-[#a89070] mt-0.5">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#4a3728] shrink-0">{formatPrice(price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="px-6 pb-5 pt-3 border-t border-[#f0e8dc]">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8b7356]">Subtotal</span>
                    <span className="text-[#4a3728] font-medium">{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8b7356]">Delivery</span>
                    <span className={`font-medium ${selectedDelivery === 'home' ? 'text-[#4a3728]' : 'text-green-600'}`}>
                      {selectedDelivery === 'home' ? formatPrice(DELIVERY_FEE) : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#ede4d8] items-baseline">
                    <span className="font-bold text-[#4a3728] text-sm">Total</span>
                    <span className="font-bold text-xl text-[#4a3728]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {submitError}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-[#e0d4c0] text-[#a09080] cursor-not-allowed'
                      : selectedPayment === 'whatsapp'
                      ? 'bg-[#25D366] text-white hover:bg-[#22c55e] active:scale-[0.98]'
                      : 'bg-[#4a3728] text-white hover:bg-[#3a2a1c] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Processing…
                    </>
                  ) : (
                    <>
                      {selectedPayment === 'whatsapp' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.01.61 3.96 1.76 5.61L2.05 22l4.63-1.8c1.63.9 3.46 1.38 5.36 1.38 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z" />
                        </svg>
                      )}
                      {ctaLabel}
                      {!loading && <span className="ml-0.5">→</span>}
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] text-[#a89070]">
                  By placing your order you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-[#4a3728]">Terms</Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function DeliveryCard({
  id, title, description, badge, badgeCls, icon, selected, onSelect,
}: {
  id: string; title: string; description: string; badge: string; badgeCls: string;
  icon: React.ReactNode; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected ? 'border-[#c4a882] bg-[#fdf8f2]' : 'border-[#ede4d8] hover:border-[#d4bfa0] bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
          selected ? 'bg-[#c4a882] text-white' : 'bg-[#f0e8dc] text-[#8b7356]'
        }`}>
          {icon}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badgeCls}`}>{badge}</span>
      </div>
      <p className="font-semibold text-sm text-[#4a3728]">{title}</p>
      <p className="text-xs text-[#a89070] mt-0.5">{description}</p>
    </button>
  );
}

function PaymentRow({
  id, icon, label, sub, badge, badgeCls, selected, onSelect,
}: {
  id: string; icon: React.ReactNode; label: string; sub: string;
  badge?: string; badgeCls?: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
        selected ? 'border-[#c4a882] bg-[#fdf8f2]' : 'border-[#ede4d8] hover:border-[#d4bfa0] bg-white'
      }`}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#4a3728] leading-tight">{label}</p>
        <p className="text-xs text-[#a89070] mt-0.5">{sub}</p>
      </div>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${badgeCls}`}>{badge}</span>
      )}
      <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
        selected ? 'border-[#c4a882] bg-[#c4a882]' : 'border-[#ddd]'
      }`} />
    </button>
  );
}
