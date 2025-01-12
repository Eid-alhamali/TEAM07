import  { useState ,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();



  useEffect(() => {
    
    const token = localStorage.getItem('token'); 
    
    if (token) {
      
      navigate('/');
    }
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }  

    try {
      const response = await axios.post("http://localhost:5001/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      const token = localStorage.getItem('token');
      const cart = JSON.parse(localStorage.getItem('cart'));
    
      if (cart && Array.isArray(cart) && cart.length > 0) {
        // Call the endpoint to update the cart
        await axios.post(
          "http://localhost:5001/api/cart/sync_cart", 
          cart, 
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send the token in the Authorization header
            },
          }
        );
        
        // If the cart update is successful, clear the cart from localStorage
        localStorage.removeItem('cart');
      }
    
      navigate("/");
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Column: Login Form */}
        <div className="form-column">
          <form className="login-form" onSubmit={handleSubmit}>
            <h1>Login</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
            <p className="register-link">
              Don’t have an account?{" "}
              <span onClick={handleRegisterClick} className="register-action">
                Register
              </span>
            </p>
          </form>
        </div>

        {/* Right Column: Coffee Image */}
        <div className="image-column">
          <img src="./coffeeLogin.jpeg" alt="Coffee" className="coffee-image" />
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
