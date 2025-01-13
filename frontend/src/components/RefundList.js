import { useState, useEffect } from 'react';
import axios from 'axios';  
import './RefundList.css';
import successIcon from "../assets/images/icons/refundSuccess.png"; 
import refundRejected from "../assets/images/icons/refundRejected.png"; 
import { useNavigate } from 'react-router-dom';
import RefundChart from './RefundChart';
import RefundReject from './RefundReject';
import Toast from './Toast';
import backIcon from '../assets/images/icons/back.png'; 

const RefundList = () => {
  const [refunds, setRefunds] = useState([]);
  const [expandedRefundId, setExpandedRefundId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [filter, setFilter] = useState('All'); // New state for filter
  const navigate = useNavigate();

  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const handleCloseToast = () => {
    setToast({ visible: false, message: '', type: '' });
  };


  useEffect(() => {
    const fetchRefunds = async () => {
      setLoading(true);
      // const token = localStorage.getItem('token');

      // if (!token) {
      //   navigate('/login');
      //   return;
      // }              

      try {            
        const response = await axios.get('http://localhost:5001/order/getrefunds');
        setRefunds(response.data.refunds);
      } catch (error) {
        console.error('Failed to fetch refunds:', error);
        setErrors('Failed to fetch refunds. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, [navigate, dialogOpen]);

  const handleToggleExpand = (refundId) => {
    setExpandedRefundId((prev) => (prev === refundId ? null : refundId));
  };

  const handleAcceptRefund = (refundId, Refund) => {
    // const token = localStorage.getItem('token');
    axios.post(`http://localhost:5001/order/refund/${refundId}/approve`, { product_name: Refund.product_name, refund_date: Refund.created_at, refund_quantity : Refund.quantity , refund_price : Refund.price_at_purchase, refund_weight: Refund.weight}, {
          
      })
      .then(response => {
          
          showToast('Refund approved successfully!', 'success');

          setRefunds((prevRefunds) =>
            prevRefunds.map((refund) =>
              refund.refund_request_id === refundId
                ? { ...refund, status: 'approved' }
                : refund
            )
          );
          console.log(response.data);
      })
      .catch(error => {
          if (error.response) {
              
              showToast(`Error: ${error.response.data.error}`, 'error');
              console.error(error.response);
          } else if (error.request) {
          
              showToast('No response from server. Please try again later.', 'error');
              console.error(error.request);
          } else {
              alert('Error setting up the request.');
              console.error('Error', error.message);
          }
      });
  };

  const handleRejectRefund = (refund) => {
    const Refund = {
      refund_id: refund.refund_request_id,  
      reason : refund.reason,          
      product_name: refund.product_name, // Name of the product
      quantity: refund.quantity,          // Quantity purchased
      price_at_purchase: parseFloat(refund.price_at_purchase),         // Total price in dollars
      weight: refund.weight,    
      imageUrl : refund.imageUrl,
      created_at : new Date(refund.created_at).toLocaleDateString(),
    };
    setSelectedRefund(Refund);
    setDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setDialogOpen(false);
    setSelectedRefund(null);
  };

  const confirmRejectRefund = (refundId) => {
    // Implement reject refund logic here
    console.log(`Refund ${refundId} rejected.`);
    // Update the refund status locally for demonstration
    setRefunds((prevRefunds) =>
      prevRefunds.map((refund) =>
        refund.refund_request_id === refundId
          ? { ...refund, status: 'rejected' }
          : refund
      )
    );
    closeRejectDialog();
  };

  // Function to handle filter change
  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  // Filter refunds based on the selected filter
  const filteredRefunds = refunds.filter((refund) => {
    if (filter === 'All') return true;
    return refund.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="refund-list__loading-container">
        <div className="refund-list__spinner">Loading...</div>
      </div>
    );
  }

  if (errors) {
    return (
      <div className="refund-list__error">
        <p>{errors}</p>
      </div>
    );
  }

  return (
    <div>

      <div
        className="orders-page__back-btn"
        onClick={() => navigate("/admin/sales_management")}
      >
        <img
          src={backIcon}
          alt="Back"
          className="orders-page__back-icon"
        />
        <span>Go Back</span>
      </div>
      <RefundChart/>
      
      {/* Filter Bar */}
      <div className="refund-list__filter-bar">
        <button
          className={`refund-list__filter-btn ${filter === 'All' ? 'active' : ''}`}
          onClick={() => handleFilterChange('All')}
        >
          All Refunds
        </button>
        <button
          className={`refund-list__filter-btn ${filter === 'Pending' ? 'active' : ''}`}
          onClick={() => handleFilterChange('Pending')}
        >
          Pending Refunds
        </button>
        <button
          className={`refund-list__filter-btn ${filter === 'Rejected' ? 'active' : ''}`}
          onClick={() => handleFilterChange('Rejected')}
        >
          Rejected Refunds
        </button>
        <button
          className={`refund-list__filter-btn ${filter === 'Approved' ? 'active' : ''}`}
          onClick={() => handleFilterChange('Approved')}
        >
          Approved Refunds
        </button>
      </div>
      
      <div className="refund-list__container">
        <h1 className="refund-list__title">Refund Requests</h1>
        {filteredRefunds.length === 0 && (
          <div className="refund-list__no-refunds">No refund requests available.</div>
        )}
        <div className="refund-list__list">
          {filteredRefunds.map((refund) => {
            const isExpanded = expandedRefundId === refund.refund_request_id;
            const statusLower = refund.status.toLowerCase();

            return (
              <div key={refund.refund_request_id} className={`refund-list__refund ${isExpanded ? 'expanded' : ''}`}>
                <div
                  className="refund-list__refund-header"
                  onClick={() => handleToggleExpand(refund.refund_request_id)}
                >
                  <div className="refund-list__refund-info">
                    <span className="refund-list__refund-id">Refund #{refund.refund_request_id}</span>
                    <span className="refund-list__refund-status">Status: {refund.status}</span>
                    <span className="refund-list__refund-request-date">
                      Requested on: {new Date(refund.request_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="refund-list__toggle-icon">
                    {isExpanded ? '-' : '+'}
                  </div>
                </div>
                {isExpanded && (
                  <div className="refund-list__refund-details">
                    <ul className="refund-list__items-list">
                      <li className="refund-list__item">
                        <img
                          src={`http://localhost:5001${refund.imageUrl}`}
                          alt={refund.product_name}
                          className="refund-list__item-image"
                          onError={(e) => e.target.src = 'http://localhost:5001/assets/images/products/default_mockup.png'}
                        />
                        <div className="refund-list__item-info">
                          <span className="refund-list__item-name">{refund.product_name}</span>
                          <span className="refund-list__item-quantity">Quantity: {refund.quantity}</span>
                          <span className="refund-list__item-price">Price at Purchase: {refund.price_at_purchase} TL</span>
                          <span className="refund-list__item-weight">Weight: {refund.weight}g</span>
                        </div>
                      </li>
                    </ul>
                    <div className="refund-list__additional-details">
                      <p>
                        <strong>User:</strong> {refund.first_name} {refund.last_name}
                      </p>
                      <p>
                        <strong>Order Date:</strong> {new Date(refund.created_at).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Reason for Refund:</strong>
                      </p>
                      <p>
                        {refund.reason}
                      </p>
                      {statusLower === 'rejected' && refund.reject_reason && (
                        <>
                          <p>
                            <strong>Reject Reason:</strong>
                          </p>
                          <p>
                            {refund.reject_reason}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="refund-list__actions">
                      {statusLower === 'pending' && (
                        <>
                          <button
                            className="refund-list__btn-accept"
                            onClick={() => handleAcceptRefund(refund.refund_request_id,refund)}
                          >
                            Accept Refund
                          </button>
                          <button
                            className="refund-list__btn-reject"
                            onClick={() => handleRejectRefund(refund)}
                          >
                            Reject Refund
                          </button>
                        </>
                      )}
                      {statusLower === 'approved' && (
                        <button className="refund-list__btn-approved" disabled>
                          <img src={successIcon} alt="Success" className="refund-list__btn-icon" />
                          Refund Approved
                        </button>
                      )}
                      {statusLower === 'rejected' && (
                        <button className="refund-list__btn-rejected" disabled>
                          <img src={refundRejected} alt="Rejected" className="refund-list__btn-icon" />
                          Refund Rejected
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <RefundReject
          Refund={selectedRefund}
          isOpen={dialogOpen}
          onClose={closeRejectDialog}
          onConfirm={confirmRejectRefund}
        />
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export default RefundList;


// Dummy data for testing
        // const dummyRefunds = [
        //   {
        //     refund_request_id: 'R001',
        //     status: 'pending',
        //     reason: 'Product damaged upon arrival.Product damaged upon arrival.Product damagedProduct damaged upon arrival.Product damaged upon arrival.Product damaged upon arrival.Product damaged upon arrival. upon arrival.Product damaged upon arrival.Product damaged upon arrival.',
        //     quantity: 2,
        //     price_at_purchase: 150.0,
        //     weight: 500,
        //     imageUrl: '/path/to/image1.jpg',
        //     product_name: 'Wireless Headphones',
        //     request_date: '2024-11-15',
        //     first_name: 'John',
        //     last_name: 'Doe',
        //     created_at: '2024-11-10',
        //   },
        //   {
        //     refund_request_id: 'R002',
        //     status: 'approved',
        //     reason: 'Changed mind.',
        //     quantity: 1,
        //     price_at_purchase: 80.0,
        //     weight: 200,
        //     imageUrl: '/path/to/image2.jpg',
        //     product_name: 'Bluetooth Speaker',
        //     request_date: '2024-11-20',
        //     first_name: 'Jane',
        //     last_name: 'Smith',
        //     created_at: '2024-11-18',
        //   },
        //   {
        //     refund_request_id: 'R003',
        //     status: 'rejected',
        //     reason: 'Warranty expired.',
        //     reject_reason: 'The warranty period has expired. Cannot process the refund.',
        //     quantity: 3,
        //     price_at_purchase: 300.0,
        //     weight: 750,
        //     imageUrl: '/path/to/image3.jpg',
        //     product_name: 'Smart Watch',
        //     request_date: '2024-11-25',
        //     first_name: 'Alice',
        //     last_name: 'Johnson',
        //     created_at: '2024-11-22',
        //   },
        // ];
        // setRefunds(dummyRefunds);