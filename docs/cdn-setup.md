# CDN Setup Guide

This document outlines how to set up a Content Delivery Network (CDN) for the QM Beauty application to improve performance and global accessibility.

## Why Use a CDN?

CDNs provide several benefits for the QM Beauty application:
- Faster image loading for customers in Tanzania and globally
- Reduced bandwidth costs on origin servers
- Improved site performance and SEO rankings
- Better resilience and availability
- Protection against traffic spikes

## CDN Options

### 1. Cloudinary (Recommended)
Cloudinary offers excellent image optimization features:
- Automatic format selection (WebP, AVIF)
- Dynamic image transformations
- Built-in optimization algorithms
- Good integration with Next.js

### 2. AWS CloudFront
Amazon's CDN service with tight integration with S3:
- Cost-effective for large volumes
- Global edge locations
- Custom domain support
- SSL certificate management

### 3. Imgix
Professional image processing CDN:
- Real-time image manipulation
- Advanced compression
- Analytics and insights
- Responsive image generation

## Implementation Steps

### Option 1: Cloudinary Setup

1. Create a Cloudinary account at cloudinary.com
2. Get your cloud name, API key, and API secret
3. Update your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Update `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'your-domain.s3.amazonaws.com', // if using S3 as origin
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
```

5. Create a Cloudinary upload utility:

```ts
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
```

### Option 2: AWS CloudFront with S3

1. Create an S3 bucket for storing images
2. Set up CloudFront distribution pointing to S3 bucket
3. Configure the bucket policy to allow CloudFront access
4. Update `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    loader: 'custom',
    loaderFile: './lib/image-loader.ts', // Custom loader implementation
    path: 'https://your-cloudfront-domain.cloudfront.net/',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cloudfront-domain.cloudfront.net',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
```

Create the custom image loader:

```ts
// lib/image-loader.ts
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return `https://your-cloudfront-domain.cloudfront.net/${src}?w=${width}&q=${quality || 75}`;
}
```

## Image Upload Process

### Direct-to-CDN Upload (Recommended)

For optimal performance, implement direct-to-CDN uploads from the client-side:

```ts
// utils/upload-image.ts
export const uploadImageToCDN = async (file: File, folder: string = 'qm-beauty'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url;
};
```

## Performance Optimization Tips

### 1. Image Transformation Parameters

Use transformation parameters for dynamic optimization:

```ts
// Example transformation URL
const transformImage = (publicId: string, transformations: string[]) => {
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations.join(',')}/${publicId}`;
};

// Usage
const optimizedUrl = transformImage('product/image-id', [
  'f_auto', // Auto format
  'q_auto', // Auto quality
  'c_limit', // Limit cropping
  `w_${width}`, // Width
  `h_${height}`, // Height
]);
```

### 2. Caching Headers

Configure appropriate caching headers in your CDN:
- HTML files: 1-5 minutes (for dynamic content)
- Static assets (JS, CSS): 1 year with fingerprinting
- Images: 1 month with proper cache invalidation

### 3. Responsive Images

Ensure your responsive image implementation works with the CDN:

```tsx
<Image
  src={imageUrl}
  alt="Product image"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  placeholder="blur" // Use blur-up effect
  blurDataURL="data:image/jpeg;base64,..." // Base64 placeholder
/>
```

## Monitoring and Analytics

### Performance Metrics
- Time to first byte (TTFB) for images
- Cache hit ratio
- Page load times across different geographic regions
- Bandwidth savings

### Tools for Monitoring
- Google PageSpeed Insights
- WebPageTest
- GTmetrix
- Your CDN's built-in analytics dashboard

## Security Considerations

### 1. Secure Image Uploads
- Validate file types and sizes on both client and server
- Sanitize uploaded files
- Use signed uploads for authenticated access

### 2. Access Control
- Restrict direct access to original images
- Use signed URLs for private content
- Implement rate limiting

### 3. Data Privacy
- Ensure compliance with privacy regulations
- Secure image metadata
- Regular security audits

## Deployment Checklist

- [ ] Update environment variables with CDN credentials
- [ ] Test image loading from CDN
- [ ] Verify responsive image functionality
- [ ] Check fallback mechanisms
- [ ] Monitor performance metrics
- [ ] Set up error monitoring for image loading failures
- [ ] Configure cache invalidation procedures
- [ ] Document the CDN setup for team members

## Troubleshooting

### Common Issues:
1. **Images not loading**: Check CORS settings and domain restrictions
2. **Poor performance**: Verify image optimization settings
3. **Incorrect sizing**: Ensure responsive image attributes are correct
4. **SSL errors**: Confirm SSL certificate setup for custom domains

### Debugging Steps:
1. Check browser network tab for failed image requests
2. Verify CDN configuration and DNS settings
3. Test image URLs directly in browser
4. Review CDN logs for access patterns