import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Validation function
  const validate = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = "Invalid email format.";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (!formData.phone_number.match(/^\d{10}$/)) newErrors.phone_number = "Phone number must be 10 digits.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
  
    try {
      await axios.post("http://localhost:5001/auth/register", formData); // Remove `response`
      setSuccessMessage("Registration successful! You can now login.");
      navigate("/login");
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone_number: "",
      });
      setErrors({});
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setErrors({
          server: "This email or phone number is already registered. Please use a different one.",
        });
      } else {
        
        setErrors({ server: "Registration failed. Please try again." });
      }
    }
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Column: Registration Form */}
        <div className="form-column">
          <form className="register-form" onSubmit={handleSubmit}>
            <h1>Register</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errors.server && <p className="error-message">{errors.server}</p>}
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
              {errors.first_name && <p className="error-message">{errors.first_name}</p>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
              {errors.last_name && <p className="error-message">{errors.last_name}</p>}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
              {errors.phone_number && <p className="error-message">{errors.phone_number}</p>}
            </div>
            <button type="submit" className="register-button">
              Register
            </button>
            <p className="login-link">
              Already have an account?{" "}
              <span onClick={handleLoginClick} className="login-action">
                Login
              </span>
            </p>
          </form>
        </div>

        {/* Right Column: Signup Image */}
        <div className="image-column">
          <img src="registerCoffee.jpg" alt="Signup" className="signup-image" />
        </div>
      </div>
    </div>
  );
};

export default Register;
