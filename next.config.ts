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
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Exclude venom-bot from client-side bundles
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle venom-bot on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        'node-gyp': false,
      };
    }
    return config;
  },
  // Exclude API routes that use venom-bot from static generation
  output: 'standalone',
};

export default nextConfig;
