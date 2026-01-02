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
            <div className="aspect-square bg-[var(--soft-beige)] rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 bg-[var(--soft-beige)] rounded-lg flex items-center justify-center ${
                      selectedImage === index ? 'ring-2 ring-[var(--sage-green)]' : ''
                    }`}
                  >
                    <Image
                      src={product.images[index]}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
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
              onClick={() => window.open(`https://wa.me/255657120151?text=Hello!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}`, '_blank')}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-8"
            >
              <span>Ask About This Product on WhatsApp</span>
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
