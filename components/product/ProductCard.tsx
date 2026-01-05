'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useCart } from '@/lib/cartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} Tsh`;
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col items-center justify-between hover:shadow-lg transition-all duration-300">
      {/* Product Image */}
      <Link href={`/product/${product.slug}`} className="w-full">
        <div className="w-full h-56 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
          {/* Next.js Optimized Image */}
          {product.image && !product.image.startsWith('data:image') ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-[var(--sage-green)]/20 to-[var(--rose-gold)]/20 w-full h-full rounded-lg flex flex-col items-center justify-center p-2">
                <div className="text-4xl mb-2">🌿</div>
                <div className="text-center text-xs font-medium text-[var(--charcoal)] truncate max-w-[80%]">
                  {product.name}
                </div>
                <div className="text-[8px] text-gray-500 mt-1">QM Beauty</div>
              </div>
            </div>
          )}
          
          {/* Overlay effect on hover */}
          <div className="absolute inset-0 bg-white/0 hover:bg-white/30 transition-all duration-500"></div>
          
          {/* Sale Badge - Clean */}
          {product.salePrice && (
            <span className="absolute top-3 right-3 bg-[var(--rose-gold)] text-white px-3 py-1 text-xs uppercase tracking-wider rounded-full z-10">
              Sale
            </span>
          )}
        </div>
      </Link>
      
      {/* Product Info - Centered & Clean */}
      <div className="w-full flex flex-col items-center">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-gray-800 font-medium text-sm mt-4 mb-2 text-center hover:text-[var(--rose-gold)] transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex flex-col items-center mb-3">
          <p className="text-gray-600 text-xs text-center line-clamp-2 px-2 mb-2">
            {product.shortDescription}
          </p>
          {product.packageSize && (
            <span className="bg-[var(--sage-green)] text-white px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              {product.packageSize}
            </span>
          )}
        </div>
        
        {/* Price Section - Bold & Clear */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {product.salePrice ? (
            <>
              <span className="text-black font-bold text-lg">
                {formatPrice(product.salePrice)}
              </span>
              <span className="text-gray-400 text-sm line-through">
                {formatPrice(product.price)}
              </span>
            </>
          ) : (
            <span className="text-black font-bold text-lg">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        
        {!product.inStock && (
          <span className="text-xs text-gray-500 uppercase tracking-wider mb-3">Sold Out</span>
        )}
        
        {/* Add to Cart Button - Clean */}
        <button
          className="w-full mt-2 bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white py-2.5 px-4 text-xs uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium"
          disabled={!product.inStock}
          onClick={() => addItem(product)}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
