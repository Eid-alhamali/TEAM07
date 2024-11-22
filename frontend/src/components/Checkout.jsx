import { useState } from 'react'
import './Checkout.css'

const Checkout = () => {
    
    {/*state variables to manage form data, error messages, and action (checkout)*/}
    const [action, setAction] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [phonenumber, setPhonenumber] = useState('');
    const [nameoncard, setNameoncard] = useState('');
    const [cardnumber, setCardnumber] = useState('');
    const [expirationMonth, setExpirationMonth] = useState('');
    const [expirationYear, setExpirationYear] = useState('');
    const [ccv, setCcv] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    {/*switch to purchase complete screen*/}
    const completeLink = () => {
        setAction( ' complete' );
    };

    {/*perform validation checks*/}
    const validateForm = () => {
        if (
            !firstname || !lastname || !address || !city || !country || !zipcode ||
            !phonenumber || !nameoncard || !cardnumber || !expirationMonth || !expirationYear || !ccv
        ) {
            setErrorMessage('All fields are required.');
            return false;
        }

        setErrorMessage('');
        return true;
    };

    {/*handle payment logic*/}
    const handlePayment = (e) => {
        e.preventDefault();
    
        if (!validateForm()) {
            return;
        }

        completeLink();

        // alert('Processing payment...');
    
        // setTimeout(() => {
        //     alert('Payment Successful! Thank you for your purchase.');
            
            
        //     setFirstname('');
        //     setLastname('');
        //     setAddress('');
        //     setCity('');
        //     setCountry('');
        //     setZipcode('');
        //     setPhonenumber('');
        //     setNameoncard('');
        //     setCardnumber('');
        //     setExpirationMonth('');
        //     setExpirationYear('');
        //     setCcv('');
        // }, 2000); 
    };

    return (
    <div className={`wrapper${action}`}>
        
        {/*checkout form*/}
        <div className="form-box checkout">
            <form action="">

                <h1>Checkout</h1>
                <h2>Shipping Information</h2>

                <div className="double-input-box">
                    <div className="column1">
                        <label htmlFor="firstname">First Name</label>
                        <input type="text" placeholder='First Name' 
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required/>
                    </div>
                    <div className="column2">
                        <label htmlFor="lastname">Last Name</label>
                        <input type="text" placeholder='Last Name' 
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        required/>
                    </div>
                </div>

                <div className="single-input-box">
                    <label htmlFor="address">Address</label>
                    <input type="text" placeholder='Address' 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required/>
                </div>

                <div className="double-input-box">
                    <div className="column1">
                        <label htmlFor="city">City</label>
                        <input type="text" placeholder='City' 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required/>
                    </div>
                    <div className="column2">
                        <label htmlFor="country">Country</label>
                        <input type="text" placeholder='Country' 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required/>
                    </div>
                </div>

                <div className="double-input-box">
                    <div className="column1">
                        <label htmlFor="zipcode">Zip Code</label>
                        <input type="text" placeholder='Zip Code' 
                        value={zipcode}
                        onChange={(e) => setZipcode(e.target.value)}
                        required/>
                    </div>
                    <div className="column2">
                        <label htmlFor="phonenumber">Phone Number</label>
                        <input type="text" placeholder='Phone Number' 
                        value={phonenumber}
                        onChange={(e) => setPhonenumber(e.target.value)}
                        required/>
                    </div>
                </div>

                <h2>Payment Information</h2>

                <div className="single-input-box">
                    <label htmlFor="nameoncard">Name on Card</label>
                    <input type="text" placeholder='Name' 
                    value={nameoncard}
                    onChange={(e) => setNameoncard(e.target.value)}
                    required/>
                </div>

                <div className="single-input-box">
                    <label htmlFor="cardnumber">Card Number</label>
                    <input type="text" placeholder='Card Number' 
                    value={cardnumber}
                    onChange={(e) => setCardnumber(e.target.value)}
                    required/>
                </div>

                <div className="single-label">
                    <label htmlFor="expirationdate">Expiration Date</label>
                </div>
                <div className="double-input-box">
                    <div className="column1">
                        <input type="text" placeholder='Month' 
                        value={expirationMonth}
                        onChange={(e) => setExpirationMonth(e.target.value)}
                        required/>
                    </div>
                    <div className="column2">
                        <input type="text" placeholder='Year' 
                        value={expirationYear}
                        onChange={(e) => setExpirationYear(e.target.value)}
                        required/>
                    </div>
                </div>

                <div className="single-input-box">
                    <label htmlFor="ccv">CCV</label>
                    <input type="text" placeholder='CCV' 
                    value={ccv}
                    onChange={(e) => setCcv(e.target.value)}
                    required/>
                </div>
                
                {errorMessage && <p style={{ color: 'red', fontWeight: 'bold'}}>{errorMessage}</p>}

                <button type="submit" onClick={handlePayment}>Pay Now</button>
            </form>
        </div>

        {/*purchase complete screen*/}
        <div className="form-box complete">
            <div className="action">
                <h1>Thank you for your purchase</h1>
                <a href="index.html" class="home-button">Return to Home Page</a> {/*make this button return to home screen*/}
            </div>
        </div>
    </div>


  )
}

export default Checkout