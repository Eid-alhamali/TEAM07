

import { useState, useEffect } from 'react';  
import axios from 'axios';
import './OrdersPage.css'; 
import { useNavigate } from 'react-router-dom'; 
import pdfIcon from '../assets/images/icons/pdf.png'; 
import successIcon from "../assets/images/icons/refundSuccess.png"; 
import refundRejected from "../assets/images/icons/refundRejected.png"; 
import pendingIcon from "../assets/images/icons/pending.png"; 
import RefundDialog from './RefundDialog';

const OrdersPage = () => {

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openRefundDialog = (order, order_id) => {

    const Order = {
      id: order_id,            // Unique identifier for the order
      name: order.name, // Name of the product
      quantity: order.quantity,          // Quantity purchased
      price: parseFloat(order.price_at_purchase),         // Total price in dollars
      weight_grams: order.weight_grams,    
      imageUrl : order.image_url,
      variant_id : order.variant_id
    };
    setSelectedOrder(Order);
    setDialogOpen(true);
  };

  const closeRefundDialog = () => {
    setDialogOpen(false);
  };

  const handleRefundSubmit = (refundDetails) => {
    console.log('Refund submitted:', refundDetails);
    // Add logic to handle refund submission
  };

  

  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');


  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const token = localStorage.getItem('token'); 
      
      if (!token) {
        navigate('/login');   
        return;
      }

      try {
        const response = await axios.get('http://localhost:5001/order/getorders', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setOrders(response.data.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setErrors('Failed to fetch orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, dialogOpen]);
  


  const handleComment = (variantId) =>{

    navigate(`/product/${variantId}`);

  }

  const handleCancel = async (orderId) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    setCancelLoading(true);
    setCancelError('');
    
    const token = localStorage.getItem('token'); 
    try {
      const response = await axios.put(
        `http://localhost:5001/order/cancel/${orderId}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      if(response.status === 201){
      setOrders(prevOrders => prevOrders.map(order => 
        order.order_id === orderId ? { ...order, status: 'canceled' } : order
      ));}
    } catch (error) {
      console.error('Failed to cancel order:', error);
      setCancelError('Failed to cancel the order. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };




  const handleToggleExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const handleDownloadInvoice = async (orderId) => {
    setDownloadLoading(true);
    setDownloadError('');
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`http://localhost:5001/order/getinvoice/${orderId}`, { 
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' 
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${orderId}.pdf`); // Filename
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      setDownloadError('Failed to download invoice. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="orders-page__loading-container">
        <div className="orders-page__spinner">Loading...</div>
      </div>
    );
  }

  if (errors) {
    return (
      <div className="orders-page__error">
        <p>{errors}</p>
      </div>
    );
  }

  return (
    <div className="orders-page__container">
    <h1 className="orders-page__title">My Orders</h1>
    {orders.length === 0 && (
      <div className="orders-page__no-orders">You have no orders yet.</div>
    )}
    <div className="orders-page__list">
      {orders.map(order => {
        const isExpanded = expandedOrderId === order.order_id;
        const statusLower = order.status.toLowerCase();
        const isDelivered = statusLower === 'delivered';
        const isCanceled = statusLower === 'canceled';
        const isProcessing = statusLower === 'processing';
  
        return (
          <div key={order.order_id} className={`orders-page__order ${isExpanded ? 'expanded' : ''}`}>
            <div 
              className="orders-page__order-header" 
              onClick={() => handleToggleExpand(order.order_id)}
            >
              <div className="orders-page__order-info">
                <span className="orders-page__order-id">Order #{order.order_id}</span>
                <span className="orders-page__order-total">Total: {order.total_price} TL</span>
                <span className="orders-page__order-status">Status: {order.status}</span>
                <span className="orders-page__order-date">
                  Ordered on: {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="orders-page__toggle-icon">
                {isExpanded ? '-' : '+'}
              </div>
            </div>
  
            {isExpanded && (
              <div className="orders-page__order-details">
                {/* Address Section */}
                <div className="orders-page__address">
                  <h3 className="orders-page__address-title">Shipping Address</h3>
                  <p><strong>Address Line: </strong> {order.address.address_line}</p>
                  <p><strong>City: </strong>{order.address.city}, {order.address.country}</p>
                  <p><strong>Postal Code: </strong>{order.address.postal_code}</p>
                  <p><strong>Phone: </strong>{order.address.phone_number}</p>
                </div>
  
                {/* Order Items Section */}
                <ul className="orders-page__items-list">
                  {order.order_items.map((item, idx) => (
                    <li key={idx} className="orders-page__item">
                      <img
                        src={`http://localhost:5001${item.image_url}`}
                        alt={item.name}
                        className="orders-page__item-image"
                        onError={(e) => e.target.src = 'http://localhost:5001/assets/images/products/default_mockup.png'}
                      />
                      <div className="orders-page__item-info">
                        <span className="orders-page__item-name">{item.name}</span>
                        <span className="orders-page__item-weight">Weight: {item.weight_grams}g</span>
                        <span className="orders-page__item-price">Price: {item.price_at_purchase} TL</span>
                        <span className="orders-page__item-quantity">Qty: {item.quantity}</span>
                        <span className="orders-page__item-quantity">Variant ID: {item.variant_id}</span>
  
                        {!isCanceled && (
                          <div className="orders-page__item-actions">
                            <button 
                              className="orders-page__btn-comment" 
                              disabled={!isDelivered}
                              onClick={() => handleComment(item.variant_id)}
                              title={!isDelivered ? "Please wait until the delivery is completed to add a comment." : ""}
                            >
                              Comment
                            </button>
  
                            {item.refund_status === 'notrefunded' ? (
                              <button
                                className="orders-page__btn-refund"
                                disabled={
                                  !isDelivered || 
                                  new Date() - new Date(order.created_at) > 30 * 24 * 60 * 60 * 1000
                                }
                                onClick={() => openRefundDialog(item, order.order_id)}
                                title={
                                  !isDelivered
                                    ? "Please wait until the delivery is completed."
                                    : new Date() - new Date(order.created_at) > 30 * 24 * 60 * 60 * 1000
                                    ? "Refunds are allowed only within 30 days of purchase."
                                    : ""
                                }
                              >
                                Refund
                              </button>
                            ) : (
                              <span className="orders-page__refund-status">
                                {item.refund_status === 'pending' && (
                                  <button className="refund-list__btn-pending" disabled>
                                    <img src={pendingIcon} alt="Pending" className="refund-list__btn-icon" />
                                    Refund Request Pending
                                  </button>
                                )}
                                {item.refund_status === 'approved' && (
                                  <button className="refund-list__btn-approved" disabled>
                                    <img src={successIcon} alt="Success" className="refund-list__btn-icon" />
                                    Refund Approved
                                  </button>
                                )}
                                {item.refund_status === 'rejected' && (
                                  <button className="refund-list__btn-rejected" disabled>
                                    <img src={refundRejected} alt="Rejected" className="refund-list__btn-icon" />
                                    Refund Rejected
                                  </button>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
  
                {/* Invoice Section */}
                <div className="orders-page__invoice-section">
                  <div className="orders-page__invoice-text">
                    <h4>Invoice</h4>
                    <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="orders-page__pdf-wrapper">
                    <img 
                      src={pdfIcon} 
                      alt="Download Invoice" 
                      className={`orders-page__pdf-icon ${downloadLoading ? 'disabled' : ''}`} 
                      onClick={() => !downloadLoading && handleDownloadInvoice(order.order_id)} 
                    />
                    {downloadLoading && <span className="orders-page__loading-text">Downloading...</span>}
                  </div>
                </div>
  
                {downloadError && (
                  <div className="orders-page__download-error">
                    <p>{downloadError}</p>
                  </div>
                )}
  
                {isProcessing && (
                  <div className="orders-page__cancel-section">
                    <button 
                      className="orders-page__btn-cancel"
                      onClick={() => handleCancel(order.order_id)}
                      disabled={cancelLoading}
                    >
                      {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                    {cancelError && (
                      <div className="orders-page__cancel-error">
                        <p>{cancelError}</p>
                      </div>
                    )}
                  </div>
                )}
  
                {isCanceled && (
                  <div className="orders-page__canceled-message">
                    <p>This order has been canceled.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  
    <RefundDialog
      order={selectedOrder}
      isOpen={dialogOpen}
      onClose={closeRefundDialog}
      onSubmit={handleRefundSubmit}
    />
  </div>
  
  );
  
};



export default OrdersPage;
