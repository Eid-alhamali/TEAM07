import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminSalesMgmt.css"; // Import the CSS for styling
import { useNavigate } from "react-router-dom";

const AdminSalesMgmt = () => {
    const [invoices, setInvoices] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/invoices", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setInvoices(response.data.invoices || []);
            } catch (error) {
                console.error("Error fetching invoices:", error);
                alert("Failed to fetch invoices.");
            }
        };

        fetchInvoices();
    }, []);

    return (
        <div className="admin-container">
            
            <h1 className="admin-title">Sales Management</h1>
            <p className="admin-description">
                Manage sales operations, invoices, and discounts.
            </p>
            <div className="sales-actions">
                <button className="action-button">Set Prices/Discounts</button>
                <button className="action-button">Notify Users About Discounts</button>
                <button className="action-button" onClick={() => navigate("/invoice_list")}>View Revenue/Profit Chart</button>
                <button className="action-button" onClick={() => navigate("/refund-list")}>Evaluate Refund Requests</button>
            </div>
            <h2>Invoices</h2>
            <div className="table-container">
                {invoices.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>{invoice.id}</td>
                                    <td>{invoice.customerName}</td>
                                    <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                    <td>${invoice.total}</td>
                                    <td>
                                        <button className="action-button">Print</button>
                                        <button className="action-button">Save as PDF</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No invoices available.</p>
                )}
            </div>
        </div>
    );
};

export default AdminSalesMgmt;