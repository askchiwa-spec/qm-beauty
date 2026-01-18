'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import Button from '../ui/Button';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, isCartOpen, closeCart } = useCart();
  
  // Format price: 20000 = 20,000 Tsh
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} Tsh`;
  };
  
  if (!isCartOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={closeCart}
      />
      
      {/* Cart Drawer - Shop Style */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        <style jsx>{`
          .cart-drawer {
            margin-left: auto;
            margin-right: 1%;
          }
        `}</style>
        {/* Header - Premium Style */}
        <div className="flex items-center justify-center relative p-6 border-b border-gray-200 bg-gradient-to-r from-[var(--pearl-white)] to-[var(--champagne)]">
          <div className="text-center flex-1">
            <h2 className="text-2xl font-semibold text-[var(--deep-charcoal)] mb-1">
              Shopping Cart
            </h2>
            <p className="text-sm text-[var(--rose-gold)] uppercase tracking-wider">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Cart Items - Premium List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-6 text-lg">Your cart is empty</p>
              <Button onClick={closeCart} variant="primary" size="lg">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        {formatPrice(item.product.salePrice || item.product.price)} each
                      </p>
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-[var(--rose-gold)] hover:bg-[var(--rose-gold)] hover:text-white transition-all text-gray-700 font-bold text-lg"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-semibold text-base">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-full hover:border-[var(--rose-gold)] hover:bg-[var(--rose-gold)] hover:text-white transition-all text-gray-700 font-bold text-lg"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-auto text-red-500 hover:text-red-700 text-xs flex items-center gap-1 px-2 py-1"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-bold text-black text-lg">
                        {formatPrice((item.product.salePrice || item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer - Premium Style */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 bg-white space-y-4">
            {/* Total */}
            <div className="bg-gradient-to-r from-[var(--pearl-white)] to-[var(--champagne)] rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm uppercase tracking-wider">Total Amount</span>
                <span className="text-2xl font-bold text-black">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-2">
              <Link href="/checkout" onClick={closeCart}>
                <Button variant="primary" size="lg" className="w-full">
                  Proceed to Checkout
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  const cartItemsMessage = items.map(item => 
                    `${item.quantity}x ${item.product.name} - ${(item.product.salePrice || item.product.price).toLocaleString()} Tsh each`
                  ).join('\n');
                  const total = getTotalPrice();
                  const message = `Hello! I would like to place an order for the following items:

${cartItemsMessage}

Total: ${total.toLocaleString()} Tsh

Please confirm the order and let me know about delivery options.`;
                  window.open(
                    `https://wa.me/255657120151?text=${encodeURIComponent(message)}`,
                    '_blank'
                  );
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-2.906 0-5.269-2.377-5.273-5.298 0-2.909 2.363-5.298 5.272-5.298 2.909 0 5.273 2.389 5.273 5.298 0 2.921-2.364 5.298-5.273 5.298m4.214-9.771c-.268-.578-.731-.803-1.329-.986-.598-.186-1.327-.278-2.194-.281-1.562-.005-3.302.798-4.194 1.691-1.074 1.075-1.677 2.456-1.681 3.907 0 .179.008.357.024.535.034.356.179.7.428 1.001l.79 1.006 1.006.79c.301.249.645.394.999.429.177.016.356.024.535.024 1.451-.004 2.832-.607 3.907-1.681.892-.893 1.696-2.633 1.691-4.194-.003-.868-.096-1.597-.281-2.194-.183-.598-.408-1.062-.986-1.329"/>
                </svg>
                Order via WhatsApp
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
