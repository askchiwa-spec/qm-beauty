import { NextRequest, NextResponse } from 'next/server';

const BOT_API_KEY = process.env.BOT_API_KEY || 'dev-key-change-in-production';

// Services are hardcoded to match website
const services = [
  { 
    id: '1',
    name: 'Facial Treatments', 
    duration: '60-90 min', 
    price: 50000,
    priceFormatted: '50,000 TZS',
    category: 'Face',
    description: 'Deep cleansing and rejuvenating facial treatments'
  },
  { 
    id: '2',
    name: 'Hair Styling & Treatment', 
    duration: '60-120 min', 
    price: 40000,
    priceFormatted: '40,000 TZS',
    category: 'Hair',
    description: 'Professional hair styling and nourishing treatments'
  },
  { 
    id: '3',
    name: 'Nail Care', 
    duration: '30-60 min', 
    price: 25000,
    priceFormatted: '25,000 TZS',
    category: 'Nails',
    description: 'Manicure and pedicure services'
  },
  { 
    id: '4',
    name: 'Waxing Services', 
    duration: '30-90 min', 
    price: 30000,
    priceFormatted: '30,000 TZS',
    category: 'Waxing',
    description: 'Full body waxing services'
  },
  { 
    id: '5',
    name: 'Massage Therapy', 
    duration: '60-90 min', 
    price: 60000,
    priceFormatted: '60,000 TZS',
    category: 'Massage',
    description: 'Relaxing and therapeutic massage'
  }
];

export async function GET(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get('x-bot-api-key');
  if (authHeader !== BOT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log([BOT API] Services fetched:  items);

  return NextResponse.json({
    success: true,
    count: services.length,
    services
  });
}
