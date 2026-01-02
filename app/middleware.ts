import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (for production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

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

  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const clientIP = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const key = `${clientIP}_${request.method}_${request.nextUrl.pathname}`;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.windowMs;

    // Get or create rate limit entry
    let rateLimitEntry = rateLimitMap.get(key);
    
    if (!rateLimitEntry || rateLimitEntry.resetTime < now) {
      // Reset rate limit
      rateLimitEntry = {
        count: 1,
        resetTime: now + RATE_LIMIT.windowMs,
      };
      rateLimitMap.set(key, rateLimitEntry);
    } else {
      // Increment count
      rateLimitEntry.count++;
      
      if (rateLimitEntry.count > RATE_LIMIT.requests) {
        // Rate limit exceeded
        return new NextResponse('Rate limit exceeded', {
          status: 429,
          headers: {
            'Retry-After': Math.floor(RATE_LIMIT.windowMs / 1000).toString(),
          },
        });
      }
    }

    // Clean up old entries periodically (only if map is getting large)
    if (rateLimitMap.size > 10000) {
      for (const [key, entry] of rateLimitMap.entries()) {
        if (entry.resetTime < now) {
          rateLimitMap.delete(key);
        }
      }
    }
  }

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