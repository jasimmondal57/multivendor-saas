'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getGST: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock_quantity) }
            : item
        );
      } else {
        // Add new item
        return [...currentItems, { product, quantity: Math.min(quantity, product.stock_quantity) }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock_quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getSubtotal = () => {
    // Subtotal is the base price (before GST)
    return items.reduce((total, item) => {
      const priceInclGst = parseFloat(item.product.selling_price) * item.quantity;
      const gstRate = parseFloat(item.product.gst_percentage) / 100;
      const basePrice = priceInclGst / (1 + gstRate);
      return total + basePrice;
    }, 0);
  };

  const getGST = () => {
    // GST is extracted from the inclusive price
    return items.reduce((total, item) => {
      const priceInclGst = parseFloat(item.product.selling_price) * item.quantity;
      const gstRate = parseFloat(item.product.gst_percentage) / 100;
      const basePrice = priceInclGst / (1 + gstRate);
      const gstAmount = priceInclGst - basePrice;
      return total + gstAmount;
    }, 0);
  };

  const getTotal = () => {
    // Total is the sum of all item prices (which are already inclusive of GST)
    return items.reduce((total, item) => {
      return total + parseFloat(item.product.selling_price) * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getSubtotal,
        getGST,
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

