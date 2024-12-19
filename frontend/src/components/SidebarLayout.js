
import { Link } from 'react-router-dom';
import './SidebarLayout.css'; 
import PropTypes from 'prop-types';


const SidebarLayout = ({ children }) => {



    const handleLogout = () => {
        // Delete the token from localStorage
        localStorage.removeItem('token');
        window.location.href = '/login'; 

      };
  return (
    <div className="sl-sidebar-layout">
      <aside className="sl-sidebar">
        <div className="sl-profile-section">
          <img
            src="./profile.png"
            alt="Profile"
            className="sl-profile-pic"
          />
          <h2 className="sl-profile-name">Arya Bayhan</h2>
        </div>
        <nav className="sl-nav">
          <ul className="sl-nav-list">
            <li className="sl-nav-item">
              <Link to="/my-orders" className="sl-nav-link">My Orders</Link>
            </li>
            <li className="sl-nav-item">
              <Link to="/edit-profile" className="sl-nav-link">Edit Profile</Link>
            </li>
            <li className="sl-nav-item">
              <Link  className="sl-nav-link" onClick={handleLogout}>Log out</Link>
            </li>
            
          </ul>
        </nav>
      </aside>
      <main className="sl-content">
        {children}
      </main>
    </div>
  );
};

SidebarLayout.propTypes = {
    children: PropTypes.node.isRequired, // Ensure 'children' is passed and can be any renderable content
  };
export default SidebarLayout;
