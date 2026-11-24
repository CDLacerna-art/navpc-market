import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { ALL_PRODUCTS, FEATURED_PRODUCTS } from '../utils/demoData';

const CartContext = createContext(null);
const STORAGE_KEY = 'navpc_campus_cart_items';

const INITIAL_DEMO_ITEMS = [
  {
    product: FEATURED_PRODUCTS[0], // Casio Calculator (stock: 2)
    quantity: 1,
  },
  {
    product: FEATURED_PRODUCTS[1], // Campus Lanyard (stock: 15)
    quantity: 1,
  },
];

export function CartProvider({ children }) {
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Re-validate against current catalog
          return parsed
            .map((item) => {
              const freshProduct = ALL_PRODUCTS.find((p) => p.id === item.product?.id) || item.product;
              return {
                product: freshProduct,
                quantity: Math.min(item.quantity, freshProduct.stock > 0 ? freshProduct.stock : 1),
              };
            })
            .filter((item) => item.product && item.product.stock > 0);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cart from storage:', e);
    }
    return INITIAL_DEMO_ITEMS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to storage:', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    // 1. Stock validation
    if (!product || product.stock <= 0) {
      showToast(`Cannot add "${product?.title || 'Item'}": Currently out of stock.`, 'error');
      return false;
    }

    let addedSuccessfully = true;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const requestedTotal = currentQty + quantity;

        if (requestedTotal > product.stock) {
          showToast(
            `Quantity adjusted to available stock limit (${product.stock} ${product.stock === 1 ? 'item' : 'items'}).`,
            'warning'
          );
          const updated = [...prevItems];
          updated[existingIndex].quantity = product.stock;
          return updated;
        }

        const updated = [...prevItems];
        updated[existingIndex].quantity = requestedTotal;
        showToast(`Updated "${product.title}" quantity to ${requestedTotal}!`, 'success');
        return updated;
      }

      // If new item
      const safeQty = Math.min(quantity, product.stock);
      if (quantity > product.stock) {
        showToast(
          `Added maximum available quantity (${product.stock} items) to cart.`,
          'warning'
        );
      } else {
        showToast(`Added "${product.title}" to campus cart!`, 'success');
      }

      return [...prevItems, { product, quantity: safeQty }];
    });

    return addedSuccessfully;
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cartItems.find((i) => i.product.id === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.product.stock) {
      showToast(
        `Cannot exceed available stock limit (${item.product.stock} ${item.product.stock === 1 ? 'item' : 'items'}).`,
        'warning'
      );
      setCartItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity: item.product.stock } : i
        )
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    showToast('Campus cart cleared', 'info');
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
