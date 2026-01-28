'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fill?: boolean;
  onLoad?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  onLoad
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Skip optimization for data URLs or if explicitly disabled
  if (src.startsWith('data:') || src.includes('unoptimized=true')) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setHasError(true)}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
      />
    );
  }

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse rounded-lg ${
          fill ? 'w-full h-full' : ''
        } ${className}`} />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${
          fill ? 'w-full h-full' : 'w-full'
        } ${className}`}>
          <div className="text-center p-4">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm text-gray-500">{alt}</div>
          </div>
        </div>
      )}

      {/* Optimized Next.js Image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        quality={quality}
        sizes={sizes}
        fill={fill}
        onLoadingComplete={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        unoptimized={false}
      />
    </div>
  );
}