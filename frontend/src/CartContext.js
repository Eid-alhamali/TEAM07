// src/CartContext.js

import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, variantId, quantity, price, weight_grams) => {
    setCartItems((prevItems) => {
      // Check if the variant is already in the cart by its unique identifier
      const existingItemIndex = prevItems.findIndex(item => item.variantId === variantId);
  
      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Add new variant to cart
        return [...prevItems, { product, variantId, quantity, price, weight_grams }];
      }
    });
  };

  const removeFromCart = (variantId) => {
    setCartItems((prevItems) => {
      return prevItems.filter(item => item.variantId !== variantId);
    });
  };
  

  const increaseQuantity = (variantId) => {
    setCartItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex(item => item.variantId === variantId);
  
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity + 1,
        };
      }
  
      return updatedItems;
    });
  };
  

  const decreaseQuantity = (variantId) => {
    setCartItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex(item => item.variantId === variantId);
  
      if (itemIndex !== -1 && updatedItems[itemIndex].quantity > 1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity - 1,
        };
      }
  
      return updatedItems;
    });
  };
  

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

// Type checking for children
CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
