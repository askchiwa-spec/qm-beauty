'use client';

import { useEffect } from 'react';

// Critical images to preload on initial load
const CRITICAL_IMAGES = [
  '/images/hero/home-hero.png',
  '/images/logo/logo.png',
];

export default function ImagePreloader() {
  useEffect(() => {
    // Preload critical images
    CRITICAL_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null;
}
