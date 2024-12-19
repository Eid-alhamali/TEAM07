
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderStatus.css";
import successIcon from "../assets/images/icons/success.png"; 

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order_id } = location.state || {};

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="order-status-page">
      <div className="order-status-container">
        <img src={successIcon} alt="Success" className="order-status-status-icon" />
        <h1>Order Placed Successfully!</h1>
        <p>Your order ID is <strong>{order_id}</strong>.</p>
        <p>Thank you for shopping with us! You will receive a confirmation email shortly.</p>
        <button onClick={handleBackToHome} className="order-status-button order-status-home-button">
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;