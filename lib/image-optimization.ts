/**
 * Image optimization utilities for QM Beauty
 */

// Image quality presets
export const IMAGE_QUALITY = {
  HIGH: 90,      // Hero images, main product shots
  MEDIUM: 75,    // Standard product images, thumbnails
  LOW: 60,       // Background images, decorative elements
  THUMBNAIL: 50  // Very small images, icons
} as const;

// Common image sizes for responsive design
export const IMAGE_SIZES = {
  HERO: '100vw',
  PRODUCT_GRID: '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
  PRODUCT_DETAIL: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  SERVICE_CARD: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  BLOG_THUMBNAIL: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
} as const;

// Preload important images
export const PRELOAD_IMAGES = [
  '/images/hero/home-hero.png',
  // Add other critical images here
];

// Lazy loading configuration
export const LAZY_LOADING_CONFIG = {
  rootMargin: '50px',  // Load images when they're 50px away from viewport
  threshold: 0.1       // Trigger when 10% of image is visible
};

// Image optimization settings
export const OPTIMIZATION_SETTINGS = {
  // Enable WebP and AVIF formats for modern browsers
  formats: ['image/webp', 'image/avif'],
  
  // Device breakpoints for responsive images
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  
  // Image sizes for different use cases
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  
  // Cache time for optimized images (in seconds)
  minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
  
  // Maximum image dimension
  maximumImageDimension: 4000
};

// Utility functions
export function getImageProps(imagePath: string, quality: keyof typeof IMAGE_QUALITY = 'MEDIUM') {
  return {
    src: imagePath,
    quality: IMAGE_QUALITY[quality],
    sizes: getImageSizes(imagePath),
    loading: 'lazy' as const,
    placeholder: 'blur' as const
  };
}

export function getImageSizes(imagePath: string): string {
  if (imagePath.includes('hero')) return IMAGE_SIZES.HERO;
  if (imagePath.includes('product')) return IMAGE_SIZES.PRODUCT_GRID;
  if (imagePath.includes('service')) return IMAGE_SIZES.SERVICE_CARD;
  if (imagePath.includes('blog')) return IMAGE_SIZES.BLOG_THUMBNAIL;
  return IMAGE_SIZES.PRODUCT_DETAIL;
}

// Batch optimization function for multiple images
export function optimizeImages(images: string[], quality: keyof typeof IMAGE_QUALITY = 'MEDIUM') {
  return images.map(image => ({
    ...getImageProps(image, quality),
    key: image
  }));
}

// Check if image should be preloaded
export function shouldPreloadImage(imagePath: string): boolean {
  return PRELOAD_IMAGES.some(preloadPath => imagePath.includes(preloadPath));
}