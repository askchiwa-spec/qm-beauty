/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Disable image optimization completely
  images: {
    unoptimized: true,  // This bypasses the entire _next/image pipeline
  },
  output: 'standalone',
  reactStrictMode: false,  // Reduce strictness for stability
};

module.exports = nextConfig;
