'use client';

import { useState } from 'react';
import ProductCard from '@/components/product/ProductCard';
import { products } from '@/data/products';
import Button from '@/components/ui/Button';
import { Product } from '@/types';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'skincare', name: 'Skincare' },
    { id: 'haircare', name: 'Haircare' },
    { id: 'bundle', name: 'Bundles' }
  ];
  
  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => 
      searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });
  
  return (
    <div className="min-h-screen">
      {/* Elegant Hero - Full Width */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-[var(--pearl-white)] via-[var(--champagne)] to-[var(--soft-beige)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto text-center relative z-10">
            <p className="text-[var(--rose-gold)] uppercase tracking-[0.25em] text-xs font-medium mb-4">
              Discover
            </p>
            <h1 className="text-[var(--deep-charcoal)] mb-6">
              Premium Natural Beauty
            </h1>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-[var(--espresso)] max-w-3xl mx-auto font-light leading-relaxed">
              Organic, cruelty-free products crafted for all skin types
            </p>
          </div>
        </div>
      </section>
      
      <div className="w-full flex justify-center px-4">
        <div className="w-full max-w-7xl mx-auto py-8 md:py-12">
        
        {/* Search Bar - Compact Style */}
        <div className="mb-6">
          <div className="relative max-w-xl mx-auto">
            {/* Search Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-11 pr-10 border border-gray-200 rounded-full focus:outline-none focus:border-[var(--rose-gold)] transition-all bg-white text-gray-800 text-sm placeholder:text-gray-400"
            />
            
            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                aria-label="Clear search"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Divider Line for Visual Separation */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>
        
        {/* Elegant Filters - Cosmefrica Style */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Category Filter - Premium Style */}
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Product Categories
            </label>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 font-medium transition-all duration-300 text-sm rounded-full ${
                    selectedCategory === category.id
                      ? 'bg-[var(--rose-gold)] text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--rose-gold)]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sort Filter - Clean Style */}
          <div className="md:w-72">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--rose-gold)] transition-colors bg-white text-gray-800 text-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>
        
        {/* Premium Product Grid - Cosmefrica Spacing */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* No Products - Clean Message */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 font-light">No products found in this category</p>
          </div>
        )}
      </div>
    </div>
      
      {/* Elegant CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-[var(--pearl-white)] to-[var(--champagne)]">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto text-center">
            <h3 className="text-2xl sm:text-3xl font-serif text-[var(--deep-charcoal)] mb-6 font-medium">
              Need Help Choosing?
            </h3>
            <p className="text-lg text-[var(--espresso)] mb-8 font-light leading-relaxed max-w-2xl mx-auto">
              Chat with us on WhatsApp for personalized product recommendations
            </p>
            <button
              onClick={() => window.open('https://wa.me/255657120151?text=Hello!%20I%20need%20help%20choosing%20products', '_blank')}
              className="bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white px-12 py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-3 min-h-[48px]"
            >
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
