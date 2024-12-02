// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import Cart from './components/Cart';
import ProductsPage from './components/ProductsPage';
import LoginRegister from './components/LoginRegister';
import ProductDetail from './components/ProductDetail'; // Import ProductDetail
import { CartProvider } from './CartContext'; // Import CartProvider
import Navbar from './components/Navbar';

import './index.css'; 

function App() {
  // Use the products state, for example by passing it to a component
  return (
    <CartProvider> {/* Wrap the app with CartProvider */}
      <Router>
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/products" element={<ProductsPage />} /> 
            <Route path="/product/:variant_id" element={<ProductDetail />} />
            <Route path="/loginregister" element={<LoginRegister/>} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;