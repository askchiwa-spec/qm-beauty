'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* 1️⃣ HERO SECTION - Full Width Luxury Banner */}
      <section className="relative w-full h-[70vh] overflow-hidden">
        {/* Hero Background Image - Next.js Optimized */}
        <Image
          src="/images/hero/about-hero.jpg"
          alt="QM Beauty Luxury Spa - About Us"
          fill
          className="object-cover"
          priority
          quality={90}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Fallback Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--champagne)] via-[var(--soft-beige)] to-[var(--pearl-white)]">
          {/* Elegant Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        {/* Luxury Text Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center z-10">
          <div className="w-full flex justify-center px-4">
            <div className="w-full max-w-4xl mx-auto text-center text-white">
              <p className="text-[var(--rose-gold)] uppercase tracking-[0.3em] text-xs sm:text-sm font-medium mb-6 drop-shadow-lg">
                Since 2020
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight drop-shadow-2xl">
                Redefining Luxury Beauty<br className="hidden sm:block" /> & Wellness in Africa
              </h1>
              <div className="w-24 h-[2px] bg-[var(--rose-gold)] mx-auto mb-8"></div>
              <p className="text-base sm:text-lg md:text-xl opacity-95 font-light leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                QM Beauty blends African tradition, modern skincare science, and world-class spa excellence to help every woman feel confident, radiant, and beautiful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2️⃣ FOUNDER STORY SECTION - Premium Magazine Layout */}
      <section className="py-20 sm:py-24 md:py-28 bg-white">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[var(--rose-gold)] uppercase tracking-[0.25em] text-xs font-medium mb-4">
                Our Story
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--deep-charcoal)] mb-6">
                The Visionary Behind QM Beauty
              </h2>
              <div className="w-24 h-[2px] bg-[var(--rose-gold)] mx-auto"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-6">
                <div className="space-y-4 text-base sm:text-lg text-[var(--espresso)] leading-relaxed font-light">
                  <p>
                    My name is Saida Bandawe, a mother of two and a passionate entrepreneur. I am the founder of QM Beauty, a company dedicated to producing and supplying high-quality natural beauty products, including our well-known carrot and turmeric oils, among many other effective formulations.
                  </p>
                  <p>
                    With a degree in Business, I am committed to adding value in everything I do. Through QM Beauty, I have contributed to the growth of natural cosmetic production in Tanzania, created employment opportunities for young people, and helped address widespread challenges in the beauty industry—especially concerns related to skin and hair damage caused by harmful products.
                  </p>
                  <p>
                    At QM Beauty, our mission is to provide safe, natural solutions that restore confidence, promote healthier skin and hair, and inspire self-love. We strongly advocate for people to embrace their natural beauty and avoid products that compromise their wellbeing. That is why we say, “LUVurself.”
                  </p>
                  <p>
                    Beyond beauty, I am also a professional home-cooked meals chef, offering catering services for weddings, celebrations, and special events.
                  </p>
                  <p className="font-medium text-[var(--deep-charcoal)]">
                    You can connect with us on social media via @qmbeautytz or reach out directly at +255 715 727 085.
                  </p>
                </div>
              </div>
              
              {/* Premium Image */}
              <div className="relative">
                <div className="aspect-[4/5] bg-gradient-to-br from-[var(--champagne)] to-[var(--soft-beige)] rounded-2xl overflow-hidden shadow-2xl">
                  {/* Next.js optimized image - Replace with your actual spa image */}
                  <Image
                    src="/images/spa/brand-story.jpg"
                    alt="QM Beauty Luxury Spa Experience"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    onError={(e) => {
                      // Fallback to gradient placeholder if image not found
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Fallback placeholder when image not available */}
                  <div className="w-full h-full flex items-center justify-center absolute inset-0">
                    <div className="text-center px-6">
                      <svg className="w-24 h-24 mx-auto mb-4 text-[var(--rose-gold)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      </svg>
                      <p className="text-sm text-[var(--espresso)]/60 italic">Add image: /images/spa/brand-story.jpg</p>
                    </div>
                  </div>
                </div>
                {/* Decorative Element */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[var(--rose-gold)]/10 rounded-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ HUMAN TOUCH SECTION - Real People, Real Luxury */}
      <section className="py-20 sm:py-24 md:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[var(--rose-gold)] uppercase tracking-[0.25em] text-xs font-medium mb-4">
                Experience Excellence
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--deep-charcoal)] mb-6">
                A Space Where Beauty Meets Excellence
              </h2>
              <div className="w-24 h-[2px] bg-[var(--rose-gold)] mx-auto"></div>
            </div>
            
            {/* Premium Image Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {/* Image 1 - Expert Therapist */}
              <div className="group relative overflow-hidden rounded-2xl shadow-xl aspect-[3/4] bg-gradient-to-br from-[var(--champagne)] to-[var(--soft-beige)]">
                <Image
                  src="/images/team/therapist-1.jpg"
                  alt="Expert QM Beauty Therapist"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center absolute inset-0">
                  <div className="text-center px-6">
                    <svg className="w-20 h-20 mx-auto mb-3 text-[var(--rose-gold)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <p className="text-xs text-[var(--espresso)]/60 italic">Add: /images/team/therapist-1.jpg</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
              
              {/* Image 2 - Spa Treatment */}
              <div className="group relative overflow-hidden rounded-2xl shadow-xl aspect-[3/4] bg-gradient-to-br from-[var(--soft-beige)] to-[var(--pearl-white)]">
                <Image
                  src="/images/spa/treatment-1.jpg"
                  alt="Luxury Spa Treatment at QM Beauty"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center absolute inset-0">
                  <div className="text-center px-6">
                    <svg className="w-20 h-20 mx-auto mb-3 text-[var(--rose-gold)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <p className="text-xs text-[var(--espresso)]/60 italic">Add: /images/spa/treatment-1.jpg</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
              
              {/* Image 3 - Happy Client */}
              <div className="group relative overflow-hidden rounded-2xl shadow-xl aspect-[3/4] bg-gradient-to-br from-[var(--pearl-white)] to-[var(--champagne)] sm:col-span-2 lg:col-span-1">
                <Image
                  src="/images/team/client-happy.jpg"
                  alt="Happy QM Beauty Client"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center absolute inset-0">
                  <div className="text-center px-6">
                    <svg className="w-20 h-20 mx-auto mb-3 text-[var(--rose-gold)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    <p className="text-xs text-[var(--espresso)]/60 italic">Add: /images/team/client-happy.jpg</p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ LUXURY VALUE SECTION - Premium Spa Style */}
      <section className="py-20 sm:py-24 md:py-28 bg-white">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[var(--rose-gold)] uppercase tracking-[0.25em] text-xs font-medium mb-4">
                Why Choose Us
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--deep-charcoal)] mb-6">
                The QM Beauty Promise
              </h2>
              <div className="w-24 h-[2px] bg-[var(--rose-gold)] mx-auto mb-8"></div>
              <p className="text-base sm:text-lg text-[var(--espresso)] max-w-3xl mx-auto font-light leading-relaxed">
                We combine luxury, expertise, and accessibility to deliver world-class beauty experiences
              </p>
            </div>
            
            {/* Premium 4-Card Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Card 1 */}
              <div className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--rose-gold)]/20 to-[var(--accent-gold)]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-[var(--deep-charcoal)] mb-3 font-medium">
                  Premium Treatments
                </h3>
                <p className="text-sm text-[var(--espresso)] leading-relaxed font-light">
                  World-class spa experiences with advanced techniques and 100% natural ingredients crafted for radiant results.
                </p>
              </div>
              
              {/* Card 2 */}
              <div className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--rose-gold)]/20 to-[var(--accent-gold)]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-[var(--deep-charcoal)] mb-3 font-medium">
                  African-Centered Beauty
                </h3>
                <p className="text-sm text-[var(--espresso)] leading-relaxed font-light">
                  Tailored solutions expertly designed for African, Asian, and European skin types with proven results.
                </p>
              </div>
              
              {/* Card 3 */}
              <div className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--rose-gold)]/20 to-[var(--accent-gold)]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-[var(--deep-charcoal)] mb-3 font-medium">
                  Luxury Yet Accessible
                </h3>
                <p className="text-sm text-[var(--espresso)] leading-relaxed font-light">
                  Serving middle-class and luxury clients alike while maintaining warmth, professionalism, and excellence.
                </p>
              </div>
              
              {/* Card 4 */}
              <div className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--rose-gold)]/20 to-[var(--accent-gold)]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-[var(--deep-charcoal)] mb-3 font-medium">
                  Prime Location
                </h3>
                <p className="text-sm text-[var(--espresso)] leading-relaxed font-light">
                  Located in Oysterbay, 59 Ali Hassan Mwinyi Road — elite environment with easy access and premium ambiance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ CALL TO ACTION - Elegant & Conversion-Focused */}
      <section className="py-24 sm:py-28 md:py-32 relative overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--deep-charcoal)] via-[var(--espresso)] to-black">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        {/* Content */}
        <div className="w-full flex justify-center px-4 relative z-10">
          <div className="w-full max-w-4xl mx-auto text-center text-white">
            <p className="text-[var(--rose-gold)] uppercase tracking-[0.3em] text-xs font-medium mb-6">
              Begin Your Journey
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
              Experience Luxury Beauty<br className="hidden sm:block" /> With QM Beauty
            </h2>
            <div className="w-24 h-[2px] bg-[var(--rose-gold)] mx-auto mb-10"></div>
            
            <p className="text-base sm:text-lg md:text-xl opacity-90 font-light leading-relaxed max-w-2xl mx-auto mb-12">
              Visit us for a rejuvenating spa treatment, shop premium skincare products, or consult with our beauty specialists. Let us help you discover your most radiant self.
            </p>
            
            {/* Premium CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button
                onClick={() => window.open('https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20an%20appointment%20at%20QM%20Beauty', '_blank')}
                className="group relative px-10 py-5 bg-[var(--rose-gold)] text-white rounded-full text-sm uppercase tracking-wider font-medium overflow-hidden shadow-2xl hover:shadow-[var(--rose-gold)]/50 transition-all duration-500 hover:scale-105 w-full sm:w-auto"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Book Appointment on WhatsApp
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-gold)] to-[var(--rose-gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
              
              <Link href="/shop" className="w-full sm:w-auto">
                <button className="px-10 py-5 border-2 border-white text-white rounded-full text-sm uppercase tracking-wider font-medium hover:bg-white hover:text-[var(--deep-charcoal)] transition-all duration-500 w-full">
                  Shop Premium Products
                </button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 pt-12 border-t border-white/10">
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div>
                  <p className="text-2xl sm:text-3xl font-serif text-[var(--rose-gold)] mb-2">5+</p>
                  <p className="text-xs sm:text-sm text-white/70 uppercase tracking-wider">Years Excellence</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-serif text-[var(--rose-gold)] mb-2">100%</p>
                  <p className="text-xs sm:text-sm text-white/70 uppercase tracking-wider">Natural Products</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-serif text-[var(--rose-gold)] mb-2">1000+</p>
                  <p className="text-xs sm:text-sm text-white/70 uppercase tracking-wider">Happy Clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
