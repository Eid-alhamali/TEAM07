//src/components/Card.js

import './Card.css';
import { useContext } from 'react';
import Navbar from './Navbar';
import { CartContext } from '../CartContext';

const Card = () => {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);

  // Calculate total price for all items in the cart
  const totalCartPrice = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h2>Your Cart</h2>
        {cartItems.length > 0 ? (
          <ul>
            <div>
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: '15px',
                    borderBottom: '1px solid #ccc',
                    paddingBottom: '10px',
                  }}
                >
                  <h3>{item.product} </h3>
                  <p>Price per item: ${item.price}</p>
                  <p>Weight: {item.weight_grams}g</p> {/* Display weight */}
                  <div>
                    <button onClick={() => decreaseQuantity(item.variantId)}>-</button>
                    <span style={{ margin: '0 10px' }}>Quantity: {item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.variantId)}>+</button>
                  </div>
                  <p>Total price for this item: ${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    style={{ color: 'red' }}
                  >
                    Remove from Cart
                  </button>
                </div>
              ))}
            </div>

          </ul>
        ) : (
          <p>Your cart is currently empty.</p>
        )}
        {cartItems.length > 0 && (
          <div>
            <h3>Total Cart Price: ${totalCartPrice.toFixed(2)}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
