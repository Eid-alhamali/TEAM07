// import { useState, useEffect } from 'react';
// import './Checkout.css';
// import axios from 'axios';
// import { useNavigate, useLocation } from "react-router-dom";

// const Checkout = () => {
//   const location = useLocation();
//   const { totalPrice, cartItems } = location.state || { totalPrice: 0, cartItems: [] };

//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const [showCardIcon, setShowCardIcon] = useState(false);
//   const [error, setError] = useState(null);
//   const [address, setAddress] = useState({
//     firstname: "",
//     lastname: "",
//     address: "",
//     city: "",
//     zipcode: "",
//     country: "",
//     phonenumber: "",
//   });

//   const [payment, setPayment] = useState({
//     cardHolderName: "",
//     cardNumber: "",
//     cardExpiration: "",
//     ccv: "",
//   });

//   const handleInputChange = (e, setter) => {
//     const { name, value } = e.target;
//     setter((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCardNumberChange = (e) => {
//     const value = e.target.value.replace(/\D/g, ''); 
//     const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 '); 
//     setPayment((prev) => ({ ...prev, cardNumber: formattedValue }));
  
//     if (value.length === 16) {
//       setShowCardIcon(true);
      
//     } else {
//       setShowCardIcon(false);
      
//     }
//   };
  

//   const handleCardExpirationChange = (e) => {
//     let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
//     if (value.length > 2) {
//       value = `${value.slice(0, 2)}/${value.slice(2, 4)}`; // Enforce MM/YY format
//     }
//     setPayment((prev) => ({ ...prev, cardExpiration: value }));
//   };

//   const handlePhoneNumberChange = (e) => {
//     const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
//     setAddress((prev) => ({ ...prev, phonenumber: value }));
//   };

//   const validateForm = () => {
//     if (
//       !address.firstname || 
//       !address.lastname || 
//       !address.address || 
//       !address.city || 
//       !address.country || 
//       !address.zipcode || 
//       !address.phonenumber || 
//       !payment.cardNumber || 
//       !payment.cardHolderName || 
//       !payment.cardExpiration || 
//       !payment.ccv
//     ) {
//       setError('Please fill out all required fields.');
//       return false;
//     }

//     const unformattedCardNumber = payment.cardNumber.replace(/\s/g, '');
//     if (unformattedCardNumber.length !== 16) {
//       setError('Card number must be exactly 16 digits.');
//       return false;
//     }

//     const [month, year] = payment.cardExpiration.split('/');
//     if (month && (parseInt(month, 10) < 1 || parseInt(month, 10) > 12)) {
//       setError('Month must be between 01 and 12.');
//       return false;
//     }
//     if (year && parseInt(year, 10) < 25) {
//       setError('Year must be 25 or greater.');
//       return false;
//     }

//     return true;
//   };

//   const handlePayment = async () => {
//     if (validateForm()) {
//       const token = localStorage.getItem('token');
//       if (token) {
//         const orderData = {
//           address: address,      
//           payment: payment,       
//           cartItems: cartItems,   
//           totalPrice: totalPrice, 
//         };

//         try {
//           const response = await axios.post(
//             'http://localhost:5001/checkout/status', 
//             orderData,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json', 
//               },
//             }
//           );

//           if (response.status === 201) {
//             navigate("/order-success", { state: { order_id: response.data.order_id } });
//           } else {
//             console.warn('Unexpected response:', response.data);
//           }
//         } catch (error) {
//           console.error('Error during payment processing:', error);
//         }
//       } else {
//         console.error('Authentication token not found.');
//       }
//     }
//   };

//   return (
//     <div className={`checkout-wrapper`}>
//       <div className="checkout-form-box">
//         <form>
//           <h1>Checkout</h1>
//           <h2>Shipping Information</h2>

//           <div className="checkout-double-input-box">
//             <div className="checkout-column1">
//               <label htmlFor="firstname">First Name</label>
//               <input 
//                 type="text" 
//                 placeholder='First Name' 
//                 name="firstname"
//                 value={address.firstname}
//                 onChange={(e) => handleInputChange(e, setAddress)}
//                 required
//               />
//             </div>
//             <div className="checkout-column2">
//               <label htmlFor="lastname">Last Name</label>
//               <input 
//                 type="text" 
//                 placeholder='Last Name' 
//                 name="lastname"
//                 value={address.lastname}
//                 onChange={(e) => handleInputChange(e, setAddress)}
//                 required
//               />
//             </div>
//           </div>

//           <div className="checkout-single-input-box">
//             <label htmlFor="address">Address</label>
//             <input 
//               type="text" 
//               placeholder='Address' 
//               name="address"
//               value={address.address}
//               onChange={(e) => handleInputChange(e, setAddress)}
//               required
//             />
//           </div>

//           <div className="checkout-double-input-box">
//             <div className="checkout-column1">
//               <label htmlFor="city">City</label>
//               <input 
//                 type="text" 
//                 placeholder='City' 
//                 name="city"
//                 value={address.city}
//                 onChange={(e) => handleInputChange(e, setAddress)}
//                 required
//               />
//             </div>
//             <div className="checkout-column2">
//               <label htmlFor="country">Country</label>
//               <input 
//                 type="text" 
//                 placeholder='Country' 
//                 name="country"
//                 value={address.country}
//                 onChange={(e) => handleInputChange(e, setAddress)}
//                 required
//               />
//             </div>
//           </div>

//           <div className="checkout-double-input-box">
//             <div className="checkout-column1">
//               <label htmlFor="zipcode">Zip Code</label>
//               <input 
//                 type="text" 
//                 placeholder='Zip Code' 
//                 name="zipcode"
//                 value={address.zipcode}
//                 onChange={(e) => handleInputChange(e, setAddress)}
//                 required
//               />
//             </div>
//             <div className="checkout-column2">
//               <label htmlFor="phonenumber">Phone Number</label>
//               <input 
//                 type="text" 
//                 placeholder='Phone Number' 
//                 name="phonenumber"
//                 value={address.phonenumber}
//                 onChange={handlePhoneNumberChange}
//                 required
//               />
//             </div>
//           </div>

//           <h2>Payment Information</h2>

//           <div className="checkout-single-input-box">
//             <label htmlFor="nameoncard">Name on Card</label>
//             <input 
//               type="text" 
//               placeholder='Name' 
//               name="cardHolderName"
//               value={payment.cardHolderName}
//               onChange={(e) => handleInputChange(e, setPayment)}
//               required
//             />
//           </div>


//           <div className="checkout-single-input-box card-number-container">
//             <label htmlFor="cardnumber">Card Number</label>
//             <div className="card-number-input-wrapper">
//               <input
//                 type="text"
//                 placeholder="1234 5678 9012 3456"
//                 name="cardNumber"
//                 value={payment.cardNumber}
//                 onChange={handleCardNumberChange}
//                 maxLength={19} // Includes spaces
//                 required
//               />
//               <img
//                 src="/mastercard.png"
//                 alt="MasterCard Icon"
//                 className={`card-icon ${showCardIcon ? 'card-icon-visible' : ''}`}
//               />
//             </div>
//           </div>

//           <div className="checkout-single-input-box">
//             <label htmlFor="expirationdate">Expiration Date (MM/YY)</label>
//             <input 
//               type="text" 
//               placeholder='MM/YY' 
//               name="cardExpiration"
//               value={payment.cardExpiration}
//               onChange={handleCardExpirationChange}
//               required
//             />
//           </div>

//           <div className="checkout-single-input-box">
//             <label htmlFor="ccv">CCV</label>
//             <input 
//               type="text" 
//               placeholder='CCV' 
//               name="ccv"
//               value={payment.ccv}
//               onChange={(e) => handleInputChange(e, setPayment)}
//               maxLength={4}
//               required
//             />
//           </div>

//           {error && <p className="checkout-error-message">{error}</p>}

//           <button type="button" className="checkout-button" onClick={handlePayment}>Pay Now</button>
//         </form>
//       </div>

//       <div className="checkout-right">
//         <h2>Order Summary</h2>
//         <ul className="checkout-cart-items">
//           {cartItems.map((item, index) => (
//             <li key={index} className="checkout-cart-item">
//               <div className="checkout-item-image">
//                 <img
//                   src={`http://localhost:5001${item.image}`}
//                   alt={item.product_name}
//                   onError={(e) => e.target.src = 'http://localhost:5001/assets/images/products/default_mockup.png'}
//                 />
//               </div>
//               <div className="checkout-item-details">
//                 <span className="checkout-item-name">{item.product_name}</span>
//                 <span className="checkout-item-quantity">x{item.quantity}</span>
//               </div>
//               <div className="checkout-item-price">{parseFloat(item.price).toFixed(2)} TL</div>
//             </li>
//           ))}
//         </ul>
//         <div className="checkout-total-price">
//           <h3>Total: {parseFloat(totalPrice).toFixed(2)} TL</h3>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;


import { useState, useEffect } from 'react';
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

  const [showCardIcon, setShowCardIcon] = useState(false);
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
    cardExpiration: "",
    ccv: "",
  });

  // New State Variables for Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState(null);

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 '); 
    setPayment((prev) => ({ ...prev, cardNumber: formattedValue }));
  
    if (value.length === 16) {
      setShowCardIcon(true);
    } else {
      setShowCardIcon(false);
    }
  };

  const handleCardExpirationChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}`; // Enforce MM/YY format
    }
    setPayment((prev) => ({ ...prev, cardExpiration: value }));
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    setAddress((prev) => ({ ...prev, phonenumber: value }));
  };

  // Fetch Addresses on Component Mount
  useEffect(() => {
    const fetchAddresses = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setLoadingAddresses(true);
        try {
          const response = await axios.get('http://localhost:5001/profile/getprofile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // Adjust based on actual API response structure
          setAddresses(response.data.addresses || []);
        } catch (error) {
          console.error('Error fetching addresses:', error);
          setAddressError('Failed to load saved addresses.');
        } finally {
          setLoadingAddresses(false);
        }
      }
    };

    fetchAddresses();
  }, []);

  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);

    const selectedAddress = addresses.find(addr => addr.address_id === parseInt(addressId));

    if (selectedAddress) {
      setAddress({
        firstname: selectedAddress.first_name || "",
        lastname: selectedAddress.last_name || "",
        address: selectedAddress.address_line || "",
        city: selectedAddress.city || "",
        zipcode: selectedAddress.postal_code || "",
        country: selectedAddress.country || "",
        phonenumber: selectedAddress.phone_number || "",
      });
    }
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
      !payment.cardExpiration || 
      !payment.ccv
    ) {
      setError('Please fill out all required fields.');
      return false;
    }

    const unformattedCardNumber = payment.cardNumber.replace(/\s/g, '');
    if (unformattedCardNumber.length !== 16) {
      setError('Card number must be exactly 16 digits.');
      return false;
    }

    const [month, year] = payment.cardExpiration.split('/');
    if (month && (parseInt(month, 10) < 1 || parseInt(month, 10) > 12)) {
      setError('Month must be between 01 and 12.');
      return false;
    }
    if (year && parseInt(year, 10) < 25) {
      setError('Year must be 25 or greater.');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (validateForm()) {
      const token = localStorage.getItem('token');
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

          if (response.status === 201) {
            navigate("/order-success", { state: { order_id: response.data.order_id } });
          } else {
            console.warn('Unexpected response:', response.data);
            setError('Unexpected response from the server.');
          }
        } catch (error) {
          console.error('Error during payment processing:', error);
          setError('Payment processing failed. Please try again.');
        }
      } else {
        console.error('Authentication token not found.');
        setError('You must be logged in to complete the checkout.');
      }
    }
  };

  return (
    <div className={`checkout-wrapper`}>
      <div className="checkout-form-box">
        <form>
          <h1>Checkout</h1>
          
          {/* Address Selection Dropdown */}
          <div className="checkout-single-input-box">
            <label htmlFor="savedAddresses">Saved Addresses</label>
            {loadingAddresses ? (
              <p>Loading addresses...</p>
            ) : addressError ? (
              <p className="checkout-error-message">{addressError}</p>
            ) : addresses.length > 0 ? (
              <select
                id="savedAddresses"
                name="savedAddresses"
                value={selectedAddressId}
                onChange={handleAddressSelect}
                className="checkout-select"
              >
                <option value="">-- Select an Address --</option>
                {addresses.map((addr) => (
                  <option key={addr.address_id} value={addr.address_id}>
                    {addr.address_name}
                  </option>
                ))}
              </select>
            ) : (
              <p>No saved addresses available.</p>
            )}
          </div>
          
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
                onChange={handlePhoneNumberChange}
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


          <div className="checkout-single-input-box card-number-container">
            <label htmlFor="cardnumber">Card Number</label>
            <div className="card-number-input-wrapper">
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                name="cardNumber"
                value={payment.cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19} // Includes spaces
                required
              />
              <img
                src="/mastercard.png"
                alt="MasterCard Icon"
                className={`card-icon ${showCardIcon ? 'card-icon-visible' : ''}`}
              />
            </div>
          </div>

          <div className="checkout-single-input-box">
            <label htmlFor="expirationdate">Expiration Date (MM/YY)</label>
            <input 
              type="text" 
              placeholder='MM/YY' 
              name="cardExpiration"
              value={payment.cardExpiration}
              onChange={handleCardExpirationChange}
              required
            />
          </div>

          <div className="checkout-single-input-box">
            <label htmlFor="ccv">CCV</label>
            <input 
              type="text" 
              placeholder='CCV' 
              name="ccv"
              value={payment.ccv}
              onChange={(e) => handleInputChange(e, setPayment)}
              maxLength={4}
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
                <img
                  src={`http://localhost:5001${item.image}`}
                  alt={item.product_name}
                  onError={(e) => e.target.src = 'http://localhost:5001/assets/images/products/default_mockup.png'}
                />
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
  );
};

export default Checkout;
