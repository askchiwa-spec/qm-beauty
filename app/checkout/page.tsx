'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DELIVERY_FEE = 5000;
const MOBILE_MONEY = ['mpesa', 'tigopesa', 'airtel', 'halopesa'];

const PAYMENT_OPTIONS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp Order',
    sub: 'Confirm & pay via WhatsApp',
    badge: 'Fastest',
    badgeColor: 'bg-green-100 text-green-700',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.01.61 3.96 1.76 5.61L2.05 22l4.63-1.8c1.63.9 3.46 1.38 5.36 1.38 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2z"/>
      </svg>
    ),
    bg: 'bg-green-500',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    sub: 'Pay when you receive',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    bg: 'bg-gray-500',
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    sub: 'CRDB, NMB, NBC',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H5a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    bg: 'bg-blue-700',
  },
];

const MOBILE_MONEY_OPTIONS = [
  { id: 'mpesa',     label: 'M-Pesa',       bg: 'bg-green-600' },
  { id: 'tigopesa', label: 'Tigo Pesa',     bg: 'bg-blue-500'  },
  { id: 'airtel',   label: 'Airtel Money',  bg: 'bg-red-500'   },
  { id: 'halopesa', label: 'HaloPesa',      bg: 'bg-purple-600'},
];

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState('pickup');
  const [customerInfo, setCustomerInfo] = useState({ fullName: '', phone: '', email: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  useEffect(() => {
    const saved = localStorage.getItem('qm-beauty-cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const total = parsed.reduce((sum: number, item: any) => {
          return sum + (item.product.salePrice || item.product.price) * item.quantity;
        }, 0);
        setCart({ items: parsed, total });
      } catch {}
    }
  }, []);

  const formatPrice = (p: number) => `${p.toLocaleString()} Tsh`;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!customerInfo.fullName.trim()) e.fullName = 'Full name is required';
    if (!/^\d{9}$/.test(customerInfo.phone.trim())) e.phone = 'Enter 9 digits after +255';
    if (customerInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) e.email = 'Invalid email address';
    if (selectedDelivery === 'home' && !customerInfo.address.trim()) e.address = 'Delivery address is required';
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
      deliveryOption: selectedDelivery as 'home' | 'pickup',
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
          .map((i: any) => `${i.quantity}x ${i.product.name} — ${((i.product.salePrice || i.product.price) * i.quantity).toLocaleString()} Tsh`)
          .join('\n');
        const deliveryNote = selectedDelivery === 'home'
          ? `\nDelivery: 5,000 Tsh\nAddress: ${customerInfo.address}`
          : '\nDelivery: Free (Store Pickup)';
        const msg = `Hello! I'd like to place an order:\n\n${lines}\n\nTotal: ${totalAmount.toLocaleString()} Tsh${deliveryNote}\n\nOrder: ${orderCode}\nName: ${customerInfo.fullName}\nPhone: ${customerPhone}`;
        window.open(`https://wa.me/255657120151?text=${encodeURIComponent(msg)}`, '_blank');
        router.push(`/order-confirmation?order=${orderCode}`);
      } else if (MOBILE_MONEY.includes(selectedPayment)) {
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
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 bg-[#f0e8dc] rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-[#b49a7b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-[#4a3728] mb-2">Your cart is empty</h1>
          <p className="text-[#8b7356] mb-8 text-sm">Add some products before checking out</p>
          <Link href="/shop" className="inline-block bg-[#b49a7b] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#9a8266] transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = selectedDelivery === 'home' ? DELIVERY_FEE : 0;
  const grandTotal = cart.total + deliveryFee;

  const inputCls = (field: string) =>
    `w-full px-4 py-3 text-sm border rounded-xl outline-none transition-colors focus:ring-2 focus:ring-[#c4a882] ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-[#e8ddd0] bg-white focus:border-[#c4a882]'
    }`;

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-[#8b7356] hover:text-[#4a3728] mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-serif font-light text-[#4a3728]">Checkout</h1>
          <p className="text-sm text-[#8b7356] mt-1">Complete your order below</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Left: Forms ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Customer Info */}
            <section className="bg-white rounded-2xl border border-[#ede4d8] p-6">
              <h2 className="text-base font-semibold text-[#4a3728] mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#c4a882] text-white text-xs font-bold flex items-center justify-center">1</span>
                Your Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#6b4f3a] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={e => handleInfoChange('fullName', e.target.value)}
                    placeholder="e.g. Amina Hassan"
                    className={inputCls('fullName')}
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6b4f3a] mb-1.5">Phone Number *</label>
                  <div className="flex">
                    <span className="flex items-center px-4 rounded-l-xl border border-r-0 border-[#e8ddd0] bg-[#f5ede3] text-[#6b4f3a] text-sm font-medium">
                      +255
                    </span>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={e => handleInfoChange('phone', e.target.value.replace(/\D/g, '').slice(0, 9))}
                      placeholder="712 345 678"
                      maxLength={9}
                      className={`flex-1 px-4 py-3 text-sm border rounded-r-xl outline-none transition-colors focus:ring-2 focus:ring-[#c4a882] ${errors.phone ? 'border-red-400 bg-red-50' : 'border-[#e8ddd0] focus:border-[#c4a882]'}`}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6b4f3a] mb-1.5">Email <span className="text-[#a89070] font-normal">(optional)</span></label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={e => handleInfoChange('email', e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls('email')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>
            </section>

            {/* Delivery */}
            <section className="bg-white rounded-2xl border border-[#ede4d8] p-6">
              <h2 className="text-base font-semibold text-[#4a3728] mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#c4a882] text-white text-xs font-bold flex items-center justify-center">2</span>
                Delivery
              </h2>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {[
                  { id: 'pickup', title: 'Store Pickup', sub: 'Ready in 24 hrs · Oysterbay', badge: 'Free', badgeCls: 'bg-green-100 text-green-700' },
                  { id: 'home',   title: 'Home Delivery', sub: '2–3 business days · DSM only', badge: '+5,000 Tsh', badgeCls: 'bg-[#f5ede3] text-[#8b5e3c]' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedDelivery(opt.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedDelivery === opt.id
                        ? 'border-[#c4a882] bg-[#fdf8f2]'
                        : 'border-[#ede4d8] hover:border-[#c4a882]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-sm text-[#4a3728]">{opt.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${opt.badgeCls}`}>{opt.badge}</span>
                    </div>
                    <p className="text-xs text-[#8b7356] mt-1">{opt.sub}</p>
                  </button>
                ))}
              </div>

              {selectedDelivery === 'home' && (
                <div>
                  <label className="block text-xs font-medium text-[#6b4f3a] mb-1.5">Delivery Address *</label>
                  <textarea
                    value={customerInfo.address}
                    onChange={e => handleInfoChange('address', e.target.value)}
                    placeholder="Street, landmark, area — e.g. Oysterbay, near Total petrol station"
                    rows={3}
                    className={`w-full px-4 py-3 text-sm border rounded-xl outline-none resize-none transition-colors focus:ring-2 focus:ring-[#c4a882] ${errors.address ? 'border-red-400 bg-red-50' : 'border-[#e8ddd0] focus:border-[#c4a882]'}`}
                  />
                  {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>
              )}
            </section>

            {/* Payment */}
            <section className="bg-white rounded-2xl border border-[#ede4d8] p-6">
              <h2 className="text-base font-semibold text-[#4a3728] mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#c4a882] text-white text-xs font-bold flex items-center justify-center">3</span>
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Standard options */}
                {PAYMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPayment(opt.id)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all text-left ${
                      selectedPayment === opt.id
                        ? 'border-[#c4a882] bg-[#fdf8f2]'
                        : 'border-[#ede4d8] hover:border-[#c4a882]'
                    }`}
                  >
                    <div className={`w-10 h-10 ${opt.bg} rounded-lg flex items-center justify-center text-white shrink-0`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#4a3728]">{opt.label}</p>
                      <p className="text-xs text-[#8b7356]">{opt.sub}</p>
                    </div>
                    {opt.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${opt.badgeColor}`}>{opt.badge}</span>
                    )}
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                      selectedPayment === opt.id ? 'border-[#c4a882] bg-[#c4a882]' : 'border-[#ccc]'
                    }`} />
                  </button>
                ))}

                {/* Mobile Money */}
                <div className="pt-1">
                  <p className="text-xs font-semibold text-[#8b7356] uppercase tracking-wide mb-2 px-0.5">Mobile Money</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MOBILE_MONEY_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedPayment(opt.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          selectedPayment === opt.id
                            ? 'border-[#c4a882] bg-[#fdf8f2]'
                            : 'border-[#ede4d8] hover:border-[#c4a882]'
                        }`}
                      >
                        <div className={`w-8 h-8 ${opt.bg} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {opt.label[0]}
                        </div>
                        <span className="text-sm font-medium text-[#4a3728] leading-tight">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {errors.payment && (
                <p className="mt-3 text-xs text-red-500 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  {errors.payment}
                </p>
              )}
            </section>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#ede4d8] p-6 sticky top-6">
              <h2 className="text-base font-semibold text-[#4a3728] mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.items.map((item: any, i: number) => {
                  const price = item.product.salePrice || item.product.price;
                  return (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-12 h-12 rounded-lg bg-[#f5ede3] overflow-hidden shrink-0 border border-[#ede4d8]">
                        {item.product.images?.[0]
                          ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center text-[#c4a882]">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#4a3728] truncate">{item.product.name}</p>
                        <p className="text-xs text-[#8b7356]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#c4a882] shrink-0">{formatPrice(price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="mt-5 pt-4 border-t border-[#ede4d8] space-y-2">
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
                <div className="flex justify-between pt-3 border-t border-[#ede4d8]">
                  <span className="font-bold text-[#4a3728]">Total</span>
                  <span className="font-bold text-lg text-[#4a3728]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  {submitError}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full mt-5 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-[#ddd0bf] text-[#a09080] cursor-not-allowed'
                    : 'bg-[#c4a882] text-white hover:bg-[#b49270] active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Processing…
                  </>
                ) : selectedPayment === 'whatsapp'
                  ? 'Continue to WhatsApp →'
                  : selectedPayment === 'cod' || selectedPayment === 'bank'
                  ? 'Place Order →'
                  : 'Pay Now →'
                }
              </button>

              {/* Trust */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#a89070]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Secure checkout · Your data is protected
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
