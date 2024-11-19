// src/components/Navbar.js

import { Link } from 'react-router-dom';
import './Navbar.css';
import compressoLogo from '../img/COMPRESSO.png'; 
import shopIcon from '../img/shop.png'; 
import userIcon from '../img/user.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <img src={compressoLogo} alt="Compresso Logo" className="navbar-logo" /> 
      <div className="navbar-center"> 
        <ul className="navbar-links">
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/products">PRODUCTS</Link></li> {/* Update the link here */}
          <li><Link to="/mnovo">BEANS</Link></li>
          <li><a href="#flavours">FLAVOURS</a></li>
          <li><a href="#brews">BREWS</a></li>
          <li><a href="#about">ABOUT</a></li>
          <li><a href="#contact">CONTACT</a></li>
        </ul>
      </div>
      <div>
        <img src={userIcon} alt="User Icon" className="user-icon" />
        <Link to="/card"><img src={shopIcon} alt="Shop Icon" className="shop-icon" /></Link>
      </div>
    </nav>
  );
};

export default Navbar;
