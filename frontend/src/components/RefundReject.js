// RefundDialog.js

import { useState, useEffect, useRef } from 'react';
import './RefundDialog.css';
import PropTypes from 'prop-types';
import axios from 'axios';
// onSubmit
const RefundReject = ({ Refund, isOpen, onClose  }) => {
  const [rejectReason, setRejectReason] = useState('');
  const dialogRef = useRef(null);
  const textareaRef = useRef(null);

  // Close dialog on Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Focus management: focus on textarea when dialog opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Trap focus within the dialog
  useEffect(() => {
    const trapFocus = (e) => {
      if (isOpen && dialogRef.current && !dialogRef.current.contains(e.target)) {
        e.stopPropagation();
        dialogRef.current.focus();
      }
    };
    document.addEventListener('focus', trapFocus, true);
    return () => document.removeEventListener('focus', trapFocus, true);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancel = () => {
    setRejectReason('');
    onClose();
  };

 

  const handleRejectRefund = (refundId, reason, Refund) => {

    // const token = localStorage.getItem('token');
    axios.post(`http://localhost:5001/order/refund/${refundId}/reject`, {reject_reason: reason , product_name: Refund.product_name, refund_date: Refund.created_at, refund_quantity : Refund.quantity , refund_price : Refund.price_at_purchase, refund_weight: Refund.weight }, {
          // headers: {  'Authorization': `Bearer ${token}`  }
      })
      .then(response => {
        
          console.log(response.data);
          handleCancel();
      })
      .catch(error => {
          if (error.response) {
              alert(`Error: ${error.response.data.error}`);
              console.error(error.response);
              handleCancel();
          } else if (error.request) {
              alert('No response from server. Please try again later.');
              console.error(error.request);
              handleCancel();
          } else {
              alert('Error setting up the request.');
              console.error('Error', error.message);
              handleCancel();
          }
      });
  };






  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div
      className="dialogue-overlay"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="dialogue-title"
    >
      <div className="dialogue-container" ref={dialogRef} tabIndex="-1">
        <button
          className="dialogue-close"
          onClick={handleCancel}
          aria-label="Close Refund Dialog"
        >
          &times;
        </button>
        <h2 className="dialogue-title" id="dialogue-title">
          Refund Rejection
        </h2>
        <div className="dialogue-product-details">
          <div className="dialogue-product-image">
            <img src={`http://localhost:5001${Refund.imageUrl}`} alt={Refund.product_name} onError={(e) => e.target.src = 'http://localhost:5001/assets/images/products/default_mockup.png'} />
          </div>
          <div className="dialogue-content">
            <p>
              <strong>Order Date: </strong>  {Refund.created_at}
            </p>
            <p>
              <strong>Product Name:</strong> {Refund.product_name}
            </p>
            <p>
              <strong>Quantity:</strong> {Refund.quantity}
            </p>
            <p>
              <strong>Total Price:</strong> ${(Refund.price_at_purchase).toFixed(2)}
            </p>
            <p>
              <strong>Item Weight:</strong> {Refund.weight} grams
            </p>
            
          </div>
        </div>
        <label htmlFor="refund-reason" className="sr-only">
          Refund Reason
        </label>
        <textarea
          id="refund-reason"
          className="dialogue-refund-reason"
          placeholder="Enter reject reason..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          ref={textareaRef}
          required
        />
        <div className="dialogue-buttons">
          <button className="dialogue-btn dialogue-btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="dialogue-btn dialogue-btn-refund"
            onClick={() => handleRejectRefund(Refund.refund_id, rejectReason, Refund)}
            disabled={!rejectReason.trim()}
          >
            Reject Refund
          </button>
        </div>
      </div>
    </div>
  );
};

RefundReject.propTypes = {
  Refund: PropTypes.shape({
    refund_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    reason: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    price_at_purchase: PropTypes.number.isRequired,
    weight: PropTypes.number.isRequired,
    imageUrl: PropTypes.string.isRequired, 
    product_name: PropTypes.string.isRequired,
    created_at :PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default RefundReject;
