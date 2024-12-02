import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import compressoLogo from '../assets/images/icons/logo-dark.svg';
import shopIcon from '../assets/images/icons/cart-dark.svg';
import userIcon from '../assets/images/icons/user-dark.svg';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);


  return (
    <nav className="navbar">
      <img src={compressoLogo} alt="Compresso Logo" className="navbar-logo" />
      <div className="navbar-center">
        <ul className="navbar-links">
          <li><Link to="/">HOME</Link></li>
          <li className="dropdown" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <Link to="/products" className="dropdown-toggle">PRODUCTS</Link>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-column">
                  <h4>Roast Level</h4>
                  <ul>
                    <li><Link to="/products?roast_level=Light">Light</Link></li>
                    <li><Link to="/products?roast_level=Medium">Medium</Link></li>
                    <li><Link to="/products?roast_level=Espresso">Espresso</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Bean Type</h4>
                  <ul>
                    <li><Link to="/products?bean_type=Arabica">Arabica</Link></li>
                    <li><Link to="/products?bean_type=Blend">Blend</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Grind Type</h4>
                  <ul>
                    <li><Link to="/products?grind_type=Whole%20Bean">Whole Bean</Link></li>
                    <li><Link to="/products?grind_type=Ground">Ground</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Caffeine Content</h4>
                  <ul>
                    <li><Link to="/products?caffeine_content=High">High</Link></li>
                    <li><Link to="/products?caffeine_content=Decaf">Decaf</Link></li>
                  </ul>
                </div>
                <div className="dropdown-column">
                  <h4>Origin</h4>
                  <ul>
                    <li><Link to="/products?origin=Colombia">Colombia</Link></li>
                    <li><Link to="/products?origin=Ethiopia">Ethiopia</Link></li>
                    <li><Link to="/products?origin=Multiple%20Origins">Blends</Link></li>
                  </ul>
                </div>
              </div>
            )}
          </li>
          <li><a href="#about">ABOUT</a></li>
          <li><a href="#contact">CONTACT</a></li>
        </ul>
      </div>
      <div>
        <Link to="/loginregister"><img src={userIcon} alt="User Icon" className="user-icon" /></Link>
        <Link to="/cart"><img src={shopIcon} alt="Shop Icon" className="shop-icon" /></Link>
      </div>
    </nav>
  );
};

export default Navbar;
