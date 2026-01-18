import { prisma } from '@/lib/prisma';

describe('Prisma Client', () => {
  it('should connect to the database', async () => {
    expect(prisma).toBeDefined();
    
    // Test connection by fetching a simple record
    const userCount = await prisma.user.count();
    expect(typeof userCount).toBe('number');
  });

  it('should have handlePrismaError function', () => {
    const { handlePrismaError } = require('@/lib/prisma');
    expect(handlePrismaError).toBeDefined();
  });

  it('should generate order codes correctly', () => {
    const { generateOrderCode } = require('@/lib/prisma');
    const orderCode = generateOrderCode();
    
    expect(orderCode).toMatch(/^QB-\d{6}$/);
  });

  it('should validate Tanzania phone numbers correctly', () => {
    const { validateTanzaniaPhone } = require('@/lib/prisma');
    
    expect(validateTanzaniaPhone('+255715123456')).toBe(true);
    expect(validateTanzaniaPhone('255715123456')).toBe(true);
    expect(validateTanzaniaPhone('0715123456')).toBe(true);
    expect(validateTanzaniaPhone('invalid')).toBe(false);
  });

  it('should format Tanzania phone numbers correctly', () => {
    const { formatTanzaniaPhone } = require('@/lib/prisma');
    
    expect(formatTanzaniaPhone('+255715123456')).toBe('+255715123456');
    expect(formatTanzaniaPhone('255715123456')).toBe('+255715123456');
    expect(formatTanzaniaPhone('0715123456')).toBe('+255715123456');
  });
});