import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDeliveryPage.css";
import pdfIcon from "../assets/images/icons/pdf.png";

const AdminDeliveryPage = () => {
    const [orders, setOrders] = useState([]);
    const [currentStatus, setCurrentStatus] = useState("processing");
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadError, setDownloadError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/admin/login");
                return;
            }

            try {
                const response = await axios.get("http://localhost:5001/order/getorders", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setOrders(response.data.orders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        };

        fetchOrders();
    }, [navigate]);

    const handleStatusChange = (status) => {
        setCurrentStatus(status);
        setExpandedOrderId(null); // Collapse all orders when switching status
    };

    const handleToggleExpand = (orderId) => {
        setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
    };

    const handleDownloadInvoice = async (orderId) => {
        setDownloadLoading(true);
        setDownloadError("");
        const token = localStorage.getItem("token");

        try {
            const response = await axios.get(`http://localhost:5001/order/getinvoice/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to download invoice:", error);
            setDownloadError("Failed to download invoice. Please try again.");
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        const token = localStorage.getItem("token");
        try {
            await axios.put(
                `http://localhost:5001/order/updatestatus/${orderId}`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.order_id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update order status. Please try again.");
        }
    };

    const handleCancelOrder = async (orderId) => {
        await handleStatusUpdate(orderId, "canceled");
    };

    const handleAcceptOrder = async (orderId, currentStatus) => {
        const nextStatus = currentStatus === "processing" ? "in-transit" : "delivered";
        await handleStatusUpdate(orderId, nextStatus);
    };

    const handleSendDelivery = async (orderId) => {
        await handleStatusUpdate(orderId, "delivered");
    };

    // Count orders for each status
    const statusCounts = {
        processing: orders.filter((order) => order.status === "processing").length,
        "in-transit": orders.filter((order) => order.status === "in-transit").length,
        delivered: orders.filter((order) => order.status === "delivered").length,
        canceled: orders.filter((order) => order.status === "canceled").length,
    };

    const filteredOrders = orders.filter((order) => order.status === currentStatus);

    return (
        <div className="admin-delivery-container">
            <div className="sidebar">
                <button
                    className="go-back-button"
                    onClick={() => navigate("/admin/product_management")}
                >
                    Go Back
                </button>
                {["processing", "in-transit", "delivered", "canceled"].map((status) => (
                    <div
                        key={status}
                        className={`sidebar-option ${
                            currentStatus === status ? "active" : ""
                        }`}
                        onClick={() => handleStatusChange(status)}
                    >
                        {status.toUpperCase()} ({statusCounts[status]})
                    </div>
                ))}
            </div>
            <div className="main-content-deliveries">
                <h2 className="admin-title">{currentStatus.toUpperCase()} Orders</h2>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                        const isExpanded = expandedOrderId === order.order_id;

                        return (
                            <div
                                key={order.order_id}
                                className={`orders-page__order ${isExpanded ? "expanded" : ""}`}
                            >
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
                                        <span className="orders-page__customer-id">Customer ID: {order.customer_id}</span>
                                    </div>
                                    <div className="orders-page__toggle-icon">{isExpanded ? "-" : "+"}</div>
                                </div>
                                {isExpanded && (
                                    <div className="orders-page__order-details">
                                        <ul className="orders-page__items-list">
                                            {order.order_items.map((item, idx) => (
                                                <li key={idx} className="orders-page__item">
                                                    <img
                                                        src={`http://localhost:5001${item.image_url}`}
                                                        alt={item.name}
                                                        className="orders-page__item-image"
                                                    />
                                                    <div className="orders-page__item-info">
                                                        <span className="orders-page__item-name">{item.name}</span>
                                                        <span className="orders-page__item-weight">Weight: {item.weight_grams}g</span>
                                                        <span className="orders-page__item-price">
                                                            Price: {item.price_at_purchase} TL
                                                        </span>
                                                        <span className="orders-page__item-quantity">Quantity: {item.quantity}</span>
                                                        <span className="orders-page__item-product-id">Product ID: {item.product_id}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="orders-page__actions">
                                            {order.status === "processing" && (
                                                <>
                                                    <button
                                                        className="orders-page__btn-decline"
                                                        onClick={() => handleCancelOrder(order.order_id)}
                                                    >
                                                        Decline
                                                    </button>
                                                    <button
                                                        className="orders-page__btn-accept"
                                                        onClick={() => handleAcceptOrder(order.order_id, order.status)}
                                                    >
                                                        Accept
                                                    </button>
                                                </>
                                            )}
                                            {order.status === "in-transit" && (
                                                <button
                                                    className="orders-page__btn-send-delivery"
                                                    onClick={() => handleSendDelivery(order.order_id)}
                                                >
                                                    Send Delivery
                                                </button>
                                            )}
                                            {order.status === "delivered" && (
                                                <span className="orders-page__status-delivered">Delivered</span>
                                            )}
                                            {order.status === "canceled" && (
                                                <span className="orders-page__status-canceled">Cancelled</span>
                                            )}
                                        </div>
                                        <div className="orders-page__invoice-section">
                                            <div className="orders-page__invoice-text">
                                                <h4>Invoice</h4>
                                                <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className="orders-page__pdf-wrapper">
                                                <img
                                                    src={pdfIcon}
                                                    alt="Download Invoice"
                                                    className={`orders-page__pdf-icon ${
                                                        downloadLoading ? "disabled" : ""
                                                    }`}
                                                    onClick={() => !downloadLoading && handleDownloadInvoice(order.order_id)}
                                                />
                                                {downloadLoading && (
                                                    <span className="orders-page__loading-text">Downloading...</span>
                                                )}
                                            </div>
                                            {downloadError && (
                                                <div className="orders-page__download-error">
                                                    <p>{downloadError}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="no-orders-message">No orders with {currentStatus} status.</p>
                )}
            </div>
        </div>
    );
};

export default AdminDeliveryPage;
