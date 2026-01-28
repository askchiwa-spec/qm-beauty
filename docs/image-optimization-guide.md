# Image Optimization Guide for QM Beauty

## Implemented Optimizations

### 1. Custom OptimizedImage Component
- **Location**: `components/ImageOptimized.tsx`
- **Features**:
  - Automatic loading skeletons
  - Error fallbacks
  - Progressive loading with opacity transitions
  - Built-in lazy loading
  - WebP/AVIF format support

### 2. Image Optimization Utilities
- **Location**: `lib/image-optimization.ts`
- **Features**:
  - Quality presets (HIGH: 90, MEDIUM: 75, LOW: 60, THUMBNAIL: 50)
  - Responsive size configurations
  - Batch optimization functions
  - Preload image management

### 3. Next.js Configuration
- **Location**: `next.config.ts`
- **Settings**:
  - WebP and AVIF format support
  - Optimized device sizes
  - Proper cache TTL (1 week)
  - Responsive image sizes

## Quick Wins for Better Performance

### 1. Compress Existing Images
```bash
# Use Squoosh CLI or online tools to compress images
# Target reductions:
# - JPEG: 60-80% size reduction
# - PNG: 40-60% size reduction
# - Convert to WebP for 25-35% additional savings
```

### 2. Implement Lazy Loading
Already implemented in OptimizedImage component with:
- `loading="lazy"` for non-critical images
- `priority` prop for above-the-fold images
- Intersection Observer for custom lazy loading

### 3. Use Proper Image Dimensions
```tsx
// Good - specify exact dimensions
<OptimizedImage 
  src="/images/product.jpg" 
  width={300} 
  height={200} 
  quality="MEDIUM"
/>

// Better - let component handle responsive sizing
<OptimizedImage 
  src="/images/product.jpg" 
  fill  // For container-constrained images
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 4. Critical Images to Preload
Add important images to `PRELOAD_IMAGES` array in `lib/image-optimization.ts`:
- Hero images
- Logo
- Primary product images
- Key service images

## Performance Monitoring

### Check Image Performance:
1. **Chrome DevTools** → Network tab → Filter by Img
2. **Lighthouse** → Performance audit → Opportunities section
3. **WebPageTest** → Detailed waterfall charts

### Key Metrics to Monitor:
- **First Contentful Paint (FCP)**: Should be < 1.8s
- **Largest Contentful Paint (LCP)**: Should be < 2.5s
- **Cumulative Layout Shift (CLS)**: Should be < 0.1
- **Total Blocking Time (TBT)**: Should be < 200ms

## Advanced Optimizations

### 1. Image CDNs
Consider implementing:
- **Cloudinary**: Advanced transformations and delivery
- **Imgix**: Real-time image processing
- **AWS CloudFront**: Simple CDN with S3

### 2. Next-Gen Formats
```tsx
// Next.js automatically serves WebP/AVIF to supporting browsers
// Your current config already enables this:
formats: ['image/webp', 'image/avif']
```

### 3. Blur-Up Technique
```tsx
// For hero images, consider using low-quality image placeholders
<OptimizedImage
  src="/images/hero.jpg"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  priority
/>
```

## Migration Steps

### 1. Update Components
Replace existing `Image` components with `OptimizedImage`:
```tsx
// Before
<Image src="/path" width={300} height={200} />

// After  
<OptimizedImage src="/path" width={300} height={200} quality="MEDIUM" />
```

### 2. Configure Quality Levels
Use appropriate quality settings:
- **Hero images**: HIGH (90)
- **Product grids**: MEDIUM (75)  
- **Thumbnails**: THUMBNAIL (50)
- **Backgrounds**: LOW (60)

### 3. Monitor Results
Track performance improvements:
- Page load times
- Image bytes downloaded
- Core Web Vitals scores
- Mobile performance

## Troubleshooting

### Common Issues:

1. **Images not loading**: Check file paths and CORS settings
2. **Poor quality**: Increase quality setting or check original image quality
3. **Large file sizes**: Compress original images before upload
4. **Layout shift**: Always specify width/height or use fill with proper container sizing

The optimizations implemented should significantly improve your website's loading performance while maintaining image quality.