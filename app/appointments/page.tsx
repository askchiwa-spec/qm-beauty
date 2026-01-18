'use client';

import { useState } from 'react';
import Link from 'next/link';
import { services } from '@/data/products';

export default function AppointmentsPage() {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the appointment details
    const appointmentDetails = `
      New Appointment Request:
      Service: ${services.find(s => s.id === selectedService)?.name || 'N/A'}
      Date: ${selectedDate}
      Time: ${selectedTime}
      Customer: ${customerName}
      Phone: ${customerPhone}
      Email: ${customerEmail}
      Notes: ${notes}
    `;

    // Send to WhatsApp
    const message = `Hello! I would like to book an appointment.${appointmentDetails}`;
    window.open(`https://wa.me/255657120151?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Generate time slots (every 30 minutes from 9 AM to 6 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--charcoal)] mb-6">
            Book Your Appointment
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Schedule your spa treatment or beauty service with our expert team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-8">Book Appointment</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage-green)]"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage-green)]"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage-green)]"
                    required
                  >
                    <option value="">Choose a time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage-green)]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage-green)]"
                  placeholder="e.g., 255712345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage-green)]"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--sage-green)]"
                  placeholder="Any special requests or notes..."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--sage-green)] hover:bg-[var(--deep-green)] text-white py-4 rounded-lg font-medium transition-colors"
              >
                Book Appointment
              </button>
            </form>
          </div>

          {/* Services Info */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-8">Our Services</h2>
            
            <div className="space-y-6">
              {services.slice(0, 5).map(service => (
                <div key={service.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <h3 className="font-bold text-lg text-[var(--charcoal)] mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--sage-green)] font-bold">Tsh {service.price.toLocaleString()}</span>
                    <span className="text-gray-500 text-sm">{service.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-[var(--soft-beige)] rounded-xl p-6">
              <h3 className="font-bold text-lg text-[var(--charcoal)] mb-4">Booking Information</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-[var(--sage-green)] mr-2">•</span>
                  <span>Book at least 24 hours in advance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--sage-green)] mr-2">•</span>
                  <span>Cancellations must be made 12 hours prior</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--sage-green)] mr-2">•</span>
                  <span>Arrive 10 minutes before your appointment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[var(--sage-green)] mr-2">•</span>
                  <span>Have your preferred time and service ready</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Alternative Booking */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-6">Prefer to Book Directly?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => window.open(`https://wa.me/255657120151?text=Hello!%20I%20want%20to%20book%20an%20appointment`, '_blank')}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-2.906 0-5.269-2.377-5.273-5.298 0-2.909 2.363-5.298 5.272-5.298 2.909 0 5.273 2.389 5.273 5.298 0 2.921-2.364 5.298-5.273 5.298m4.214-9.771c-.268-.578-.731-.803-1.329-.986-.598-.186-1.327-.278-2.194-.281-1.562-.005-3.302.798-4.194 1.691-1.074 1.075-1.677 2.456-1.681 3.907 0 .179.008.357.024.535.034.356.179.7.428 1.001l.79 1.006 1.006.79c.301.249.645.394.999.429.177.016.356.024.535.024 1.451-.004 2.832-.607 3.907-1.681.892-.893 1.696-2.633 1.691-4.194-.003-.868-.096-1.597-.281-2.194-.183-.598-.408-1.062-.986-1.329"/>
              </svg>
              <span>Book via WhatsApp</span>
            </button>
            
            <button
              onClick={() => window.open('tel:+255657120151', '_self')}
              className="border-2 border-[var(--sage-green)] text-[var(--sage-green)] hover:bg-[var(--sage-green)] hover:text-white px-8 py-4 rounded-lg font-medium transition-colors"
            >
              Call Us Directly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}