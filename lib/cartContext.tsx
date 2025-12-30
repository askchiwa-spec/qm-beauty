'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types';
import { getSessionId, createCart, addToCartAPI } from '@/lib/api/cart';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session and load cart on mount
  useEffect(() => {
    const session = getSessionId();
    setSessionId(session);
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('qm-beauty-cart');
    const savedCartId = localStorage.getItem('qm-beauty-cart-id');
    
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    if (savedCartId) {
      setCartId(savedCartId);
    }
    
    // Create backend cart if doesn't exist
    if (!savedCartId) {
      initializeCart(session);
    }
  }, []);

  const initializeCart = async (session: string) => {
    const result = await createCart(session);
    if (result.success && result.data?.cartId) {
      setCartId(result.data.cartId);
      localStorage.setItem('qm-beauty-cart-id', result.data.cartId);
    }
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem('qm-beauty-cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('qm-beauty-cart');
    }
  }, [items]);

  const addItem = async (product: Product, quantity: number = 1) => {
    // Update local state immediately for UI responsiveness
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...currentItems, { product, quantity }];
    });
    
    // Sync with backend API
    if (cartId) {
      const price = product.salePrice || product.price;
      await addToCartAPI(cartId, product.id, quantity, price);
    }
    
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('qm-beauty-cart');
    localStorage.removeItem('qm-beauty-cart-id');
    setCartId(null);
    
    // Reinitialize cart for next use
    if (sessionId) {
      initializeCart(sessionId);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.product.salePrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
