export const dynamic = 'force-static';
export const revalidate = false;

import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-light text-[#6b4f3a] mb-8">Shopping Cart</h1>
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-600 mb-4">Your cart is currently empty.</p>
          <Link 
            href="/shop" 
            className="inline-block bg-[#b49a7b] text-white px-6 py-3 rounded-lg hover:bg-[#9a8266] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
