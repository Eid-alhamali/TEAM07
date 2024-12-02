//src/components/Cart.js

import './Cart.css';
import { useContext } from 'react';
import { CartContext } from '../CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);

  // Calculate total price for all items in the cart
  const totalCartPrice = cartItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  return (
    <div className='cart-page'>
      <div style={{ padding: '20px' }}>
        <h1>Your Cart</h1>
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
                    <button className="button button-primary" onClick={() => decreaseQuantity(item.variantId)}>-</button>
                    <span className="cart-item-quantity">Quantity: {item.quantity}</span>
                    <button className="button button-primary" onClick={() => increaseQuantity(item.variantId)}>+</button>
                  </div>
                  <p>Total price for this item: ${(item.price * item.quantity).toFixed(2)}</p>
                  <button className="button button-danger remove-button" onClick={() => removeFromCart(item.variantId)}>
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

export default Cart;
