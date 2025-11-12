import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { id: product.id, title: product.title, price: product.price, thumbnail: product.thumbnail || product.images?.[0], quantity: qty }];
    });
  };

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, qty) => setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  const clear = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const value = useMemo(() => ({ items, add, remove, updateQty, clear, subtotal }), [items, subtotal]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
