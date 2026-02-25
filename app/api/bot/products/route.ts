import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BOT_API_KEY = process.env.BOT_API_KEY || 'dev-key-change-in-production';

export async function GET(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get('x-bot-api-key');
  if (authHeader !== BOT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const products = await prisma.product.findMany({
      where: {
        status: status,
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        description: true,
        slug: true,
        inStock: true,
        stock: true,
        imageUrl: true,
      }
    });

    console.log([BOT API] Products fetched:  items);

    return NextResponse.json({
      success: true,
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        shortDescription: p.description ? p.description.substring(0, 100) : '',
        image: p.imageUrl,
        availability: p.inStock ? 'in stock' : 'out of stock',
        slug: p.slug,
      }))
    });
  } catch (error) {
    console.error('[BOT API] Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
