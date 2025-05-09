import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

interface CartContextType {
  cartCount: number;
  updateCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    try {
      const res = await api.get('/cart');
      setCartCount(res.data?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0);
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  };

  useEffect(() => {
    updateCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
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