// src/CartContext.js

import { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity, price) => {
    setCartItems((prevItems) => {
      // Check if the product is already in the cart by its name
      const existingItemIndex = prevItems.findIndex(item => item.product === product);

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Add new item to cart
        return [...prevItems, { product, quantity, price }];
      }
    });
  };

  const removeFromCart = (product) => {
    setCartItems((prevItems) => {
      return prevItems.filter(item => item.product !== product);
    });
  };

  const increaseQuantity = (product) => {
    setCartItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex(item => item.product === product);

      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          quantity: updatedItems[itemIndex].quantity + 1,
        };
      }

      return updatedItems;
    });
  };

  const decreaseQuantity = (product) => {
    setCartItems((prevItems) => {
      const updatedItems = [...prevItems];
      const itemIndex = updatedItems.findIndex(item => item.product === product);

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
