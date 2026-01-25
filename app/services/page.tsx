'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { services } from '@/data/products';

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Elegant Hero - Full Width */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-[var(--pearl-white)] via-[var(--champagne)] to-[var(--soft-beige)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto text-center relative z-10">
            <p className="text-[var(--rose-gold)] uppercase tracking-[0.25em] text-xs font-medium mb-4">
              Indulge
            </p>
            <h1 className="text-[var(--deep-charcoal)] mb-6">
              Luxury Spa & Beauty Services
            </h1>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-[var(--espresso)] max-w-3xl mx-auto font-light leading-relaxed mb-8">
              Experience premium treatments at our spa at 59 Ali Hassan Mwinyi Road, Oysterbay, Dar es Salaam. Natural products, professional care.
            </p>
            <button
              onClick={() => window.open('https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20a%20spa%20appointment', '_blank')}
              className="bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white px-12 py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-3 min-h-[48px]"
            >
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </section>

      {/* Premium Services Grid - Cosmefrica Style */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {services.map((service) => (
                <div key={service.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col items-center justify-between hover:shadow-lg transition-all duration-300">
                  {/* Service Image - Match ProductCard style */}
                  <div className="w-full h-56 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                    {service.image && !service.image.startsWith('data:image') ? (
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-4">
                        <div className="bg-gradient-to-br from-[var(--sage-green)]/20 to-[var(--rose-gold)]/20 w-full h-full rounded-lg flex flex-col items-center justify-center p-2">
                          <div className="text-4xl mb-2">💆</div>
                          <div className="text-center text-xs font-medium text-[var(--charcoal)] truncate max-w-[80%]">
                            {service.name}
                          </div>
                          <div className="text-[8px] text-gray-500 mt-1">QM Beauty</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay effect on hover */}
                    <div className="absolute inset-0 bg-white/0 hover:bg-white/30 transition-all duration-500"></div>
                  </div>
                  
                  {/* Service Info - Centered & Clean like ProductCard */}
                  <div className="w-full flex flex-col items-center">
                    <h3 className="text-gray-800 font-medium text-sm mt-4 mb-2 text-center hover:text-[var(--rose-gold)] transition-colors">
                      {service.name}
                    </h3>
                    
                    <div className="flex flex-col items-center mb-3">
                      <p className="text-gray-600 text-xs text-center line-clamp-2 px-2 mb-2">
                        {service.description}
                      </p>
                    </div>
                    
                    {/* Price & Duration - Match ProductCard style */}
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                        <p className="text-sm font-medium text-gray-800">{service.duration}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">From</p>
                        <p className="text-black font-bold text-lg">
                          Tsh {(service.price / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Match ProductCard style */}
                    <div className="flex flex-col gap-2 w-full mt-2">
                      <button
                        onClick={() => window.open(`https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20${encodeURIComponent(service.name)}`, '_blank')}
                        className="w-full bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white py-2.5 px-4 text-xs uppercase tracking-wider transition-all duration-300 rounded-lg font-medium"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => window.open(`tel:+255657120151`, '_self')}
                        className="w-full bg-[var(--deep-charcoal)] hover:bg-[var(--espresso)] text-white py-2.5 px-4 text-xs uppercase tracking-wider transition-all duration-300 rounded-lg font-medium"
                      >
                        Call Us
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Premium & Clean */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-[var(--pearl-white)] to-[var(--champagne)]">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[var(--rose-gold)] uppercase tracking-[0.25em] text-xs font-medium mb-4">
                Excellence
              </p>
              <h2 className="text-[var(--deep-charcoal)] mb-6">
                Why Choose QM Beauty Spa?
              </h2>
              <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
              <div className="text-center bg-white p-8 elegant-hover">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg mb-3 text-[var(--deep-charcoal)] font-medium">Natural Products</h3>
                <p className="text-[var(--espresso)] text-sm leading-relaxed">100% organic and cruelty-free products</p>
              </div>
              
              <div className="text-center bg-white p-8 elegant-hover">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg mb-3 text-[var(--deep-charcoal)] font-medium">Expert Therapists</h3>
                <p className="text-[var(--espresso)] text-sm leading-relaxed">Trained professionals with years of experience</p>
              </div>
              
              <div className="text-center bg-white p-8 elegant-hover">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg mb-3 text-[var(--deep-charcoal)] font-medium">Luxury Environment</h3>
                <p className="text-[var(--espresso)] text-sm leading-relaxed">Relaxing ambiance for your comfort</p>
              </div>
              
              <div className="text-center bg-white p-8 elegant-hover">
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg mb-3 text-[var(--deep-charcoal)] font-medium">Prime Location</h3>
                <p className="text-[var(--espresso)] text-sm leading-relaxed">59 Ali Hassan Mwinyi Road, Oysterbay, Dar es Salaam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendly Booking Widget */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[var(--rose-gold)] uppercase tracking-[0.25em] text-xs font-medium mb-4">
                Book Online
              </p>
              <h2 className="text-[var(--deep-charcoal)] mb-6">
                Schedule Your Appointment
              </h2>
              <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto mb-6"></div>
              <p className="text-[var(--espresso)] max-w-2xl mx-auto font-light leading-relaxed">
                Choose your preferred date and time for your spa treatment
              </p>
            </div>
            
            {/* Calendly Inline Widget */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-8">
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/your-calendly-link?hide_gdpr_banner=1&background_color=faf9f7&text_color=2d2d2d&primary_color=c9a581" 
                style={{ minWidth: '320px', height: '700px' }}
              ></div>
              <script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Prefer to book via WhatsApp? {' '}
                <button
                  onClick={() => window.open('https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20a%20spa%20appointment', '_blank')}
                  className="text-[var(--rose-gold)] hover:underline font-medium"
                >
                  Contact us here
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant CTA */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-serif text-[var(--deep-charcoal)] mb-6 font-medium">
              Ready to Relax and Rejuvenate?
            </h2>
            <p className="text-lg text-[var(--espresso)] mb-10 font-light leading-relaxed max-w-2xl mx-auto">
              Book your appointment today and experience luxury spa treatments
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => window.open('https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20a%20spa%20appointment', '_blank')}
                className="bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white px-12 py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-3 min-h-[48px]"
              >
                <span>Book on WhatsApp</span>
              </button>
              <Link href="/contact">
                <button className="border border-[var(--rose-gold)] text-[var(--deep-charcoal)] hover:bg-[var(--rose-gold)] hover:text-white px-12 py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 inline-flex items-center justify-center gap-3 min-h-[48px]">
                  <span>Visit Our Spa</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
