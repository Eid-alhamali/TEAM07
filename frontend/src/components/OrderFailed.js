import { useNavigate } from "react-router-dom";
import "./OrderStatus.css";
import errorIcon from "../assets/images/icons/error.png"; // Ensure this path is correct

const OrderFailed = () => {
  const navigate = useNavigate();

  const handleRetryCheckout = () => {
    navigate("/checkout");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="order-status-page">
      <div className="order-status-container">
        <img src={errorIcon} alt="Error" className="order-status-status-icon" />
        <h1>Order Failed</h1>
        <p>Unfortunately, your order could not be processed at this time.</p>
        <p>Please try again.</p>
        <div className="order-status-button-group">
          <button onClick={handleRetryCheckout} className="order-status-button order-status-retry-button">
            Retry Checkout
          </button>
          <button onClick={handleBackToHome} className="order-status-button order-status-home-button">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFailed;
