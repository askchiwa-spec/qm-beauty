/**
 * CORS Configuration for QM Beauty Application
 */

export interface CorsOptions {
  origin: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

class CorsHandler {
  private options: CorsOptions;

  constructor(options: CorsOptions = { origin: '*' }) {
    this.options = {
      origin: options.origin || '*',
      methods: options.methods || ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      allowedHeaders: options.allowedHeaders || [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-CSRF-Token'
      ],
      exposedHeaders: options.exposedHeaders || [],
      credentials: options.credentials || false,
      maxAge: options.maxAge || 86400, // 24 hours
    };
  }

  public setCorsHeaders(requestOrigin?: string): Record<string, string> {
    const headers: Record<string, string> = {};

    // Handle origin
    if (this.options.origin === true) {
      headers['Access-Control-Allow-Origin'] = '*';
    } else if (this.options.origin === false) {
      headers['Access-Control-Allow-Origin'] = 'null';
    } else if (typeof this.options.origin === 'string') {
      headers['Access-Control-Allow-Origin'] = this.options.origin;
    } else if (Array.isArray(this.options.origin)) {
      if (requestOrigin && this.options.origin.includes(requestOrigin)) {
        headers['Access-Control-Allow-Origin'] = requestOrigin;
      } else {
        // If origin is not in allowed list, use first allowed origin as default
        headers['Access-Control-Allow-Origin'] = this.options.origin[0] || '*';
      }
    }

    // Other CORS headers
    headers['Access-Control-Allow-Methods'] = this.options.methods!.join(', ');
    headers['Access-Control-Allow-Headers'] = this.options.allowedHeaders!.join(', ');
    
    if (this.options.exposedHeaders && this.options.exposedHeaders.length > 0) {
      headers['Access-Control-Expose-Headers'] = this.options.exposedHeaders.join(', ');
    }
    
    if (this.options.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
    
    if (this.options.maxAge) {
      headers['Access-Control-Max-Age'] = this.options.maxAge.toString();
    }

    return headers;
  }

  public isOriginAllowed(origin: string): boolean {
    if (this.options.origin === true) {
      return true;
    }
    
    if (this.options.origin === false) {
      return false;
    }
    
    if (typeof this.options.origin === 'string') {
      return origin === this.options.origin;
    }
    
    if (Array.isArray(this.options.origin)) {
      return this.options.origin.includes(origin);
    }
    
    return false;
  }
}

// Default CORS configuration for production and development
const PRODUCTION_CORS_OPTIONS: CorsOptions = {
  origin: (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') 
    ? ['https://qmbeauty.vercel.app', 'https://qmbeauty.co.tz', 'http://localhost:3000', 'http://localhost:3001']
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-Client-Version',
    'X-App-Source'
  ],
  credentials: true,
  maxAge: 86400,
};

export const corsHandler = new CorsHandler(PRODUCTION_CORS_OPTIONS);

// CORS middleware for Next.js API routes
export function applyCorsHeaders(requestOrigin?: string) {
  return corsHandler.setCorsHeaders(requestOrigin);
}

// Check if origin is allowed
export function isOriginAllowed(origin: string) {
  return corsHandler.isOriginAllowed(origin);
}