import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [vendorId, setVendorId] = useState(null); // Ensures cart only has items from ONE vendor

  const addToCart = (product, targetVendorId) => {
    // Logic: If adding from a different vendor, reset the cart (or ask user)
    if (vendorId && vendorId !== targetVendorId) {
      alert("You can only order from one vendor at a time. Clearing cart...");
      setCartItems([]);
      setVendorId(targetVendorId);
    } else {
      setVendorId(targetVendorId);
    }

    setCartItems((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    if (cartItems.length <= 1) setVendorId(null);
  };

  const clearCart = () => {
    setCartItems([]);
    setVendorId(null);
  };

  // derived state for total price
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      cartTotal, 
      currentVendorId: vendorId 
    }}>
      {children}
    </CartContext.Provider>
  );
};
