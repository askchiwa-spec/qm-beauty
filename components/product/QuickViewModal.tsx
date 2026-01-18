'use client';

import { Product } from '@/types';
import { useCart } from '@/lib/cartContext';
import Button from '@/components/ui/Button';
import { useState } from 'react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const formatPrice = (price: number) => `${(price / 1000).toFixed(0)}k TSh`;

  const handleAddToCart = () => {
    addItem(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-[var(--charcoal)]">Quick View</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              {product.image && !product.image.startsWith('data:image') ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-[var(--sage-green)]/10 to-[var(--rose-gold)]/10 rounded-xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌿</div>
                    <div className="text-xl font-semibold text-[var(--charcoal)] mb-2">{product.name}</div>
                    <div className="text-sm text-gray-600">QM Beauty Premium Product</div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--charcoal)] mb-2">
                {product.name}
              </h2>
              
              {product.category && (
                <span className="text-sm text-[var(--sage-green)] uppercase tracking-wider mb-4">
                  {product.category}
                </span>
              )}

              <div className="mb-6">
                {product.salePrice ? (
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-[var(--sage-green)]">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-1 rounded">
                      Save {Math.round((1 - product.salePrice / product.price) * 100)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-[var(--sage-green)]">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              {product.benefits && product.benefits.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-[var(--charcoal)] mb-3">Key Benefits:</h4>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[var(--sage-green)] mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.ingredients && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-[var(--charcoal)] mb-2 text-sm">Main Ingredients:</h4>
                  <p className="text-sm text-gray-600">{product.ingredients}</p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
                  Quantity:
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-[var(--sage-green)] flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-[var(--sage-green)] flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  className="flex-1"
                >
                  Add to Cart
                </Button>
                <button
                  onClick={() => window.open(`https://wa.me/255657120151?text=I'm interested in ${encodeURIComponent(product.name)}`, '_blank')}
                  className="flex-1 border-2 border-[var(--sage-green)] text-[var(--sage-green)] hover:bg-[var(--sage-green)] hover:text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Order via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
