import { useState, useEffect } from 'react';  
import axios from 'axios';
import './InvoiceOrders.css'; 
import { useNavigate } from 'react-router-dom'; 
import pdfIcon from '../assets/images/icons/pdf.png'; 
import successIcon from "../assets/images/icons/refundSuccess.png"; 
import refundRejected from "../assets/images/icons/refundRejected.png"; 
import pendingIcon from '../assets/images/icons/pending.png';
import LineChart from "./LineChart";
import backIcon from '../assets/images/icons/back.png'; 

const InvoiceOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [filter, setFilter] = useState('all'); // Added filter state
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      // const token = localStorage.getItem('token'); 

      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setEndDate(formattedDate);
      // if (!token) {
      //   navigate('/login');   
      //   return;
      // }

      try {
        const response = await axios.get('http://localhost:5001/order/getallorders', { 
          // headers: { Authorization: `Bearer ${token}` } 
        });
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders); // Initialize filtered orders
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setErrors('Failed to fetch orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleToggleExpand = (orderId) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  const handleDownloadInvoice = async (orderId) => {
    setDownloadLoading(true);
    setDownloadError('');
    // const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`http://localhost:5001/order/getinvoice/${orderId}`
    
      );

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

  const handleFilterChange = (status) => {
    setFilter(status);
    filterOrders(status, startDate, endDate);
  };

  const handleDateFilterChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    filterOrders(filter, start, end);
  };

  const filterOrders = (status, start, end) => {
    let filtered = orders;

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter(order => order.status.toLowerCase() === status);
    }

    // Filter by date range
    if (start && end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= new Date(start) && orderDate <= new Date(end);
      });
    }

    setFilteredOrders(filtered);
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
    <div className="invoice-orders-page__container">
      {/* Back Icon */}
      <div className="orders-page__back-btn" onClick={() => navigate('/admin/sales_management')}>
        <img src={backIcon} alt="Back" className="orders-page__back-icon" />
      </div>

      <LineChart/>
      <br></br>

      {/* Filter Buttons */}
      <div className="orders-page__filter">
        {['all', 'processing', 'in-transit', 'delivered', 'canceled'].map(status => (
          <button 
            key={status} 
            className={`orders-page__filter-btn ${filter === status ? 'active' : ''}`} 
            onClick={() => handleFilterChange(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')} Orders
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="orders-page__date-filter">
        <label>Start Date: </label>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => handleDateFilterChange(e.target.value, endDate)} 
        />
        <label>End Date: </label>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => handleDateFilterChange(startDate, e.target.value)} 
        />
      </div>

      {filteredOrders.length === 0 && (
        <div className="orders-page__no-orders">No orders found.</div>
      )}

      <div className="orders-page__list">
        {filteredOrders.map(order => {
          const isExpanded = expandedOrderId === order.order_id;
          const statusLower = order.status.toLowerCase();
          const isCanceled = statusLower === 'canceled';

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
                              {item.refund_status === 'notrefunded' ? (
                                <></>
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
    </div>
  );
};

export default InvoiceOrders;
