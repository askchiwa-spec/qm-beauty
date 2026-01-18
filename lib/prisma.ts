import { PrismaClient } from '@prisma/client';

// PrismaClient singleton for Next.js
// Prevents multiple instances in development (hot reload)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test', // Fallback URL for build
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to handle Prisma errors
export const handlePrismaError = (error: any) => {
  console.error('Prisma Error:', error);

  // Prisma-specific error codes
  if (error.code === 'P2002') {
    return {
      success: false,
      error: 'A record with this information already exists.',
      code: 'DUPLICATE_ENTRY',
    };
  }

  if (error.code === 'P2025') {
    return {
      success: false,
      error: 'Record not found.',
      code: 'NOT_FOUND',
    };
  }

  if (error.code === 'P2003') {
    return {
      success: false,
      error: 'Related record not found.',
      code: 'FOREIGN_KEY_ERROR',
    };
  }

  return {
    success: false,
    error: error.message || 'A database error occurred',
    code: error.code || 'DATABASE_ERROR',
  };
};

// Utility: Generate order code (QB-XXXXXX)
export const generateOrderCode = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `QB-${random}`;
};

// Utility: Tanzania phone number validator
export const validateTanzaniaPhone = (phone: string): boolean => {
  // Remove spaces, dashes, and plus signs
  const cleaned = phone.replace(/[\s\-+]/g, '');
  
  // Must start with 255 (country code) or 0
  // Valid formats: +255715123456, 255715123456, 0715123456
  const regex = /^(255|0)[67]\d{8}$/;
  return regex.test(cleaned);
};

// Utility: Format Tanzania phone to international format
export const formatTanzaniaPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  
  if (cleaned.startsWith('255')) {
    return `+${cleaned}`;
  }
  
  if (cleaned.startsWith('0')) {
    return `+255${cleaned.substring(1)}`;
  }
  
  return `+255${cleaned}`;
};
