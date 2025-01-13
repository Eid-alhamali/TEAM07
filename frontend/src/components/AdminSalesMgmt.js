
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
                <button className="action-button">Set Prices/Discounts</button>
                <button className="action-button">Notify Users About Discounts</button>
                <button className="action-button" onClick={() => navigate("/invoice_list")}>View Invoices/Profit Chart</button>
                <button className="action-button" onClick={() => navigate("/refund-list")}>Evaluate Refund Requests</button>
            </div>
            
        </div>
    );
};

export default AdminSalesMgmt;