import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import compressoLogo from '../assets/images/icons/logo-dark.svg';
import shopIcon from '../assets/images/icons/cart-dark.svg';
import userIcon from '../assets/images/icons/user-dark.svg';
import searchIcon from '../assets/images/icons/icons8-search.svg';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Handle search input changes
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="navbar">
      <img src={compressoLogo} alt="Compresso Logo" className="navbar-logo" />
      <div className="navbar-center">
        <ul className="navbar-links">
          <li><Link to="/">HOME</Link></li>
          <li 
            className="dropdown" 
            onMouseEnter={() => setDropdownOpen(true)} 
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link to="/products" className="dropdown-toggle">PRODUCTS</Link>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-column">
                  <h4>Roast Levels</h4>
                  <ul>
                    <li><Link to="/products?roast_level=Light">Light</Link></li>
                    <li><Link to="/products?roast_level=Medium">Medium</Link></li>
                    <li><Link to="/products?roast_level=Dark">Dark</Link></li>
                    <li><Link to="/products?roast_level=French">French</Link></li>
                    <li><Link to="/products?roast_level=Espresso">Espresso</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Bean Types</h4>
                  <ul>
                    <li><Link to="/products?bean_type=Arabica">Arabica</Link></li>
                    <li><Link to="/products?bean_type=Robusta">Robusta</Link></li>
                    <li><Link to="/products?bean_type=Liberica">Liberica</Link></li>
                    <li><Link to="/products?bean_type=Blend">Blend</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Grind Types</h4>
                  <ul>
                    <li><Link to="/products?grind_type=Whole%20Bean">Whole Bean</Link></li>
                    <li><Link to="/products?grind_type=Ground">Ground</Link></li>
                    <li><Link to="/products?grind_type=Other">Other</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Processing Methods</h4>
                  <ul>
                    <li><Link to="/products?processing_method=Washed">Washed</Link></li>
                    <li><Link to="/products?processing_method=Natural">Natural</Link></li>
                    <li><Link to="/products?processing_method=Honey-processed">Honey-processed</Link></li>
                    <li><Link to="/products?processing_method=Other">Other</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Caffeine Content</h4>
                  <ul>
                    <li><Link to="/products?caffeine_content=High">High</Link></li>
                    <li><Link to="/products?caffeine_content=Decaf">Decaf</Link></li>
                    <li><Link to="/products?caffeine_content=Half-Caf">Half-Caf</Link></li>
                  </ul>
                </div>
              </div>
            )}
          </li>
          <li><Link to="/about">ABOUT US</Link></li>
          <li><a href="#contact">CONTACT</a></li>
        </ul>
      </div>
      <div className="navbar-right">
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <img src={searchIcon} alt="Search" className="search-icon" />
          </button>
        </form>
        <Link to="/login"><img src={userIcon} alt="User Icon" className="user-icon" /></Link>
        <Link to="/cart"><img src={shopIcon} alt="Shop Icon" className="shop-icon" /></Link>
      </div>
    </nav>
  );
};

export default Navbar;
