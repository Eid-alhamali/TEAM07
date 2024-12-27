import { useNavigate } from "react-router-dom";
import "./OrdersPage.css";

const AdminProductMgmt = () => {
    
    const navigate = useNavigate();

    
    return (
        <div className="admin-container">
            <h1 className="admin-title">Product Management</h1>
            <p className="admin-description">
                Manage products, categories, and orders.
            </p>
            <div className="product-actions">
                <button
                    className="action-button"
                    onClick={() => window.location.href = "/admin/review_management"}
                >
                    View Reviews
                </button>
                <button
                    className="action-button"
                    onClick={() => navigate("/admin/view_products")}
                >
                    View Products
                </button>
                <button
                    className="action-button"
                    onClick={() => navigate("/admin/categories")}
                >
                    View Categories
                </button>
                <button
                    className="action-button"
                    onClick={() => navigate("/admin/delivery_list")}
                >
                    View Delivery List
                </button>
            </div>

            </div>

    );
};

export default AdminProductMgmt;
