import { NextRequest, NextResponse } from 'next/server';

// Import rate limiter
import { apiRateLimiter } from '@/lib/rate-limiter';
// Import CORS handler
import { applyCorsHeaders } from '@/lib/cors';
// Import CSRF protection
import { validateCsrfInApiRoute } from '@/lib/csrf';

// Rate limiting configuration
const RATE_LIMIT = {
  requests: 100,    // requests per window
  windowMs: 15 * 60 * 1000, // 15 minutes
};

// Security headers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export function middleware(request: NextRequest) {
  // Apply security headers
  const response = NextResponse.next();
  
  // Add security headers to all responses
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CORS headers
  const origin = request.headers.get('origin');
  const corsHeaders = applyCorsHeaders(origin || undefined);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResult = apiRateLimiter.checkAndRespond(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }

  // Import CSRF protection
import { validateCsrfInApiRoute } from '@/lib/csrf';

// Additional security checks
  const userAgent = request.headers.get('user-agent') || '';
  
  // Block common malicious user agents
  const blockedUserAgents = [
    'sqlmap',
    'nmap',
    'nikto',
    'dirb',
    'dirbuster',
    'gobuster',
    'w3af',
    'acunetix',
    'nessus',
    'netsparker',
  ];
  
  if (blockedUserAgents.some(ua => userAgent.toLowerCase().includes(ua))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Block requests with suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'x-originating-ip',
    'x-remote-ip',
    'x-remote-addr',
  ];
  
  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header);
    if (value && value.split(',').length > 5) {
      // Too many IP addresses in forwarded headers - potential spoofing
      return new NextResponse('Bad Request', { status: 400 });
    }
  }

  return response;
}

// Apply middleware to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-data' },
      ],
    },
    {
      source: '/api/:path*',
    },
  ],
};