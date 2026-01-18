# Image Optimization Strategy

This document outlines the image optimization strategy implemented for the QM Beauty application to improve performance and user experience.

## Current Image Implementation

The application currently uses Next.js `<Image>` component for image optimization with:
- Responsive sizing using `sizes` attribute
- Proper `alt` tags for accessibility
- Fill/contain strategies based on use case
- Fallback placeholders for failed loads

## Recommended Image Optimization Techniques

### 1. Lazy Loading
All images in the application already use Next.js automatic lazy loading, which loads images as they enter the viewport.

### 2. Image Formats
- Use WebP format when possible for better compression
- Fallback to JPEG/PNG for browsers that don't support WebP
- Consider AVIF for next-generation compression (where supported)

### 3. Responsive Images
The application already implements responsive images with proper `sizes` attributes:
- `(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw` for product cards
- `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw` for product detail pages

### 4. Image Dimensions
Images have fixed dimensions specified to prevent layout shift:
- Product cards: `width={300} height={300}` or fill with container
- Product detail: `width={600} height={600}` for main images

### 5. CDN Strategy
For production deployment:
- Upload images to a CDN like Cloudinary, Imgix, or AWS CloudFront
- Configure Next.js to serve images from the CDN:

```js
// next.config.js
module.exports = {
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cdn-domain.com',
      },
    ],
  },
};
```

### 6. Image Compression Settings
Configure image optimization in next.config.js:

```js
// next.config.js
module.exports = {
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "script-src 'none'; frame-src 'none';",
  },
};
```

### 7. Preload Critical Images
For critical images (like hero images), preload them:

```jsx
import Head from 'next/head';

// In your component
<Head>
  <link rel="preload" as="image" href="/images/hero/main-hero.jpg" />
</Head>
```

### 8. Progressive Image Loading
For large images, implement progressive loading with blur-up effect using base64 placeholders.

### 9. Image Metadata Optimization
- Remove EXIF data to reduce file size
- Optimize SVGs by removing unnecessary metadata
- Use proper image dimensions (avoid scaling in browser)

## Implementation Plan

### Immediate Actions:
1. Ensure all images have proper dimensions specified
2. Implement WebP/JPEG fallbacks where needed
3. Set up CDN configuration for production

### Future Enhancements:
1. Implement progressive image loading
2. Add image lazy loading with intersection observer for custom components
3. Consider using a service worker for image caching
4. Implement image optimization pipeline in build process

## Performance Monitoring

Monitor Core Web Vitals, especially:
- Largest Contentful Paint (LCP) - images contribute significantly
- Cumulative Layout Shift (CLS) - proper dimensions prevent shifts
- First Input Delay (FID) - optimized images reduce render-blocking

## Image Best Practices

1. **Size Appropriately**: Match image resolution to display size
2. **Format Selection**: WebP for photos, SVG for icons/logos
3. **Compression**: Balance quality vs. file size
4. **Accessibility**: Always include descriptive alt text
5. **Performance**: Use responsive images with correct sizes attribute