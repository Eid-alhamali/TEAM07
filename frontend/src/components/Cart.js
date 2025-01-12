import  { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import './Cart.css';
import Toast from './Toast';

const Cart = () => {
  const [cartItems, setCartItems] = useState(  [  ]);
  const [totalPrice, setTotalPrice] = useState(0);
  const token = localStorage.getItem('token');

  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const handleCloseToast = () => {
    setToast({ visible: false, message: '', type: '' });
  };



  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      

      // Fetch cart items from the backend for logged-in users
      axios.get('http://localhost:5001/api/cart/getcartitems', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setCartItems(response.data);
      })
      .catch(error => {
        console.error('Error fetching cart items:', error);
        setCartItems([]); // Reset to an empty array if there's an error
      });
    } else {
      // Use localStorage for guest users
      const localCart = JSON.parse(localStorage.getItem('cart')) || [];
      console.log('Local Cart:', localCart);
      setCartItems(localCart);
      
    }
  }, []);

  useEffect(() => {
    
    const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);
    setTotalPrice(total);
  }, [cartItems]);

  const handleIncrement = (variantId) => {
    
  
    if (token) {
      axios.put('http://localhost:5001/api/cart/increment', { variantId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        if (response.data.message === 'success') {
          setCartItems(prevItems => {
            const updatedItems = prevItems.map(item => {
              if (item.variantId === variantId) {
                return { ...item, quantity: item.quantity + 1 };
              }
              return item;
            });
            return updatedItems;
          });
        }
      })
      .catch(error => {
        console.error('Error updating cart item:', error);
        
      });
    }else{

      axios.get(`http://localhost:5001/api/cart/variant/${variantId}`)
      .then((response) => {
          if (response.status === 200) {
              const { stock } = response.data;
             
              
              
              const cart = JSON.parse(localStorage.getItem('cart')) || [];
              const productIndex = cart.findIndex(
                  (item) => item.variantId === variantId
              );

              if (productIndex > -1) {
                  
                  const existingProduct = cart[productIndex];
                  if (existingProduct.quantity + 1 > stock) {
                      alert('Stock is insufficient to add more of this product.');
                      return;
                  }
 
                  cart[productIndex].quantity += 1;
                  
                  localStorage.setItem('cart', JSON.stringify(cart));
                  setCartItems(cart);
                  
              } else {
                  alert('Product not found in the cart.');
                  
              }
          } else {
              alert('Failed to fetch product details. Please try again.');
              
          }
      })
      .catch((error) => {
          console.error('Error fetching product details:', error);
          alert('An error occurred while updating the product. Please try again.');
      });
  }
  };
  



  const handleDecrement = (variantId) => {
    
  
    if (token) {
      axios.put('http://localhost:5001/api/cart/decrement', { variantId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        if (response.data.message === 'success') {
          setCartItems(prevItems => {
            const updatedItems = prevItems.map(item => {
              if (item.variantId === variantId) {
                // Ensure quantity never goes below 1
                return { ...item, quantity: Math.max(item.quantity - 1, 1) };
              }
              return item;
            });
            return updatedItems;
          });
        }
      })
      .catch(error => {
        console.error('Error updating cart item:', error);
        
      });
    }

    else {
      
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const productIndex = cart.findIndex((item) => item.variantId === variantId);

      if (productIndex > -1) {
          
          cart[productIndex].quantity = Math.max(cart[productIndex].quantity - 1, 1);
          localStorage.setItem('cart', JSON.stringify(cart));     
          setCartItems(cart);
      } else {
          console.error('Product not found in the cart.');
      }
  }

  };

  const handleRemove = (variantId) => {
    if (!token) {

      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const updatedCart = cart.filter((item) => item.variantId !== variantId);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      showToast('Item removed from your cart successfully!', 'success');
      return; 
    }
  
    axios
      .delete('http://localhost:5001/api/cart/remove', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { variantId },
      })
      .then((response) => {
        if (response.data.message === 'success') {
          setCartItems((prevItems) => prevItems.filter((item) => item.variantId !== variantId));
          showToast('Item removed from your cart successfully!', 'success');
        } else {
          console.error('Unexpected response:', response.data);  
          showToast('Unable to remove item. Please try again later.', 'error');
        }
      })
      .catch((error) => {
        console.error('Error removing cart item:', error);
        showToast('Unable to remove item. Please try again later.', 'error');
        
      });
  };
  
  const navigate = useNavigate();
  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      
      navigate("/login");
    } else {
      if (cartItems.length === 0) {
        
        alert("Your cart is empty. Please add items to your cart before proceeding to checkout.");
        return; 
      }}
    
      
      navigate("/checkout", { state: { totalPrice, cartItems } });
  };

  return (
    <div className="cartPage-container">
      <h2 className="cartPage-heading">Your Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <div className="cartPage-empty">Your cart is empty.</div>
      ) : (
        <div className="cartPage-content">
          <div className="cartPage-items">
            {cartItems.map((item) => (
              <div className="cartPage-item" key={item.variantId}>
                <img src={`http://localhost:5001${item.image}`} alt={item.product_name} className="cartPage-itemImage" onError={(e) => e.target.src = 'http://localhost:5001/assets/images/products/default_mockup.png'} />
                <div className="cartPage-itemDetails">
                  <h3 className="cartPage-itemName">{item.product_name}</h3>
                  <p className="cartPage-itemWeight">{item.weight}</p>
                  <p className="cartPage-itemPrice">{parseFloat(item.price).toFixed(2)} TL</p>
                  <div className="cartPage-quantityControls">
                    <button 
                      className="cartPage-decrementBtn" 
                      onClick={() => handleDecrement(item.variantId)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="cartPage-quantity">{item.quantity}</span>
                    <button 
                      className="cartPage-incrementBtn" 
                      onClick={() => handleIncrement(item.variantId)}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="cartPage-removeBtn" 
                    onClick={() => handleRemove(item.variantId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cartPage-summary">
            <h3 className="cartPage-summaryHeading">Order Summary</h3>
            <p className="cartPage-totalLabel">Total:</p>
            <p className="cartPage-totalPrice">{totalPrice.toFixed(2)} TL</p>
            <button 
              className="cartPage-checkoutBtn" 
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
       <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export default Cart;
