'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { blogPosts } from '@/data/blog';

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories
  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--charcoal)] mb-6">
            QM Beauty Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover tips, insights, and stories about beauty, wellness, and natural skincare.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage-green)]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage-green)]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                  {/* Post Image */}
                  <div className="relative h-56 bg-[var(--soft-beige)]">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="bg-gradient-to-br from-[var(--sage-green)]/20 to-[var(--rose-gold)]/20 w-full h-full rounded-lg flex items-center justify-center">
                          <div className="text-4xl text-[var(--sage-green)]">🌿</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-[var(--sage-green)] bg-[var(--soft-beige)] px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-[var(--charcoal)] mb-3 group-hover:text-[var(--sage-green)] transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <span className="text-sm text-[var(--sage-green)] font-medium">Read more →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌿</div>
            <h3 className="text-2xl font-semibold text-[var(--charcoal)] mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Featured Article Section */}
        {blogPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-8 text-center">Featured Article</h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="md:flex">
                <div className="md:w-1/2">
                  {blogPosts[0].image ? (
                    <Image
                      src={blogPosts[0].image}
                      alt={blogPosts[0].title}
                      width={600}
                      height={400}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 md:h-full flex items-center justify-center bg-gradient-to-br from-[var(--sage-green)]/10 to-[var(--rose-gold)]/10">
                      <div className="text-6xl text-[var(--sage-green)]">🌿</div>
                    </div>
                  )}
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <span className="text-sm font-semibold text-[var(--sage-green)] bg-[var(--soft-beige)] px-3 py-1 rounded-full w-fit mb-4">
                    {blogPosts[0].category}
                  </span>
                  <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-4">
                    {blogPosts[0].title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{blogPosts[0].date}</span>
                    <Link 
                      href={`/blog/${blogPosts[0].slug}`} 
                      className="bg-[var(--sage-green)] hover:bg-[var(--deep-green)] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Read Article
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}