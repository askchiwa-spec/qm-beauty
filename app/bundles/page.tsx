'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/data/products';

export default function BundlesPage() {
  const [quantity, setQuantity] = useState<{[key: string]: number}>({});
  
  // Filter products to only show bundles
  const bundleProducts = products.filter(product => product.category === 'bundle');

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} Tsh`;
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(prev => ({
        ...prev,
        [productId]: newQuantity
      }));
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--charcoal)] mb-6">
            Premium Product Bundles
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our carefully curated bundles designed to give you the best value and complete your beauty routine.
          </p>
        </div>

        {/* Bundles Grid */}
        {bundleProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundleProducts.map((bundle) => (
              <div 
                key={bundle.id} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
              >
                {/* Bundle Image */}
                <div className="relative h-64 bg-[var(--soft-beige)]">
                  {bundle.image && !bundle.image.startsWith('data:image') ? (
                    <Image
                      src={bundle.image}
                      alt={bundle.name}
                      fill
                      className="object-cover p-4"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <div className="bg-gradient-to-br from-[var(--sage-green)]/20 to-[var(--rose-gold)]/20 w-full h-full rounded-lg flex flex-col items-center justify-center p-2">
                        <div className="text-4xl mb-2">🌿</div>
                        <div className="text-center text-xs font-medium text-[var(--charcoal)] truncate max-w-[80%]">
                          {bundle.name}
                        </div>
                        <div className="text-[8px] text-gray-500 mt-1">QM Beauty</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bundle Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[var(--charcoal)] mb-2">{bundle.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{bundle.shortDescription}</p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-[var(--sage-green)]">
                      {formatPrice(bundle.price)}
                    </span>
                    {bundle.packageSize && (
                      <span className="bg-[var(--sage-green)] text-white px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                        {bundle.packageSize}
                      </span>
                    )}
                  </div>

                  {/* Benefits */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm mb-2">What's Included:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {bundle.ingredients?.map((ingredient, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-[var(--sage-green)] mr-2">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg w-full">
                      <button
                        onClick={() => handleQuantityChange(bundle.id, (quantity[bundle.id] || 1) - 1)}
                        className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                        disabled={(quantity[bundle.id] || 1) <= 1}
                      >
                        −
                      </button>
                      <span className="px-6 py-2 font-semibold min-w-[40px] text-center">
                        {quantity[bundle.id] || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(bundle.id, (quantity[bundle.id] || 1) + 1)}
                        className="px-4 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        className="w-full bg-[var(--sage-green)] hover:bg-[var(--deep-green)] text-white py-3 rounded-lg font-medium transition-colors"
                      >
                        Add to Cart
                      </button>
                      
                      <button
                        onClick={() => window.open(`https://wa.me/255657120151?text=Hello! I'm interested in ${bundle.name}. Price: ${formatPrice(bundle.price)} Tsh. Quantity: ${quantity[bundle.id] || 1}. ${bundle.shortDescription}`, '_blank')}
                        className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-2.906 0-5.269-2.377-5.273-5.298 0-2.909 2.363-5.298 5.272-5.298 2.909 0 5.273 2.389 5.273 5.298 0 2.921-2.364 5.298-5.273 5.298m4.214-9.771c-.268-.578-.731-.803-1.329-.986-.598-.186-1.327-.278-2.194-.281-1.562-.005-3.302.798-4.194 1.691-1.074 1.075-1.677 2.456-1.681 3.907 0 .179.008.357.024.535.034.356.179.7.428 1.001l.79 1.006 1.006.79c.301.249.645.394.999.429.177.016.356.024.535.024 1.451-.004 2.832-.607 3.907-1.681.892-.893 1.696-2.633 1.691-4.194-.003-.868-.096-1.597-.281-2.194-.183-.598-.408-1.062-.986-1.329"/>
                        </svg>
                        <span>Order via WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌿</div>
            <h3 className="text-2xl font-semibold text-[var(--charcoal)] mb-2">No bundles available</h3>
            <p className="text-gray-600">Check back later for our premium product bundles.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-6">Complete Your Beauty Routine</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Explore our individual products to complement your bundle or find the perfect addition to your routine.
          </p>
          <Link href="/shop" className="inline-block bg-[var(--sage-green)] hover:bg-[var(--deep-green)] text-white px-8 py-4 rounded-lg font-medium transition-colors">
            Shop All Products
          </Link>
        </div>
      </div>
    </div>
  );
}