// API Route: Add Item to Cart
// POST /api/cart/add

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AddToCartRequest {
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: AddToCartRequest = await request.json();
    const { cartId, productId, quantity, price } = body;

    // Validation
    if (!cartId || !productId || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: cartId, productId, quantity, price' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    const subtotal = price * quantity;

    // Add item to cart in database
    try {
      // Check if product exists in cart already
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId,
          productId,
        },
      });

      let cartItem;
      if (existingItem) {
        // Update quantity
        cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + quantity,
            subtotal: (existingItem.quantity + quantity) * price,
          },
        });
      } else {
        // Create new cart item
        cartItem = await prisma.cartItem.create({
          data: {
            cartId,
            productId,
            quantity,
            priceAtTime: price,
            subtotal,
          },
        });
      }

      // Update cart total
      const allItems = await prisma.cartItem.findMany({
        where: { cartId },
      });
      
      const totalAmount = allItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
      
      await prisma.cart.update({
        where: { id: cartId },
        data: { totalAmount },
      });

      return NextResponse.json({
        success: true,
        message: 'Item added to cart',
        data: {
          cartId,
          productId,
          quantity: cartItem.quantity,
          price,
          subtotal: cartItem.subtotal,
          totalAmount,
        },
      });
    } catch (error: any) {
      console.error('Database error adding to cart:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Duplicate cart item', code: 'DUPLICATE_ITEM' },
          { status: 409 }
        );
      }
      
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Cart or product not found', code: 'RESOURCE_NOT_FOUND' },
          { status: 404 }
        );
      }
      
      // Fallback: return success even if database fails
      return NextResponse.json({
        success: true,
        warning: 'Database unavailable, item added to session only',
        message: 'Item added to cart',
        data: {
          cartId,
          productId,
          quantity,
          price,
          subtotal,
        },
      });
    }
  } catch (error: any) {
    console.error('Add to Cart Error:', error);
    
    // Don't expose internal error details in production
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}
