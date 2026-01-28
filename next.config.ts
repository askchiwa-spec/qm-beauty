import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack to avoid WASM binding issues
  reactStrictMode: false, // This helps with hydration issues
  images: {
    // Enable image optimization
    unoptimized: false,
    // Allow images from these domains
    remotePatterns: [],
    // Image formats
    formats: ['image/webp', 'image/avif'],
    // Quality settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
