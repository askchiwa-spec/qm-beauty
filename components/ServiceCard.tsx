import React from 'react';

interface ServiceCardProps {
  title: string;
  description: string;
  duration: string;
  price: string;
  benefits: string[];
  whatsappLink: string;
  phoneNumber: string;
}

export default function ServiceCard({
  title,
  description,
  duration,
  price,
  benefits,
  whatsappLink,
  phoneNumber
}: ServiceCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col items-center justify-between hover:shadow-lg transition-all duration-300">
      {/* Service Info - Centered & Clean like ProductCard */}
      <div className="w-full flex flex-col items-center">
        <h3 className="text-gray-800 font-medium text-sm mt-4 mb-2 text-center hover:text-[var(--rose-gold)] transition-colors">
          {title}
        </h3>
        
        <div className="flex flex-col items-center mb-3">
          <p className="text-gray-600 text-xs text-center line-clamp-2 px-2 mb-2">
            {description}
          </p>
        </div>
        
        {/* Price & Duration - Match ProductCard style */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</p>
            <p className="text-sm font-medium text-gray-800">{duration}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">From</p>
            <p className="text-black font-bold text-lg">{price}</p>
          </div>
        </div>
        
        {/* Action Buttons - Match ProductCard style */}
        <div className="flex flex-col gap-2 w-full mt-2">
          <a 
            href={whatsappLink}
            className="w-full bg-[var(--rose-gold)] hover:bg-[var(--accent-gold)] text-white py-2.5 px-4 text-xs uppercase tracking-wider transition-all duration-300 rounded-lg font-medium text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a 
            href={`tel:${phoneNumber}`}
            className="w-full bg-[var(--deep-charcoal)] hover:bg-[var(--espresso)] text-white py-2.5 px-4 text-xs uppercase tracking-wider transition-all duration-300 rounded-lg font-medium text-center"
          >
            Call Us
          </a>
        </div>
      </div>
    </div>
  );
}