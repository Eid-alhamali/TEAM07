import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Toast.css';

// Import images


import successIcon from "../assets/images/icons/whiteSuccess.png"; 
import errorIcon from "../assets/images/icons/refundRejected.png"; 

const Toast = ({ message, type, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Toast disappears after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const icon = type === 'success' ? successIcon : errorIcon;

  return (
    visible && (
      <div className={`toast toast-${type}`}>
        <div className="toast-icon">
          <img src={icon} alt={`${type} icon`} />
        </div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose}>
          &times;
        </button>
      </div>
    )
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Toast;
