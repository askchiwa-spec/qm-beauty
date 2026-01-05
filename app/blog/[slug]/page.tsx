'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { blogPosts } from '@/data/blog';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-[var(--sage-green)]">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[var(--sage-green)]">Blog</Link>
          <span>/</span>
          <span className="text-[var(--charcoal)]">{post.title}</span>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          <span className="text-sm font-semibold text-[var(--sage-green)] bg-[var(--soft-beige)] px-3 py-1 rounded-full mb-4 inline-block">
            {post.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--charcoal)] mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600 border-b border-gray-200 pb-6 mb-8">
            <div className="flex items-center gap-2">
              <span>By {post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{post.readTime}</span>
            </div>
          </div>
        </header>

        {/* Article Image */}
        <div className="mb-12">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={600}
              className="w-full h-96 object-cover rounded-2xl"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-[var(--sage-green)]/10 to-[var(--rose-gold)]/10 rounded-2xl">
              <div className="text-center">
                <div className="text-6xl mb-4">🌿</div>
                <div className="text-2xl font-semibold text-[var(--charcoal)]">{post.title}</div>
              </div>
            </div>
          )}
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none mb-16">
          {post.content.split('\n\n').map((paragraph, index) => {
            // Check if this is a heading paragraph (starts with **)
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              const headingText = paragraph.replace(/\*\*/g, '');
              return (
                <h2 key={index} className="text-2xl font-bold text-[var(--charcoal)] mt-10 mb-6">
                  {headingText}
                </h2>
              );
            }
            
            // Check if this is a list item paragraph
            if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('1. ')) {
              return (
                <div key={index} className="mb-6">
                  {paragraph.split('\n').map((line, lineIndex) => {
                    if (line.trim().startsWith('- ')) {
                      const content = line.substring(2);
                      return (
                        <div key={lineIndex} className="flex items-start mb-2">
                          <span className="text-[var(--sage-green)] mr-2">•</span>
                          <span>{content}</span>
                        </div>
                      );
                    } else if (/^\d+\. /.test(line.trim())) {
                      const content = line.replace(/^\d+\. /, '');
                      const number = line.match(/^\d+/)?.[0];
                      return (
                        <div key={lineIndex} className="flex items-start mb-2">
                          <span className="text-[var(--sage-green)] mr-2">
                            {number}
                          </span>
                          <span>{content}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              );
            }
            
            // Regular paragraph
            return (
              <p key={index} className="mb-6 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Tags */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-[var(--soft-beige)] text-[var(--charcoal)] px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Share Section */}
        <div className="mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-[var(--soft-beige)] rounded-2xl">
          <div>
            <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-2">Share this article</h3>
            <p className="text-gray-600">Spread the knowledge with your friends!</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                const text = `Check out this article: ${post.title} - ${window.location.href}`;
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: text,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="bg-[var(--sage-green)] hover:bg-[var(--deep-green)] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Share
            </button>
            <button 
              onClick={() => {
                const message = `Check out this article: ${post.title} - ${window.location.href}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-2.906 0-5.269-2.377-5.273-5.298 0-2.909 2.363-5.298 5.272-5.298 2.909 0 5.273 2.389 5.273 5.298 0 2.921-2.364 5.298-5.273 5.298m4.214-9.771c-.268-.578-.731-.803-1.329-.986-.598-.186-1.327-.278-2.194-.281-1.562-.005-3.302.798-4.194 1.691-1.074 1.075-1.677 2.456-1.681 3.907 0 .179.008.357.024.535.034.356.179.7.428 1.001l.79 1.006 1.006.79c.301.249.645.394.999.429.177.016.356.024.535.024 1.451-.004 2.832-.607 3.907-1.681.892-.893 1.696-2.633 1.691-4.194-.003-.868-.096-1.597-.281-2.194-.183-.598-.408-1.062-.986-1.329"/>
              </svg>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-[var(--charcoal)] mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.id} 
                  href={`/blog/${relatedPost.slug}`} 
                  className="block group"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="h-40 bg-[var(--soft-beige)] relative overflow-hidden">
                      {relatedPost.image ? (
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="bg-gradient-to-br from-[var(--sage-green)]/20 to-[var(--rose-gold)]/20 w-full h-full flex items-center justify-center">
                            <div className="text-2xl text-[var(--sage-green)]">🌿</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-semibold text-[var(--sage-green)] bg-[var(--soft-beige)] px-2 py-1 rounded-full mb-2 inline-block">
                        {relatedPost.category}
                      </span>
                      <h4 className="font-bold text-[var(--charcoal)] mb-2 group-hover:text-[var(--sage-green)] transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[var(--sage-green)] to-[var(--rose-gold)] rounded-2xl p-10 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Beauty Routine?</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            Experience the power of natural beauty with our premium products. 
            Shop now and discover the QM Beauty difference.
          </p>
          <Link 
            href="/shop" 
            className="inline-block bg-white text-[var(--sage-green)] px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Shop Products
          </Link>
        </div>
      </div>
    </div>
  );
}