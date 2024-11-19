// src/components/Card.js
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
            {cartItems.map((item, index) => (
              <li key={index} style={{ marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <h3>{item.product}</h3>
                <p>Price per item: ${item.price}</p>
                <div>
                  <button onClick={() => decreaseQuantity(item.product)}>-</button>
                  <span style={{ margin: '0 10px' }}>Quantity: {item.quantity}</span>
                  <button onClick={() => increaseQuantity(item.product)}>+</button>
                </div>
                <p>Total price for this item: ${item.price * item.quantity}</p>
                <button onClick={() => removeFromCart(item.product)} style={{ color: 'red' }}>
                  Remove from Cart
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Your cart is currently empty.</p>
        )}
        {cartItems.length > 0 && (
          <div>
            <h3>Total Cart Price: ${totalCartPrice}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
