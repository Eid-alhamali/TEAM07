// src/components/Mnovo.js

import { useState, useContext } from 'react';
import Navbar from './Navbar';
import './Mnovo.css';
import { CartContext } from '../CartContext';

const Mnovo = () => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  const product = "Mundo Novo";
  const price = 20;

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart(product, quantity, price);
    alert(`${quantity} item(s) of ${product} added to cart.`);
  };

  return (
    <div className="mnovo-page">
      <Navbar />
      <div className="background-container">
        <div className="content-overlay">
          <p>Price: ${price}</p>
          <div className="cart-controls">
            <div className="quantity-control">
              <button onClick={handleDecrement}>-</button>
              <span>{quantity}</span>
              <button onClick={handleIncrement}>+</button>
            </div>
            <button onClick={handleAddToCart} className="add-to-cart-button">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mnovo;
