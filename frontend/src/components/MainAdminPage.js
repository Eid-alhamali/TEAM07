import './MainAdminPage.css'; // Import the CSS for styling

const MainAdminPage = () => {
    const role = sessionStorage.getItem("role"); // Retrieve role from localStorage
    console.log("Role in sessionStorage:", role);


    const handleRestrictedAccess = () => {
        alert("You are not authorized to access this section.");
    };

    return (
        <div className="main-admin-container">
            <h1>Admin Panel</h1>
            <p>Welcome to the admin panel. Use the navigation to manage the application.</p>
            <div className="admin-actions">
                <button
                    className="admin-button"
                    onClick={
                        role === "product_manager"
                            ? () => (window.location.href = '/admin/product_management')
                            : handleRestrictedAccess
                    }
                >
                    Product Manager
                </button>
                <button
                    className="admin-button"
                    onClick={
                        role === "sales_manager"
                            ? () => (window.location.href = '/admin/sales_management')
                            : handleRestrictedAccess
                    }
                >
                    Sales Manager
                </button>
            </div>
        </div>
    );
};

export default MainAdminPage;