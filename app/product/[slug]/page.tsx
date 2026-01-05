'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Button from '@/components/ui/Button';
import { products } from '@/data/products';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = products.find(p => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!product) {
    notFound();
  }
  
  const formatPrice = (price: number) => `${price.toLocaleString()} Tsh`;
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-[var(--sage-green)]">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--sage-green)]">Shop</Link>
          <span>/</span>
          <span className="text-[var(--charcoal)]">{product.name}</span>
        </div>
        
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div>
            {/* Main Image Display */}
            <div className="aspect-square bg-[var(--soft-beige)] rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage] || product.image}
                  alt={`${product.name} - Image ${selectedImage + 1}`}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : product.image && !product.image.startsWith('data:image') ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-[var(--sage-green)]/10 to-[var(--rose-gold)]/10 rounded-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌿</div>
                    <div className="text-xl font-semibold text-[var(--charcoal)] mb-2">{product.name}</div>
                    <div className="text-sm text-gray-600">QM Beauty Premium Product</div>
                  </div>
                </div>
              )}
                        
              {/* Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[var(--charcoal)] rounded-full p-2 shadow-lg transition-all"
                    aria-label="Previous image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[var(--charcoal)] rounded-full p-2 shadow-lg transition-all"
                    aria-label="Next image"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
                      
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 bg-[var(--soft-beige)] rounded-lg flex items-center justify-center ${
                      selectedImage === index ? 'ring-2 ring-[var(--sage-green)] ring-offset-2' : ''
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
                      
            {/* Video Gallery Section */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3 text-[var(--charcoal)]">Product Video</h3>
              <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
                <div className="text-center text-white">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-70" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  <p className="text-sm">Video showing {product.name} in use</p>
                  <p className="text-xs opacity-70 mt-1">(Video placeholder - to be implemented)</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--charcoal)] mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-[var(--terracotta)]">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-[var(--terracotta)] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Save {Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-[var(--sage-green)]">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                {product.description}
              </p>
              {product.packageSize && (
                <span className="bg-[var(--sage-green)] text-white px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                  {product.packageSize}
                </span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <span className="text-[var(--sage-green)] font-semibold">✓ In Stock</span>
              ) : (
                <span className="text-red-500 font-semibold">Out of Stock</span>
              )}
            </div>
            
            {/* Quantity & Add to Cart */}
            <div className="flex gap-4 mb-8">
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>
            </div>
            
            {/* WhatsApp CTA */}
            <button
              onClick={() => {
                const message = `Hello! I'm interested in ${product.name}. Price: ${formatPrice(product.price)} Tsh. Quantity: ${quantity}. ${product.shortDescription} Please send me more details.`;
                window.open(`https://wa.me/255657120151?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-8"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-2.906 0-5.269-2.377-5.273-5.298 0-2.909 2.363-5.298 5.272-5.298 2.909 0 5.273 2.389 5.273 5.298 0 2.921-2.364 5.298-5.273 5.298m4.214-9.771c-.268-.578-.731-.803-1.329-.986-.598-.186-1.327-.278-2.194-.281-1.562-.005-3.302.798-4.194 1.691-1.074 1.075-1.677 2.456-1.681 3.907 0 .179.008.357.024.535.034.356.179.7.428 1.001l.79 1.006 1.006.79c.301.249.645.394.999.429.177.016.356.024.535.024 1.451-.004 2.832-.607 3.907-1.681.892-.893 1.696-2.633 1.691-4.194-.003-.868-.096-1.597-.281-2.194-.183-.598-.408-1.062-.986-1.329"/>
              </svg>
              <span>Chat on WhatsApp</span>
            </button>
            
            {/* Benefits */}
            {product.benefits && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Key Benefits:</h3>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[var(--sage-green)] mt-1">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Skin Types */}
            {product.skinTypes && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Suitable For:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.skinTypes.map((type, index) => (
                    <span key={index} className="bg-[var(--cream)] text-[var(--charcoal)] px-3 py-1 rounded-full text-sm">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-16">
          <div className="border-b mb-6">
            <div className="flex gap-8">
              <button className="pb-4 border-b-2 border-[var(--sage-green)] font-semibold text-[var(--sage-green)]">
                Description
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {product.ingredients && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Ingredients:</h3>
                <ul className="space-y-1 text-gray-700">
                  {product.ingredients.map((ingredient, index) => (
                    <li key={index}>• {ingredient}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.howToUse && (
              <div>
                <h3 className="font-semibold text-lg mb-3">How to Use:</h3>
                <p className="text-gray-700">{product.howToUse}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relProd) => (
                <Link key={relProd.id} href={`/product/${relProd.slug}`}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
                    <div className="aspect-square bg-[var(--soft-beige)] rounded-lg mb-3 flex items-center justify-center">
                      <Image
                        src={relProd.image}
                        alt={relProd.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <h4 className="font-semibold mb-2">{relProd.name}</h4>
                    <p className="text-[var(--sage-green)] font-bold">
                      {formatPrice(relProd.salePrice || relProd.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
