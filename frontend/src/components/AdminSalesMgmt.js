import "./AdminSalesMgmt.css"; // Import the CSS for styling
import { useNavigate } from "react-router-dom";

const AdminSalesMgmt = () => {
    const navigate = useNavigate();
    

    return (
        <div className="admin-container">
            
            <h1 className="admin-title">Sales Management</h1>
            <p className="admin-description">
                Manage sales operations, invoices, and discounts.
            </p>
            <div className="sales-actions">
                <button
                    className="action-button"
                    onClick={() => navigate("/admin/set_prices_discounts")}
                >
                    Set Prices/Discounts/Notify Users About Discounts
                </button>                
                <button
                    className="action-button"
                    onClick={() => navigate("/admin/invoice_list")}
                >
                    View Revenue/Profit Chart
                </button>
                <button className="action-button" onClick={() => navigate("/admin/refund-list")}>Evaluate Refund Requests</button>
            </div>
            
        </div>
    );
};

export default AdminSalesMgmt;