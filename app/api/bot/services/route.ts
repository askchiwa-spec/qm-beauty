import { NextRequest, NextResponse } from 'next/server';

const BOT_API_KEY = process.env.BOT_API_KEY || 'qm-bot-secret-key';

// Services — pricing is personalised and confirmed by the team
const services = [
  { id: '1',  name: 'Japanese Head Spa Treatment',       duration: '90 minutes',  category: 'Spa',      description: 'Scalp massage, deep cleansing and nourishing treatment for relaxation and healthy hair growth.' },
  { id: '2',  name: 'Luxury Facial Treatment',           duration: '75 minutes',  category: 'Face',     description: 'Deep cleansing, exfoliation and hydration using QM Beauty natural products for glowing skin.' },
  { id: '3',  name: 'Full Body Massage',                 duration: '120 minutes', category: 'Spa',      description: 'Therapeutic massage using natural oils to relieve tension and improve circulation.' },
  { id: '4',  name: 'QM Waxing',                         duration: '45 minutes',  category: 'Waxing',   description: 'Professional waxing service for long-lasting smooth skin.' },
  { id: '5',  name: 'QM Full Body Coffee Scrub',         duration: '60 minutes',  category: 'Spa',      description: 'Deep exfoliation treatment using coffee, honey and turmeric for smooth, glowing skin.' },
  { id: '6',  name: 'Hair Treatments & Relaxer',         duration: '90 minutes',  category: 'Hair',     description: 'Professional hair treatment and relaxer to strengthen and nourish your hair.' },
  { id: '7',  name: 'Hair Braiding',                     duration: '180 minutes', category: 'Hair',     description: 'Professional hair braiding for stylish and protective styling.' },
  { id: '8',  name: 'Hair Plaiting',                     duration: '150 minutes', category: 'Hair',     description: 'Professional hair plaiting service for neat and stylish looks.' },
  { id: '9',  name: 'Nails (Manicure & Pedicure)',       duration: '75 minutes',  category: 'Nails',    description: 'Professional nail care service including manicure and pedicure.' },
  { id: '10', name: 'Make Up',                           duration: '60 minutes',  category: 'Beauty',   description: 'Professional makeup application for special occasions and events.' },
  { id: '11', name: 'Heena',                             duration: '90 minutes',  category: 'Beauty',   description: 'Professional henna art service for beautiful designs on special occasions.' },
  { id: '12', name: 'Foot Massage',                      duration: '45 minutes',  category: 'Spa',      description: 'Relaxing foot massage to soothe tired and achy feet.' },
  { id: '13', name: 'Eyebrows / Upper Lip / Chin Threading', duration: '30 minutes', category: 'Beauty', description: 'Precision threading service for eyebrows, upper lip and chin.' },
  { id: '14', name: 'Special Packages',                  duration: 'Varies',      category: 'Spa',      description: 'Customized service packages tailored to meet individual needs.' },
];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('x-bot-api-key');
  if (authHeader !== BOT_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(`[BOT API] Services fetched: ${services.length} items`);

  return NextResponse.json({
    success: true,
    count: services.length,
    items: services,
  });
}
