// Helper: Install required npm packages
// Run: npm install @prisma/client @supabase/supabase-js prisma

/**
 * INSTALLATION INSTRUCTIONS:
 * 
 * 1. Install all backend dependencies:
 *    npm install @prisma/client @supabase/supabase-js prisma
 * 
 * 2. Set up Prisma:
 *    npx prisma generate
 *    npx prisma db push (when database is configured)
 * 
 * 3. Copy .env.local.example to .env.local and fill in credentials
 * 
 * 4. Test API endpoints:
 *    - POST /api/cart/create
 *    - POST /api/cart/add
 *    - POST /api/cart/checkout
 *    - POST /api/payment/initiate
 *    - GET /api/payment/status?orderId=QB-123456
 *    - POST /api/payment/webhook (for Selcom)
 *    - POST /api/calendly/webhook (for Calendly)
 */

export {};
