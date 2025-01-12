// RefundDialog.js

import { useState, useEffect, useRef } from 'react';
import './RefundDialog.css';
import PropTypes from 'prop-types';
import axios from 'axios';
// onSubmit
const RefundDialog = ({ order, isOpen, onClose  }) => {
  const [refundReason, setRefundReason] = useState('');
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
    setRefundReason('');
    onClose();
  };

  // const handleSubmit = () => {
  //   const trimmedReason = refundReason.trim();
  //   if (trimmedReason) {
  //     onSubmit({
  //       orderId: order.id,
  //       reason: trimmedReason,
  //     });
  //     handleCancel();
  //   }
  // };


  const handleSubmit = (order_id, variant_id, quantity, price_at_purchase, reason) => {
    const token = localStorage.getItem('token');

    axios.post('http://localhost:5001/order/refund-request', {
        order_id,
        variant_id,
        quantity,
        price_at_purchase,
        reason,
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    .then(response => {
        // Handle successful response
        console.log('Refund request successful:', response.data);
        handleCancel();
        return response.data;
    })
    .catch(error => {
        // Handle errors
        if (error.response) {
            // Server responded with a status other than 2xx
            console.error('Error response:', error.response.data);
            handleCancel();
            throw new Error(error.response.data.error || 'Error submitting refund request');
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received:', error.request);
            handleCancel();
            throw new Error('No response from server. Please try again later.');
        } else {
            // Other errors
            console.error('Error setting up request:', error.message);
            handleCancel();
            throw new Error(error.message);
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
          Refund Order
        </h2>
        <div className="dialogue-product-details">
          <div className="dialogue-product-image">
            <img src={`http://localhost:5001${order.imageUrl}`} alt={order.name} onError={(e) => e.target.src = 'http://localhost:5001/assets/images/products/default_mockup.png'}  />
            
          </div>
          <div className="dialogue-content">
            <p>
              <strong>Product Name:</strong> {order.name}
            </p>
            <p>
              <strong>Quantity:</strong> {order.quantity}
            </p>
            <p>
              <strong>Total Price:</strong> ${(order.price).toFixed(2)}
            </p>
            <p>
              <strong>Item Weight:</strong> {order.weight_grams} grams
            </p>
            <p>
              <strong>Order Id:</strong> {order.id} 
            </p>
            <p>
              <strong>variant Id:</strong> {order.variant_id} 
            </p>
          </div>
        </div>
        <label htmlFor="refund-reason" className="sr-only">
          Refund Reason
        </label>
        <textarea
          id="refund-reason"
          className="dialogue-refund-reason"
          placeholder="Enter refund reason..."
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          ref={textareaRef}
          required
        />
        <div className="dialogue-buttons">
          <button className="dialogue-btn dialogue-btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="dialogue-btn dialogue-btn-refund"
            onClick={() => handleSubmit(order.id,order.variant_id, order.quantity, order.price, refundReason)}
            disabled={!refundReason.trim()}
            title={!refundReason.trim() ? "A minimum of 100 characters is required for your refund request." : ""}
          >
            Refund
          </button>
        </div>
      </div>
    </div>
  );
};

RefundDialog.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    weight_grams: PropTypes.number.isRequired,
    imageUrl: PropTypes.string.isRequired, // New Prop for product image
    variant_id :PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default RefundDialog;
