import { useState ,useEffect } from 'react';
import './Checkout.css';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";

const Checkout = () => {
  
  const location = useLocation();
  const { totalPrice, cartItems } = location.state || { totalPrice: 0, cartItems: [] };

  const navigate = useNavigate();

  useEffect(() => {
    
    const token = localStorage.getItem('token'); 

    
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  
  
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({
    firstname: "",
    lastname: "",
    address: "",
    city: "",
    zipcode: "",
    country: "",
    phonenumber: "",
  });

  const [payment, setPayment] = useState({
    cardHolderName: "",
    cardNumber: "",
    cardExpirationMonth: "",
    cardExpirationYear: "",
    ccv: "",
  });

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {  
    if (
      !address.firstname || 
      !address.lastname || 
      !address.address || 
      !address.city || 
      !address.country || 
      !address.zipcode || 
      !address.phonenumber || 
      !payment.cardNumber || 
      !payment.cardHolderName || 
      !payment.cardExpirationMonth || 
      !payment.cardExpirationYear || 
      !payment.ccv
    ) {     
        return false;
    }
    
    setError('');
    return true;
  };


  
const handlePayment = async () => {
  console.log('handlePayment invoked');
  if (validateForm()) {
    const token = localStorage.getItem('token');
    console.log('handlePayment invoked');
    if (token) {
      const orderData = {
        address: address,      
        payment: payment,       
        cartItems: cartItems,   
        totalPrice: totalPrice, 
      };

      try {
        const response = await axios.post(
          'http://localhost:5001/checkout/status', 
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json', 
            },
          }
        );

        console.log('handlePayment invoked');
        if (response.status === 201) {
          console.log(`order id:  ${response.data.order_id}`);
          navigate("/order-success",{ state: { order_id: response.data.order_id } });
        } else {
          
          console.warn('Unexpected response:', response.data);
          
        }
      } catch (error) {
        
        if (error.response) {
          
          console.error('Server Error:', error.response.data);
          
        } else if (error.request) {
          
          console.error('Network Error:', error.request);
          
        } else {
          
          console.error('Error:', error.message);
        }
        
      }
    } else {
      
      console.error('Authentication token not found.');
      
    }
  } else {
    
    console.error('Form validation failed.');
    
  }
};

  return (
    <div className={`checkout-wrapper`}>
      
      <div className="checkout-form-box">
        <form action="">
          <h1>Checkout</h1>
          <h2>Shipping Information</h2>

          <div className="checkout-double-input-box">
            <div className="checkout-column1">
              <label htmlFor="firstname">First Name</label>
              <input 
                type="text" 
                placeholder='First Name' 
                name="firstname"
                value={address.firstname}
                onChange={(e) => handleInputChange(e, setAddress)}
                required
              />
            </div>
            <div className="checkout-column2">
              <label htmlFor="lastname">Last Name</label>
              <input 
                type="text" 
                placeholder='Last Name' 
                name="lastname"
                value={address.lastname}
                onChange={(e) => handleInputChange(e, setAddress)}
                required
              />
            </div>
          </div>

          <div className="checkout-single-input-box">
            <label htmlFor="address">Address</label>
            <input 
              type="text" 
              placeholder='Address' 
              name="address"
              value={address.address}
              onChange={(e) => handleInputChange(e, setAddress)}
              required
            />
          </div>

          <div className="checkout-double-input-box">
            <div className="checkout-column1">
              <label htmlFor="city">City</label>
              <input 
                type="text" 
                placeholder='City' 
                name="city"
                value={address.city}
                onChange={(e) => handleInputChange(e, setAddress)}
                required
              />
            </div>
            <div className="checkout-column2">
              <label htmlFor="country">Country</label>
              <input 
                type="text" 
                placeholder='Country' 
                name="country"
                value={address.country}
                onChange={(e) => handleInputChange(e, setAddress)}
                required
              />
            </div>
          </div>

          <div className="checkout-double-input-box">
            <div className="checkout-column1">
              <label htmlFor="zipcode">Zip Code</label>
              <input 
                type="text" 
                placeholder='Zip Code' 
                name="zipcode"
                value={address.zipcode}
                onChange={(e) => handleInputChange(e, setAddress)}
                required
              />
            </div>
            <div className="checkout-column2">
              <label htmlFor="phonenumber">Phone Number</label>
              <input 
                type="text" 
                placeholder='Phone Number' 
                name="phonenumber"
                value={address.phonenumber}
                onChange={(e) => handleInputChange(e, setAddress)}
                required
              />
            </div>
          </div>

          <h2>Payment Information</h2>

          <div className="checkout-single-input-box">
            <label htmlFor="nameoncard">Name on Card</label>
            <input 
              type="text" 
              placeholder='Name' 
              name="cardHolderName"
              value={payment.cardHolderName}
              onChange={(e) => handleInputChange(e, setPayment)}
              required
            />
          </div>

          <div className="checkout-single-input-box">
            <label htmlFor="cardnumber">Card Number</label>
            <input 
              type="text" 
              placeholder='Card Number' 
              name="cardNumber"
              value={payment.cardNumber}
              onChange={(e) => handleInputChange(e, setPayment)}
              required
            />
          </div>

          <div className="checkout-single-label">
            <label htmlFor="expirationdate">Expiration Date</label>
          </div>
          <div className="checkout-double-input-box">
            <div className="checkout-column1">
              <input 
                type="text" 
                placeholder='Month' 
                name="cardExpirationMonth"
                value={payment.cardExpirationMonth}
                onChange={(e) => handleInputChange(e, setPayment)}
                required
              />
            </div>
            <div className="checkout-column2">
              <input 
                type="text" 
                placeholder='Year' 
                name="cardExpirationYear"
                value={payment.cardExpirationYear}
                onChange={(e) => handleInputChange(e, setPayment)}
                required
              />
            </div>
          </div>

          <div className="checkout-single-input-box">
            <label htmlFor="ccv">CCV</label>
            <input 
              type="text" 
              placeholder='CCV' 
              name="ccv"
              value={payment.ccv}
              onChange={(e) => handleInputChange(e, setPayment)}
              required
            />
          </div>
          
          {error && <p className="checkout-error-message">{error}</p>}

          <button type="button" className="checkout-button" onClick={handlePayment}>Pay Now</button>

        </form>
      </div>

      <div className="checkout-right">
        <h2>Order Summary</h2>
        <ul className="checkout-cart-items">
          {cartItems.map((item, index) => (
            <li key={index} className="checkout-cart-item">
              <div className="checkout-item-image">
                <img src={`http://localhost:5001${item.image}`} alt={item.product_name} />
              </div>
              <div className="checkout-item-details">
                <span className="checkout-item-name">{item.product_name}</span>
                <span className="checkout-item-quantity">x{item.quantity}</span>
              </div>
              <div className="checkout-item-price">{parseFloat(item.price).toFixed(2)} TL</div>
            </li>
          ))}
        </ul>
        <div className="checkout-total-price">
          <h3>Total: {parseFloat(totalPrice).toFixed(2)} TL</h3>
        </div>
      </div>
    </div>
  )
}

export default Checkout
