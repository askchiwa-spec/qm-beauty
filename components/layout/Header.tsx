'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/cartContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems, openCart } = useCart();
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];
  
  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-[var(--champagne)] shadow-sm">
      <nav className="w-full flex justify-center px-4">
        <div className="w-full max-w-7xl mx-auto py-4 md:py-5 flex items-center justify-between">
          {/* Elegant Logo - Responsive */}
          <Link href="/" className="flex items-center z-50">
            <div className="text-xl sm:text-2xl font-serif text-[var(--deep-charcoal)] tracking-wide">
              <span className="font-light">QM</span>
              <span className="font-medium ml-1">Beauty</span>
            </div>
          </Link>
          
          {/* Desktop Navigation - Refined with Dividers */}
          <div className="hidden lg:flex items-center">
            {navigation.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <Link
                  href={item.href}
                  className="text-[var(--deep-charcoal)] hover:text-[var(--rose-gold)] transition-colors duration-300 text-sm uppercase tracking-[0.15em] font-light px-5 xl:px-6 py-2"
                >
                  {item.name}
                </Link>
                {index < navigation.length - 1 && (
                  <div className="h-4 w-[1px] bg-[var(--champagne)]"></div>
                )}
              </div>
            ))}
          </div>
          
          {/* Cart & Mobile Menu Button - Touch-friendly */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Elegant Cart Icon - Responsive */}
            <button
              onClick={openCart}
              className="relative group min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Shopping cart"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--deep-charcoal)] group-hover:text-[var(--rose-gold)] transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--rose-gold)] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                  {getTotalItems()}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Button - Touch-friendly */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className="w-6 h-6 text-[var(--deep-charcoal)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu - Elegant & Touch-friendly */}
        {isMenuOpen && (
          <div className="lg:hidden mt-6 py-6 border-t border-[var(--champagne)] animate-fade-in">
            <div className="flex flex-col space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-4 px-3 text-[var(--deep-charcoal)] hover:text-[var(--rose-gold)] hover:bg-[var(--pearl-white)] transition-all duration-200 text-sm uppercase tracking-[0.15em] font-light rounded-sm min-h-[44px] flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
