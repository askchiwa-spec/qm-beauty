import { Product, Service, Testimonial } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Natural Coffee Scrub',
    slug: 'natural-coffee-scrub',
    price: 20000,
    category: 'skincare',
    image: '/images/products/coffee-scrub.png',
    images: ['/images/products/coffee-scrub.png'],
    shortDescription: 'Reveal glowing, soft, and youthful skin—a powerhouse of Arabica coffee, honey, and turmeric!',
    description: 'Transform your skincare routine with the QM Beauty Natural Coffee Scrub. Crafted from premium Arabica coffee, nourishing honey, and rejuvenating turmeric, this scrub deeply exfoliates to remove dead skin cells, clears acne, and diminishes signs of aging. Beyond skincare, it doubles as a scalp treatment, effectively combating dandruff and invigorating your hair.',
    ingredients: ['Natural Arabica Coffee', 'Natural Honey', 'Turmeric'],
    benefits: [
      'Skin moisturizer',
      'Protection against UV light',
      'Acne-clearing and anti-aging',
      'Anti-bacterial action',
      'Brightens the skin',
      'Anti-dandruff effects',
      'Removes eye dark circles and dead skin'
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Carrots & Turmeric Body Oil',
    slug: 'carrots-turmeric-body-oil',
    price: 20000,
    category: 'skincare',
    image: '/images/products/body-oil.png',
    images: ['/images/products/body-oil.png'],
    shortDescription: 'Experience radiant, hydrated skin—your ultimate skin elixir!',
    description: 'Indulge in the luxurious hydration of QM Beauty Carrots & Turmeric Body Oil. Enriched with carrot oil, coconut oil, turmeric, and essential oils, this body oil soothes sunburn, smoothens wrinkles, and enhances your skin tone. Perfect for deep moisturization.',
    ingredients: ['Carrot Oil', 'Coconut Oil', 'Turmeric', 'Essential Oil'],
    benefits: [
      'Diminishes body wrinkles',
      'Soothes sunburn',
      'Improves skin tone',
      'Maintains healthy skin',
      'Provides deep moisturization',
      'Smoothens the skin'
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Hair Gel',
    slug: 'hair-gel',
    price: 20000,
    category: 'haircare',
    image: '/images/products/hair-gel.png',
    images: ['/images/products/hair-gel.png'],
    shortDescription: 'Style meets care—strengthens, nourishes, and promotes rapid hair growth!',
    description: 'Achieve perfect hair styling with health benefits using QM Beauty Hair Gel. Infused with castor oil, turmeric, and essential oils, this gel not only holds your hairstyle in place but also prevents hair fall, promotes growth, and maintains a healthy scalp. Say goodbye to dandruff and hello to luscious, thick hair!',
    ingredients: ['Castor Oil', 'Turmeric', 'Essential Oil'],
    benefits: [
      'Prevents hair fall',
      'Maintains a healthy scalp',
      'Promotes rapid hair growth',
      'Thickens and strengthens hair',
      'Combats dandruff effectively'
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Virgin Coconut Oil',
    slug: 'virgin-coconut-oil',
    price: 25000,
    category: 'haircare',
    image: '/images/products/hair-oil.png',
    images: ['/images/products/hair-oil.png'],
    shortDescription: 'Unrefined and pure—nourish your beauty naturally.',
    description: 'Discover the unmatched purity of QM Beauty Virgin Coconut Oil. Extracted through cold pressing, this premium oil provides intense hydration, revitalizing your skin and hair. A head-to-toe treatment for a vibrant and moisturized appearance, perfect for everyday care.',
    ingredients: ['Cold Pressed Coconut Oil'],
    benefits: [
      'Comprehensive head-to-toe treatment',
      'Nourished and beautiful skin',
      'Moisturizes scalp and hair',
      'Promotes fresh and vibrant appearance'
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '5',
    name: 'Regular Coconut Oil',
    slug: 'regular-coconut-oil',
    price: 15000,
    category: 'haircare',
    image: '/images/products/hair-oil.png',
    images: ['/images/products/hair-oil.png'],
    shortDescription: 'Head-to-toe hydration—nourish your skin and hair naturally.',
    description: 'QM Beauty Regular Coconut Oil is your all-in-one beauty solution. This lightweight, aromatic oil moisturizes dry skin, nourishes the scalp, and softens hair. Enriched with essential oils, ideal for daily use, giving you a fresh, radiant look effortlessly.',
    ingredients: ['Coconut Oil', 'Essential Oil'],
    benefits: [
      'Ideal head-to-toe treatment',
      'Soft, smooth, and moisturized skin',
      'Nourishes scalp and hair',
      'Fresh and radiant look'
    ],
    inStock: true,
  },
  {
    id: '6',
    name: 'Face Cream',
    slug: 'face-cream',
    price: 25000,
    category: 'skincare',
    image: '/images/products/face-cream.png',
    images: ['/images/products/face-cream.png'],
    shortDescription: 'Brighten your day with radiant skin—reduces spots and enhances complexion.',
    description: 'Transform your skincare game with QM Beauty Face Cream. Formulated with essential oils, licorice, and cucumber, it targets dark spots, reduces acne scars, tightens skin, and lightens your complexion. A must-have for clear, glowing skin!',
    ingredients: ['Water', 'Essential Oil', 'Licorice', 'Cucumber', 'Preservatives'],
    benefits: [
      'Reduces dark spots',
      'Diminishes acne and scars',
      'Tightens the skin',
      'Lightens complexion'
    ],
    inStock: true,
  },
  {
    id: '7',
    name: 'Baby Oil',
    slug: 'baby-oil',
    price: 20000,
    category: 'skincare',
    image: '/images/products/hair-oil.png',
    images: ['/images/products/hair-oil.png'],
    shortDescription: 'Gentle care for delicate skin—soothe, moisturize, and protect with ease.',
    description: 'Pamper your baby with QM Beauty Baby Oil, a blend of coconut oil, turmeric, shea butter, and carrot oil. This nourishing formula smoothens and moisturizes skin, improves skin tone, and maintains healthy hair. Gentle and safe, the perfect choice for your little one.',
    ingredients: ['Coconut Oil', 'Turmeric', 'Essential Oil', 'Shea Butter', 'Carrots'],
    benefits: [
      'Soothes sunburn',
      'Smooth & improves skin tone',
      'Maintains healthy hair and skin',
      'Moisturizes & smoothens skin'
    ],
    inStock: true,
  },
  {
    id: '8',
    name: 'Body Butter',
    slug: 'body-butter',
    price: 100000,
    category: 'skincare',
    image: '/images/products/body-butter.png',
    images: ['/images/products/body-butter.png'],
    shortDescription: 'Luxurious intensive moisturization for radiant, youthful skin.',
    description: 'Indulge in QM Beauty Body Butter, enriched with shea butter, almond oil, carrot oil, and Vitamin E. This rich formula provides intensive moisturization, skin repair, and anti-aging protection for a luxurious, non-greasy glow.',
    ingredients: ['Shea Butter', 'Almond Oil', 'Carrot Oil', 'Mixed Oils', 'Vitamin E'],
    benefits: [
      'Intensive moisturization & long-lasting hydration',
      'Skin repair & anti-aging protection',
      'Soothes inflammation & irritation',
      'Improves skin elasticity & tone',
      'Non-greasy, luxurious glow'
    ],
    inStock: true,
    featured: true,
  },
  {
    id: '9',
    name: 'Petrolatum',
    slug: 'petrolatum',
    price: 15000,
    category: 'skincare',
    image: '/images/products/petrolatum.png',
    images: ['/images/products/petrolatum.png'],
    shortDescription: 'Multi-purpose balm for dry skin, lips, and healing—naturally nourishing.',
    description: 'QM Beauty Petrolatum is a deeply nourishing natural skincare product crafted with coconut oil, essential oils, and Vitamin E. This rich balm relieves dry skin, helps injured skin heal, prevents chaffing, and keeps skin supple. Free from harsh chemicals, a clean beauty staple.',
    ingredients: ['Coconut Oil', 'Essential Oils', 'Vitamin E Oil'],
    benefits: [
      'Relieves dry skin including lips and eyelids',
      'Helps injured skin heal',
      'Prevents chaffing',
      'Treats diaper rash',
      'Rehydrates skin and nails',
      'Keeps skin supple'
    ],
    inStock: true,
  },
];

export const services: Service[] = [
  {
    id: '1',
    name: 'Japanese Head Spa Treatment',
    slug: 'japanese-head-spa',
    description: 'Experience the ultimate relaxation with our signature Japanese Head Spa. This luxurious treatment combines scalp massage, deep cleansing, and nourishing treatments to relieve stress and promote healthy hair growth.',
    duration: '90 minutes',
    price: 80000,
    image: '/services/head-spa.jpg',
    category: 'spa',
    benefits: ['Deep relaxation', 'Scalp rejuvenation', 'Promotes hair growth', 'Stress relief', 'Professional care']
  },
  {
    id: '2',
    name: 'Luxury Facial Treatment',
    slug: 'luxury-facial',
    description: 'Pamper yourself with our premium facial treatment using QM Beauty natural products. Deep cleansing, exfoliation, and hydration for glowing, radiant skin.',
    duration: '75 minutes',
    price: 70000,
    image: '/services/facial.jpg',
    category: 'facial',
    benefits: ['Deep cleansing', 'Brightens skin', 'Reduces dark spots', 'Hydrating', 'Anti-aging']
  },
  {
    id: '3',
    name: 'Full Body Massage',
    slug: 'body-massage',
    description: 'Relax and unwind with our therapeutic full body massage. Using natural oils and expert techniques to relieve tension and improve circulation.',
    duration: '120 minutes',
    price: 95000,
    image: '/services/massage.jpg',
    category: 'spa',
    benefits: ['Stress relief', 'Muscle relaxation', 'Improved circulation', 'Tension release']
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Amina Hassan',
    rating: 5,
    comment: 'The Coffee Scrub is absolutely amazing! My skin has never felt so smooth and radiant. I use it both on my face and as a hair treatment. Highly recommend QM Beauty!',
    date: '2024-12-20',
    productId: '1'
  },
  {
    id: '2',
    name: 'Sarah Mwangi',
    rating: 5,
    comment: 'The Japanese Head Spa at QM Luxury Spa Salon is pure bliss! I felt so relaxed and my scalp feels rejuvenated. Best spa experience in Dar es Salaam!',
    date: '2024-12-18'
  },
  {
    id: '3',
    name: 'Fatima Ali',
    rating: 5,
    comment: 'I love the Body Butter! A little goes a long way and my skin stays moisturized all day. The natural ingredients make such a difference. Worth every shilling!',
    date: '2024-12-15',
    productId: '8'
  }
];
