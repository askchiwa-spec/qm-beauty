'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { services } from '@/data/products';
import { useToast } from '@/lib/useToast';

export default function AppointmentsPage() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Generate time slots (every 30 minutes from 9 AM to 6 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Filter available times based on selected date (exclude past times on current date)
  useEffect(() => {
    const allSlots = generateTimeSlots();
    
    if (selectedDate) {
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate === today) {
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        const filteredSlots = allSlots.filter(slot => {
          return slot > currentTimeString;
        });
        setAvailableTimes(filteredSlots);
        
        // Reset selected time if it's no longer available
        if (!filteredSlots.includes(selectedTime)) {
          setSelectedTime('');
        }
      } else {
        setAvailableTimes(allSlots);
      }
    } else {
      setAvailableTimes(allSlots);
    }
  }, [selectedDate]);

  const validateForm = () => {
    if (!selectedService) {
      showToast('Please select a service', 'error');
      return false;
    }
    if (!selectedDate) {
      showToast('Please select a date', 'error');
      return false;
    }
    if (!selectedTime) {
      showToast('Please select a time', 'error');
      return false;
    }
    if (!customerName.trim()) {
      showToast('Please enter your name', 'error');
      return false;
    }
    if (!customerPhone.trim()) {
      showToast('Please enter your phone number', 'error');
      return false;
    }
    // Basic phone validation
    if (!/^\d{9,15}$/.test(customerPhone.replace(/[\s+\-()]/g, ''))) {
      showToast('Please enter a valid phone number', 'error');
      return false;
    }
    if (customerEmail && customerEmail.trim() && !/\S+@\S+\.\S+/.test(customerEmail)) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the appointment details
      const selectedServiceObj = services.find(s => s.id === selectedService);
      const serviceName = selectedServiceObj?.name || 'N/A';
      const servicePrice = selectedServiceObj?.price ? `Tsh ${selectedServiceObj.price.toLocaleString()}` : '';
      
      const appointmentDetails = encodeURIComponent(`
New Appointment Request:
Service: ${serviceName} ${servicePrice ? `- ${servicePrice}` : ''}
Date: ${selectedDate}
Time: ${selectedTime}
Customer: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail || 'N/A'}
Notes: ${notes || 'None'}
      `.trim());

      // Send to WhatsApp using the business number
      const message = `Hello! I would like to book an appointment.%0A%0A${appointmentDetails}`;
      window.open(`https://wa.me/255657120151?text=${message}`, '_blank');
      
      showToast('Appointment request sent successfully! We will contact you shortly.', 'success');
      
      // Reset form
      setTimeout(() => {
        setSelectedService('');
        setSelectedDate('');
        setSelectedTime('');
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setNotes('');
      }, 1000);
    } catch (error) {
      console.error('Error submitting appointment:', error);
      showToast('Failed to submit appointment. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen appointment-page-container">
      {/* Elegant Hero - Full Width */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-br from-[var(--pearl-white)] via-[var(--champagne)] to-[var(--soft-beige)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto text-center relative z-10">
            <p className="text-[var(--rose-gold)] uppercase tracking-[0.25em] text-xs font-medium mb-4">
              Book Appointment
            </p>
            <h1 className="text-[var(--deep-charcoal)] mb-6">
              Schedule Your Spa Treatment
            </h1>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[var(--rose-gold)] to-transparent mx-auto mb-6"></div>
            <p className="text-lg text-[var(--espresso)] max-w-3xl mx-auto font-light leading-relaxed mb-8">
              Reserve your spot for a luxurious spa experience at our Oysterbay location.
            </p>
            <button
              onClick={() => window.open('https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20an%20appointment', '_blank')}
              className="bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white px-12 py-4 text-xs uppercase tracking-[0.15em] transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-3 min-h-[48px]"
            >
              <span>Book via WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Booking Form */}
              <div className="appointment-form-section bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-medium text-[var(--deep-charcoal)] mb-6 text-center">Schedule Your Appointment</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Select Service</label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rose-gold)] text-center"
                      required
                    >
                      <option value="">Choose a service</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name} - Tsh {service.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rose-gold)]"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <div className="time-selection-container">
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rose-gold)]"
                          required
                          disabled={!selectedDate}
                        >
                          <option value="">Choose a time</option>
                          {availableTimes.map(time => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                        {!selectedDate && (
                          <p className="date-required-message text-xs text-gray-500">Select a date first</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rose-gold)]"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rose-gold)]"
                      placeholder="e.g., 255712345678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rose-gold)]"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rose-gold)]"
                      placeholder="Any special requests or notes..."
                      rows={4}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-medium transition-colors uppercase tracking-wider text-xs"
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Appointment'}
                  </button>
                </form>
              </div>

              {/* Services Info */}
              <div className="services-section">
                <h2 className="text-2xl font-medium text-[var(--deep-charcoal)] mb-6">Our Popular Services</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.slice(0, 5).map(service => (
                    <div key={service.id} className="service-item bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h3 className="font-medium text-[var(--deep-charcoal)] mb-2 text-center">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-3 text-center px-2">{service.description}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-[var(--rose-gold)] font-bold">Tsh {service.price.toLocaleString()}</span>
                        <span className="text-gray-500 text-sm">{service.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-gradient-to-br from-[var(--pearl-white)] to-[var(--champagne)] rounded-xl p-6 border border-gray-200">
                  <h3 className="font-medium text-[var(--deep-charcoal)] mb-4 text-center">Booking Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-700 px-2">
                    <li className="flex items-start">
                      <span className="text-[var(--rose-gold)] mr-2 mt-1">•</span>
                      <span>Book at least 24 hours in advance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[var(--rose-gold)] mr-2 mt-1">•</span>
                      <span>Cancellations must be made 12 hours prior</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[var(--rose-gold)] mr-2 mt-1">•</span>
                      <span>Arrive 10 minutes before your appointment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[var(--rose-gold)] mr-2 mt-1">•</span>
                      <span>Have your preferred time and service ready</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Booking */}
      <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-[var(--pearl-white)] to-[var(--champagne)]">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto text-center">
            <h2 className="text-2xl font-medium text-[var(--deep-charcoal)] mb-6">Prefer to Book Directly?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => window.open(`https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20an%20appointment`, '_blank')}
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-2.906 0-5.269-2.377-5.273-5.298 0-2.909 2.363-5.298 5.272-5.298 2.909 0 5.273 2.389 5.273 5.298 0 2.921-2.364 5.298-5.273 5.298m4.214-9.771c-.268-.578-.731-.803-1.329-.986-.598-.186-1.327-.278-2.194-.281-1.562-.005-3.302.798-4.194 1.691-1.074 1.075-1.677 2.456-1.681 3.907 0 .179.008.357.024.535.034.356.179.7.428 1.001l.79 1.006 1.006.79c.301.249.645.394.999.429.177.016.356.024.535.024 1.451-.004 2.832-.607 3.907-1.681.892-.893 1.696-2.633 1.691-4.194-.003-.868-.096-1.597-.281-2.194-.183-.598-.408-1.062-.986-1.329"/>
                </svg>
                <span>WhatsApp Booking</span>
              </button>
              
              <button
                onClick={() => window.open('tel:+255657120151', '_self')}
                className="border border-[var(--rose-gold)] text-[var(--deep-charcoal)] hover:bg-[var(--rose-gold)] hover:text-white px-8 py-4 rounded-lg font-medium transition-colors uppercase tracking-wider text-xs"
              >
                Call Us Directly
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant CTA */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="w-full flex justify-center px-4">
          <div className="w-full max-w-7xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-medium text-[var(--deep-charcoal)] mb-6 font-medium">
              Ready to Relax and Rejuvenate?
            </h2>
            <p className="text-lg text-[var(--espresso)] mb-10 font-light leading-relaxed max-w-2xl mx-auto">
              Book your appointment today and experience luxury spa treatments
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => window.open('https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20an%20appointment', '_blank')}
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