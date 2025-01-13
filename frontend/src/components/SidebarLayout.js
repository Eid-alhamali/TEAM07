
import { Link, useNavigate } from 'react-router-dom';
import  { useState, useEffect } from 'react';
import axios from 'axios';
import './SidebarLayout.css'; 
import PropTypes from 'prop-types';


const SidebarLayout = ({ children }) => {

  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
      // Retrieve the JWT token from localStorage (or from wherever you store it)
      const token = localStorage.getItem('token'); // Example, adjust if you store it elsewhere

      if (!token) {
         navigate('/login'); 
         return;
      }

      // Fetch full name from the API
      axios.get('http://localhost:5001/auth/user-name', {
          headers: {
              'Authorization': `Bearer ${token}` // Include the token in the Authorization header
          }
      })
      .then(response => {
          setFullName(response.data.full_name);
          
      })
      .catch(err => {
          if(err){setError('Error fetching data');}
         
      });
  }, [navigate]); // Empty dependency array to run only once when component mounts


  if (error) {
      return <div>{error}</div>;
  }

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
          <h2 className="sl-profile-name">{fullName}</h2>
        </div>
        <nav className="sl-nav">
          <ul className="sl-nav-list">
            <li className="sl-nav-item">
              <Link to="/my-orders" className="sl-nav-link">My Orders</Link>
            </li>
            <li className="sl-nav-item">
              <Link to="/profile_page" className="sl-nav-link">Edit Profile</Link>
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
