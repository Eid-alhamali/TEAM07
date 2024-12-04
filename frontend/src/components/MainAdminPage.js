import './MainAdminPage.css'; // Import the CSS for styling

const MainAdminPage = () => {
    return (
        <div className="main-admin-container">
            <h1>Admin Panel</h1>
            <p>Welcome to the admin panel. Use the navigation to manage the application.</p>
            <div className="admin-actions">
                
                <button className="admin-button" onClick={() => window.location.href = '/admin/review_management'}>View Reviews</button>
                </div>
        </div>
    );
};

export default MainAdminPage;