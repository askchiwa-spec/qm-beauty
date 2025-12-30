'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `Name: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0AMessage: ${formData.message}`;
    window.open(`https://wa.me/255657120151?text=${whatsappMessage}`, '_blank');
  };
  
  return (
    <div className="min-h-screen">
      {/* Premium Hero - Cosmefrica Style */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto text-center relative z-10">
            <p className="text-[var(--rose-gold)] uppercase tracking-[0.25em] text-xs font-medium mb-4">
              Connect
            </p>
            <h1 className="text-[var(--deep-charcoal)] mb-6">
              Get In Touch
            </h1>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-[var(--espresso)] font-light leading-relaxed">
              Visit us, call us, or send a message. We're here to help!
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            {/* Contact Form - Luxury Styled */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[var(--deep-charcoal)] mb-8 font-medium">
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Your Name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your@email.com"
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+255 XXX XXX XXX"
                />
                
                <div>
                  <label className="block text-sm font-medium text-[var(--deep-charcoal)] mb-3 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    className="w-full px-6 py-4 border border-[var(--champagne)] focus:outline-none focus:border-[var(--rose-gold)] transition-all bg-white text-[var(--deep-charcoal)]"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-lg hover:shadow-xl min-h-[48px]"
                >
                  Send Message via WhatsApp
                </button>
              </form>
            </div>
            
            {/* Contact Info - Elegant Icons */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif text-[var(--deep-charcoal)] mb-8 font-medium">
                Visit Our Store
              </h2>
              
              <div className="space-y-8 mb-10">
                <div className="flex gap-6">
                  <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg mb-2 text-[var(--deep-charcoal)] font-medium">Location</h3>
                    <p className="text-[var(--espresso)] font-light leading-relaxed">
                      59 Ali Hassan Mwinyi Road, Masaki<br />
                      Dar es Salaam, Tanzania
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg mb-2 text-[var(--deep-charcoal)] font-medium">Phone</h3>
                    <p className="text-[var(--espresso)] font-light">+255 657 120 151</p>
                    <button
                      onClick={() => window.open('https://wa.me/255657120151', '_blank')}
                      className="text-[var(--rose-gold)] hover:text-[var(--accent-gold)] mt-2 transition-colors text-sm"
                    >
                      Chat on WhatsApp
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg mb-2 text-[var(--deep-charcoal)] font-medium">Opening Hours</h3>
                    <p className="text-[var(--espresso)] font-light leading-relaxed">
                      Monday - Friday: 9:00 AM - 7:00 PM<br />
                      Saturday: 9:00 AM - 5:00 PM<br />
                      Sunday: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-[var(--rose-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg mb-2 text-[var(--deep-charcoal)] font-medium">Email</h3>
                    <p className="text-[var(--espresso)] font-light">info@qmbeauty.co.tz</p>
                  </div>
                </div>
              </div>
              
              {/* Google Maps - Elegant */}
              <div className="overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63416.56774890624!2d39.24637!3d-6.79235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c4b7a3b3c3d3d%3A0x3f3c3d3d3d3d3d3d!2sUpanga%2C%20Dar%20es%20Salaam%2C%20Tanzania!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="QM Beauty Location"
                />
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Premium Spacing */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif text-center text-[var(--deep-charcoal)] mb-16 font-medium">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <details className="bg-white p-8 shadow-md elegant-hover">
                <summary className="font-serif text-lg cursor-pointer text-[var(--deep-charcoal)] font-medium">
                  Do you offer home delivery?
                </summary>
                <p className="mt-4 text-[var(--espresso)] font-light leading-relaxed">
                  Yes! We offer delivery within Dar es Salaam. Contact us on WhatsApp for delivery details and charges.
                </p>
              </details>
              
              <details className="bg-white p-8 shadow-md elegant-hover">
                <summary className="font-serif text-lg cursor-pointer text-[var(--deep-charcoal)] font-medium">
                  Are your products really organic?
                </summary>
                <p className="mt-4 text-[var(--espresso)] font-light leading-relaxed">
                  Absolutely! All our products are made with 100% natural, organic ingredients. We never use harmful chemicals.
                </p>
              </details>
              
              <details className="bg-white p-8 shadow-md elegant-hover">
                <summary className="font-serif text-lg cursor-pointer text-[var(--deep-charcoal)] font-medium">
                  Can I book a spa appointment online?
                </summary>
                <p className="mt-4 text-[var(--espresso)] font-light leading-relaxed">
                  Yes! You can book appointments via WhatsApp or by calling us directly. We recommend booking in advance.
                </p>
              </details>
              
              <details className="bg-white p-8 shadow-md elegant-hover">
                <summary className="font-serif text-lg cursor-pointer text-[var(--deep-charcoal)] font-medium">
                  What payment methods do you accept?
                </summary>
                <p className="mt-4 text-[var(--espresso)] font-light leading-relaxed">
                  We accept cash, mobile money (M-Pesa, Tigo Pesa, Airtel Money), and bank transfers.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
