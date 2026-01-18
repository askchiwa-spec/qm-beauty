import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--sage-green)] hover:bg-[var(--forest-green)] text-white shadow-md hover:shadow-lg',
    secondary: 'bg-[var(--terracotta)] hover:bg-[var(--honey-gold)] text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-[var(--sage-green)] text-[var(--sage-green)] hover:bg-[var(--sage-green)] hover:text-white',
    ghost: 'text-[var(--charcoal)] hover:bg-[var(--soft-beige)]'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
