'use client';

import { useState, useEffect } from 'react';

// Payment Provider Card Component
export const PaymentProviderCard = ({ name, provider, prefix, icon, iconColor, selected, onSelect }: {
  name: string;
  provider: 'mpesa' | 'tigo' | 'airtel' | 'halopesa';
  prefix: string;
  icon: string;
  iconColor: string;
  selected: string;
  onSelect: (value: 'mpesa' | 'tigo' | 'airtel' | 'halopesa' | '') => void;
}) => {
  const isSelected = selected === provider;
  
  return (
    <label 
      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
        isSelected 
          ? 'border-[var(--rose-gold)] bg-[var(--cream)]' 
          : 'border-[var(--borderSoft)] hover:border-[var(--rose-gold)]'
      }`}
    >
      <input
        type="radio"
        name="payment"
        value={provider}
        checked={isSelected}
        onChange={(e) => onSelect(e.target.value as 'mpesa' | 'tigo' | 'airtel' | 'halopesa' | '')}
        className="sr-only"
        aria-label={`${name} payment method`}
      />
      <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center text-white font-bold text-base mb-2`}>
        {icon}
      </div>
      <div className="font-semibold text-[var(--deep-charcoal)] text-sm">{name}</div>
      <div className="text-xs text-[var(--textLight)] mt-1">{prefix}</div>
      {isSelected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-[var(--rose-gold)] rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </label>
  );
};

// Phone Number Field Component
export const PhoneNumberField = ({ value, onChange, disabled, error }: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string;
}) => {
  const [formattedValue, setFormattedValue] = useState(value);
  
  // Format phone number as user types
  useEffect(() => {
    if (value) {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Apply Tanzania phone number formatting: 07XXXXXXXX or +255XXXXXXXX
      let formatted = '';
      if (digitsOnly.startsWith('0')) {
        if (digitsOnly.length > 10) {
          formatted = digitsOnly.substring(0, 11); // 07XXXXXXXX (11 digits)
        } else {
          formatted = digitsOnly;
        }
      } else if (digitsOnly.startsWith('255')) {
        if (digitsOnly.length > 12) {
          formatted = digitsOnly.substring(0, 13); // 255XXXXXXXX (13 digits)
        } else {
          formatted = digitsOnly;
        }
      } else if (digitsOnly.length > 9) {
        formatted = digitsOnly.substring(0, 9); // 7XXXXXXXX (9 digits)
      } else {
        formatted = digitsOnly;
      }
      
      setFormattedValue(formatted);
    }
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--deep-charcoal)] mb-2">
        Mobile money number
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--textLight)]">
          +255
        </div>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required
          value={formattedValue}
          onChange={(e) => {
            // Remove all non-digit characters before setting
            const newValue = e.target.value.replace(/\D/g, '');
            onChange(newValue);
          }}
          placeholder="712 345 678"
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-3 border ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-[var(--borderSoft)] focus:ring-[var(--rose-gold)] focus:border-[var(--rose-gold)]'
          } rounded-lg transition-colors`}
        />
      </div>
      <p className="text-xs text-[var(--textLight)] mt-2">
        Enter the number registered to your mobile money account.
      </p>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

// Order Summary Card Component
export const OrderSummaryCard = ({ orderDetails }: { orderDetails: any }) => {
  if (!orderDetails) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-[var(--borderSoft)] animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="mt-6 pt-4 border-t border-[var(--borderSoft)]">
          <div className="h-6 bg-gray-200 rounded w-2/3 ml-auto"></div>
        </div>
      </div>
    );
  }

  const { customerName, totalAmount, items } = orderDetails;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-[var(--borderSoft)]">
      <h2 className="text-lg font-semibold text-[var(--deep-charcoal)] mb-4">
        Order Summary
      </h2>
      
      <div className="mb-6">
        <div className="text-xs text-[var(--textLight)] uppercase tracking-wide mb-1">
          Order ID
        </div>
        <div className="font-mono text-sm text-[var(--deep-charcoal)]">
          {orderDetails.orderCode}
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        {items && items.length > 0 ? (
          <>
            {items.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <div>
                  <div className="text-sm text-[var(--deep-charcoal)]">{item.name}</div>
                  <div className="text-xs text-[var(--textLight)]">Qty: {item.quantity}</div>
                </div>
                <div className="text-sm text-[var(--deep-charcoal)]">
                  {(item.price * item.quantity).toLocaleString()} Tsh
                </div>
              </div>
            ))}
            {items.length > 3 && (
              <div className="text-xs text-[var(--textLight)] text-center">
                + {items.length - 3} more items
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-[var(--textLight)]">No items found</div>
        )}
      </div>
      
      <div className="border-t border-[var(--borderSoft)] pt-4 space-y-2">
        <div className="flex justify-between text-[var(--deep-charcoal)]">
          <span>Total</span>
          <span className="font-semibold text-lg">
            {totalAmount?.toLocaleString() || '0'} Tsh
          </span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-[var(--borderSoft)]">
        <div className="text-xs text-[var(--textLight)] text-center">
          Need help?{' '}
          <a 
            href="https://wa.me/255657120151" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--rose-gold)] hover:underline"
          >
            Contact us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};