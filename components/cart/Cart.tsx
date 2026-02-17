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
      
      {/* Cart Drawer - Premium Style */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
        <style jsx>{`
          .cart-drawer {
            margin-left: auto;
            margin-right: 1%;
          }
        `}</style>
        {/* Header - Premium Style */}
        <div className="flex items-center justify-center relative p-6 border-b border-[var(--borderSoft)] bg-gradient-to-r from-[var(--champagne)] to-[var(--pearl-white)]">
          <div className="text-center flex-1">
            <h2 className="text-2xl font-serif font-semibold text-[var(--deep-charcoal)] mb-1">
              Shopping Cart
            </h2>
            <p className="text-sm text-[var(--rose-gold)] uppercase tracking-wider font-medium">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center text-[var(--deep-charcoal)] hover:text-[var(--rose-gold)] rounded-full transition-all hover:bg-[var(--soft-beige)]"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Cart Items - Premium List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[var(--cream)]">
          {items.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-[var(--champagne)] to-[var(--soft-beige)] rounded-full">
                <svg className="w-12 h-12 text-[var(--rose-gold)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-[var(--deep-charcoal)] mb-2 text-lg font-medium">Your cart is empty</p>
              <p className="text-[var(--textLight)] mb-6 max-w-xs mx-auto">Browse our collection and add some beautiful items to your cart</p>
              <Link href="/shop">
                <Button onClick={closeCart} variant="primary" size="lg" className="px-8 py-3">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="bg-white rounded-2xl shadow-sm border border-[var(--borderSoft)] p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-[var(--champagne)] to-[var(--soft-beige)] rounded-xl overflow-hidden flex-shrink-0 border border-[var(--borderSoft)]">
                      {item.product.image ? (
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2">
                          <div className="bg-gradient-to-br from-[var(--sage-green)]/20 to-[var(--rose-gold)]/20 w-full h-full rounded-lg flex flex-col items-center justify-center">
                            <div className="text-lg">🌿</div>
                            <div className="text-[8px] font-medium text-[var(--charcoal)] truncate max-w-[80%]">
                              {item.product.name}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--deep-charcoal)] mb-1 line-clamp-2 text-sm">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-[var(--rose-gold)] font-medium mb-3">
                        {formatPrice(item.product.salePrice || item.product.price)} each
                      </p>
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-[var(--borderSoft)] rounded-full hover:border-[var(--rose-gold)] hover:bg-[var(--rose-gold)] hover:text-white transition-all text-[var(--deep-charcoal)] font-bold text-lg bg-white"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-semibold text-base text-[var(--deep-charcoal)]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-[var(--borderSoft)] rounded-full hover:border-[var(--rose-gold)] hover:bg-[var(--rose-gold)] hover:text-white transition-all text-[var(--deep-charcoal)] font-bold text-lg bg-white"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-auto text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="text-xs font-medium hidden sm:block">Remove</span>
                        </button>
                      </div>
                    </div>
                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-bold text-[var(--deep-charcoal)] text-lg">
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
          <div className="border-t border-[var(--borderSoft)] p-6 bg-white space-y-4">
            {/* Total */}
            <div className="bg-gradient-to-r from-[var(--champagne)] to-[var(--pearl-white)] rounded-2xl p-4 border border-[var(--borderSoft)]">
              <div className="flex justify-between items-center">
                <span className="text-[var(--textLight)] text-sm uppercase tracking-wider font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-[var(--deep-charcoal)]">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <Link href="/checkout" onClick={closeCart}>
                <Button variant="primary" size="lg" className="w-full py-4 text-base font-medium">
                  Proceed to Checkout
                </Button>
              </Link>
              
              {/* Payment Options Separator */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--borderSoft)]"></div>
                </div>
                <div className="relative flex justify-center text-xs text-[var(--textLight)] font-medium">
                  <span className="bg-white px-2">Or pay with</span>
                </div>
              </div>
              
              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp Payment */}
                <button
                  onClick={() => {
                    closeCart();
                    const cartItemsMessage = items.map(item => 
                      `${item.quantity}x ${item.product.name} - ${(item.product.salePrice || item.product.price).toLocaleString()} Tsh each`
                    ).join('\n');
                    const total = getTotalPrice();
                    const message = `Hello! I would like to place an order for the following items:\n\n${cartItemsMessage}\n\nTotal: ${total.toLocaleString()} Tsh\n\nPlease confirm the order and let me know about delivery options.`;
                    window.open(
                      `https://wa.me/255657120151?text=${encodeURIComponent(message)}`,
                      '_blank'
                    );
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 border border-[var(--borderSoft)] rounded-xl hover:border-[var(--rose-gold)] transition-all bg-white"
                >
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-2.906 0-5.269-2.377-5.273-5.298 0-2.909 2.363-5.298 5.272-5.298 2.909 0 5.273 2.389 5.273 5.298 0 2.921-2.364 5.298-5.273 5.298m4.214-9.771c-.268-.578-.731-.803-1.329-.986-.598-.186-1.327-.278-2.194-.281-1.562-.005-3.302.798-4.194 1.691-1.074 1.075-1.677 2.456-1.681 3.907 0 .179.008.357.024.535.034.356.179.7.428 1.001l.79 1.006 1.006.79c.301.249.645.394.999.429.177.016.356.024.535.024 1.451-.004 2.832-.607 3.907-1.681.892-.893 1.696-2.633 1.691-4.194-.003-.868-.096-1.597-.281-2.194-.183-.598-.408-1.062-.986-1.329"/>
                  </svg>
                  <span className="text-sm font-medium text-[var(--deep-charcoal)]">WhatsApp</span>
                </button>
                
                {/* Mobile Money Payment */}
                <Link href="/checkout" onClick={closeCart}>
                  <button className="flex items-center justify-center gap-2 py-3 px-4 border border-[var(--borderSoft)] rounded-xl hover:border-[var(--rose-gold)] transition-all bg-white">
                    <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      M
                    </div>
                    <span className="text-sm font-medium text-[var(--deep-charcoal)]">Mobile Money</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
