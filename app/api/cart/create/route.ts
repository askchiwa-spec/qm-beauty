// API Route: Create or Get Cart
// POST /api/cart/create

import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId } = body;

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'Session ID or User ID required' },
        { status: 400 }
      );
    }

    // Create cart in database
    try {
      const cart = await prisma.cart.create({
        data: {
          userId: userId || null,
          sessionId: sessionId || null,
          totalAmount: 0,
          status: 'active',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          cartId: cart.id,
          sessionId: cart.sessionId,
          userId: cart.userId,
          items: [],
          totalAmount: cart.totalAmount,
          status: cart.status,
          createdAt: cart.createdAt.toISOString(),
        },
      });
    } catch (error: any) {
      // If database fails, return in-memory cart
      console.error('Database error, using in-memory cart:', error);
      const fallbackCartId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json({
        success: true,
        warning: 'Database unavailable, using temporary cart',
        data: {
          cartId: fallbackCartId,
          sessionId,
          userId: userId || null,
          items: [],
          totalAmount: 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      });
    }
  } catch (error: any) {
    console.error('Create Cart Error:', error);
    return NextResponse.json(
      { error: 'Failed to create cart', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId && !userId) {
      return NextResponse.json(
        { error: 'Session ID or User ID required' },
        { status: 400 }
      );
    }

    // Fetch cart from database
    try {
      const cart = await prisma.cart.findFirst({
        where: {
          OR: [
            sessionId ? { sessionId } : {},
            userId ? { userId } : {},
          ],
          status: 'active',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        return NextResponse.json({
          success: true,
          data: {
            cartId: null,
            items: [],
            totalAmount: 0,
            status: 'empty',
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          cartId: cart.id,
          items: cart.items.map(item => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            quantity: item.quantity,
            price: item.priceAtTime,
            subtotal: item.subtotal,
          })),
          totalAmount: cart.totalAmount,
          status: cart.status,
        },
      });
    } catch (error: any) {
      console.error('Database error fetching cart:', error);
      // Return empty cart if database fails
      return NextResponse.json({
        success: true,
        warning: 'Database unavailable',
        data: {
          cartId: null,
          items: [],
          totalAmount: 0,
          status: 'active',
        },
      });
    }
  } catch (error: any) {
    console.error('Get Cart Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: error.message },
      { status: 500 }
    );
  }
}
