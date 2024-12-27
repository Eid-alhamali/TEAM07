import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../assets/images/backgrounds/samuel-ferrara-1527pjeb6jg-unsplash.jpg";
import "./AdminLoginPage.css";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      const role = sessionStorage.getItem("role");
      if (role === "product_manager") {
        navigate("/admin/product_management");
      } else if (role === "sales_manager") {
        navigate("/admin/sales_management");
      } else {
        navigate("/admin/main_page");
      }
    }

    document.body.style.background = `url(${backgroundImage}) no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";

    return () => {
      document.body.style.background = "";
    };
  }, [navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5001/auth/login", {
        email,
        password,
      });

      const { token, role } = response.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);

      if (role === "product_manager") {
        navigate("/admin/product_management");
      } else if (role === "sales_manager") {
        navigate("/admin/sales_management");
      } else {
        setLoginError("You are not authorized to access the admin panel.");
      }
    } catch (error) {
      setLoginError(error.response?.data?.error || "Invalid email or password.");
    }
  };

  return (
    <div className="glass-wrapper">
      <form onSubmit={handleAdminLogin}>
        <h2>Admin Login</h2>
        <div className="glass-input-field">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder=" " 
          />
          <label>Enter your email</label>
        </div>
        <div className="glass-input-field">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder=" " 
          />
          <label>Enter your password</label>
        </div>

        <button type="submit">Log In</button>
        {loginError && <div className="glass-login-error">{loginError}</div>}
      </form>
    </div>
  );
};

export default AdminLoginPage;