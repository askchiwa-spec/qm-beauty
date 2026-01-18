export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  category: 'skincare' | 'haircare' | 'bundle' | 'spa';
  image: string;
  images: string[];
  inStock: boolean;
  featured?: boolean;
  ingredients?: string[];
  benefits?: string[];
  skinTypes?: string[];
  howToUse?: string;
  packageSize?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: string;
  price: number;
  image: string;
  category: 'facial' | 'spa' | 'haircare' | 'body' | 'beauty';
  benefits: string[];
  packageSize?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  image?: string;
  rating: number;
  comment: string;
  date: string;
  productId?: string;
}
