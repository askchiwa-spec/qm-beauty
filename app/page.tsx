'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/product/ProductCard';
import { products, services, testimonials } from '@/data/products';

export default function Home() {
  const featuredProducts = products.filter(p => p.featured);
  
  return (
    <div className="min-h-screen">
      {/* Luxury Hero Section - Full Screen with Image */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image with Next.js optimization */}
        <Image
          src="/images/hero/home-hero.jpg"
          alt="QM Beauty Luxury Spa and Natural Cosmetics"
          fill
          priority
          quality={95}
          className="object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Elegant Gradient Overlay - Creates depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70">
          {/* Subtle Pattern Overlay for texture */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        {/* Fallback Gradient Background (if image doesn't load) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--deep-charcoal)] via-[var(--espresso)] to-black -z-10">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        {/* Premium Content - Cinematic Layout - FULLY CENTERED */}
        <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center animate-fade-in-up">
          <div className="max-w-6xl w-full text-center">
            {/* Elegant Badge - Rose Gold - CENTERED */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
                <div className="w-2 h-2 bg-[var(--rose-gold)] rounded-full animate-pulse"></div>
                <p className="text-white uppercase tracking-[0.3em] text-xs font-medium">
                  QM Beauty - Natural Cosmetics
                </p>
              </div>
            </div>
            
            {/* Hero Headline - Luxury Typography - FULLY CENTERED */}
            <h1 className="font-serif text-white mb-8 leading-[1.15] px-4 sm:px-0 text-center">
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-2">Beauty is the Reason</span>
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[var(--rose-gold)]" style={{ fontWeight: 300 }}>Why Money is Made For</span>
            </h1>
            
            {/* Elegant Divider - CENTERED */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent"></div>
            </div>
            
            {/* Refined Description - Premium Copy - FULLY CENTERED */}
            <div className="flex flex-col items-center">
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 max-w-4xl font-light leading-relaxed px-2 text-center">
                If you haven't tried natural beauty cosmetics products, you're missing out on better results
              </p>
              
              <p className="text-base sm:text-lg text-white/70 mb-12 max-w-3xl font-light leading-relaxed px-2 text-center">
                Haven't tried QM Beauty Head Spa? Experience the benefits of Japanese Head Spa and relieve yourself today
              </p>
            </div>
            
            {/* Luxury CTAs - Elevated Design - CENTERED */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
              <Link href="/shop" className="w-full sm:w-auto">
                <button className="group relative w-full sm:w-auto bg-[var(--rose-gold)] text-white px-12 py-5 text-sm uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl hover:shadow-[var(--rose-gold)]/50 overflow-hidden font-medium">
                  <span className="relative z-10">Shop the Collection</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--rose-gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              </Link>
              <Link href="/services" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-[var(--deep-charcoal)] px-12 py-5 text-sm uppercase tracking-[0.2em] transition-all duration-500 backdrop-blur-sm bg-white/5 font-medium">
                  Book Spa Session Now
                </button>
              </Link>
            </div>
            
            {/* Trust Indicators - Elegant - CENTERED */}
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-8 max-w-2xl w-full pt-8 border-t border-white/10">
                <div className="text-center">
                  <p className="text-3xl font-serif text-[var(--rose-gold)] mb-2">5+</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Years Excellence</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif text-[var(--rose-gold)] mb-2">100%</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Natural Products</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-serif text-[var(--rose-gold)] mb-2">1000+</p>
                  <p className="text-xs text-white/60 uppercase tracking-wider">Happy Clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Elegant Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <div className="flex flex-col items-center gap-2">
            <p className="text-white/60 text-xs uppercase tracking-widest">Scroll</p>
            <svg className="w-6 h-6 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Premium Products - Cosmefrica Style Grid - FULLY CENTERED */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl">
            {/* Section Header */}
            <div className="text-center mb-12">
              <p className="text-[var(--rose-gold)] uppercase tracking-[0.2em] text-xs font-medium mb-3">
                New Arrivals
              </p>
              <h2 className="text-[var(--deep-charcoal)] mb-4">
                Natural Beauty Products
              </h2>
              <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto mb-6"></div>
              <p className="text-sm sm:text-base text-gray-700 font-light leading-relaxed px-4 max-w-3xl mx-auto">
                Meticulously crafted with premium natural ingredients for radiant, healthy skin
              </p>
            </div>
            
            {/* Premium Grid - Luxury Breathing Space */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* View All CTA */}
            <div className="text-center">
              <Link href="/shop">
                <button className="border border-[var(--rose-gold)] text-[var(--deep-charcoal)] hover:bg-[var(--rose-gold)] hover:text-white px-12 py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 rounded-lg font-medium">
                  View All Products
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Spa Services - Perfect Spacing & Balance */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full flex justify-center px-6 sm:px-8">
          <div className="w-full max-w-[1400px]">
            {/* Section Header - Better Spacing */}
            <div className="text-center mb-16">
              <p className="text-[var(--rose-gold)] uppercase tracking-[0.3em] text-xs font-medium mb-4">
                QM Luxury Spa Salon
              </p>
              <h2 className="text-[var(--deep-charcoal)] mb-6 text-4xl md:text-5xl font-serif">
                Premium Spa Services
              </h2>
              <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto mb-8"></div>
              <p className="text-base text-gray-700 font-light leading-relaxed max-w-3xl mx-auto">
                Relax and rejuvenate with our bespoke spa treatments in the heart of Dar es Salaam
              </p>
            </div>
            
            {/* Premium Service Grid - Equal Cards with Perfect Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 mb-16">
              {services.map((service) => (
                <div key={service.id} className="bg-white border border-gray-200 rounded-2xl shadow-md p-10 flex flex-col hover:shadow-2xl transition-all duration-300 min-h-[600px]">
                  {/* Service Image - Clean */}
                  <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-8">
                    <div className="w-full h-full bg-[var(--champagne)]/30 rounded-xl"></div>
                  </div>
                  
                  {/* Service Info - Perfectly Centered */}
                  <div className="flex flex-col flex-grow text-center">
                    <h3 className="text-gray-900 font-bold text-2xl mb-5 leading-tight">{service.name}</h3>
                    <p className="text-gray-600 text-base mb-8 leading-relaxed">{service.description}</p>
                    
                    {/* Price & Duration - Centered with Divider */}
                    <div className="flex justify-center items-center gap-10 pb-8 mb-8 border-b-2 border-gray-200">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Duration</p>
                        <p className="text-lg font-bold text-gray-900">{service.duration}</p>
                      </div>
                      <div className="w-px h-16 bg-gray-300"></div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">From</p>
                        <p className="text-black font-extrabold text-3xl">
                          Tsh {(service.price / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => window.open(`https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20${encodeURIComponent(service.name)}`, '_blank')}
                      className="w-full bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white py-5 px-8 text-sm uppercase tracking-wider transition-all duration-300 rounded-xl font-bold shadow-lg hover:shadow-2xl mt-auto"
                    >
                      Book on WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All CTA - Better Spacing */}
            <div className="text-center">
              <Link href="/services">
                <button className="bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white px-16 py-6 text-base uppercase tracking-[0.15em] transition-all duration-300 shadow-xl hover:shadow-2xl rounded-xl font-bold">
                  View All Services
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Testimonials - Better Spacing & Alignment */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="w-full flex justify-center items-center px-4">
          <div className="w-full max-w-7xl">
            {/* Section Header - Better Spacing */}
            <div className="text-center mb-16">
              <p className="text-[var(--rose-gold)] uppercase tracking-[0.3em] text-xs font-medium mb-4">
                Client Stories
              </p>
              <h2 className="text-[var(--deep-charcoal)] mb-6 text-4xl md:text-5xl font-serif">
                Trusted by Beauty Enthusiasts
              </h2>
              <div className="w-24 h-[2px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto"></div>
            </div>
            
            {/* Testimonials Grid - Better Spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 relative hover:shadow-xl transition-all duration-300">
                  {/* Quote Mark */}
                  <div className="text-6xl text-[var(--rose-gold)]/20 font-serif absolute top-6 left-6">"</div>
                  
                  {/* Stars */}
                  <div className="flex gap-1 mb-8 relative z-10">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-[var(--rose-gold)]" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  
                  {/* Comment */}
                  <p className="text-gray-700 mb-8 italic leading-relaxed text-base relative z-10">
                    {testimonial.comment}
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-[var(--rose-gold)] to-[var(--accent-gold)] rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-base">{testimonial.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(testimonial.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA Section - Cosmefrica Style - FULLY CENTERED */}
      <section className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-br from-[var(--deep-charcoal)] via-[var(--espresso)] to-[var(--deep-charcoal)]">
        {/* Content */}
        <div className="w-full flex justify-center items-center px-4">
          <div className="w-full max-w-4xl text-center">
            <p className="text-[var(--rose-gold)] uppercase tracking-[0.3em] text-xs font-medium mb-6">
              Visit Us
            </p>
            <h2 className="text-white mb-6">
              Experience QM Beauty
            </h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto mb-8"></div>
            <p className="text-lg text-white/80 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
              Visit our luxury boutique at 59 Ali Hassan Mwinyi Road, Masaki, Dar es Salaam. Experience our products firsthand and consult with our beauty experts.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="bg-white text-[var(--deep-charcoal)] hover:bg-gray-100 px-10 py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-xl rounded-lg font-medium">
                  Get Directions
                </button>
              </Link>
              <button
                onClick={() => window.open('https://wa.me/255657120151?text=Hello!%20I%20want%20to%20visit%20QM%20Beauty', '_blank')}
                className="border-2 border-white text-white hover:bg-white hover:text-[var(--deep-charcoal)] px-10 py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 rounded-lg font-medium"
              >
                Talk to a Beauty Expert
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
