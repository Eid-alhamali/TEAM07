// src/App.js

import { useState, useEffect } from 'react'; // Import useState and useEffect
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import Mnovo from './components/Mnovo';
import Card from './components/Card';
import ProductsPage from './components/ProductsPage';
import LoginRegister from './components/LoginRegister';
import ProductDetail from './components/ProductDetail'; // Import ProductDetail
import { CartProvider } from './CartContext'; // Import CartProvider

import './App.css'; 

function App() {
  const [products, setProducts] = useState([]); // Correctly define products and setProducts
  
  useEffect(() => {
    // Fetch data from the backend API
    axios.get('http://localhost:5000/api/products')
      .then(response => setProducts(response.data)) // Use setProducts here
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  // Use the products state, for example by passing it to a component
  return (
    <CartProvider> {/* Wrap the app with CartProvider */}
      <Router>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/mnovo" element={<Mnovo />} />
            <Route path="/card" element={<Card />} />
            <Route path="/products" element={<ProductsPage products={products} />} /> 
            <Route path="/product/:variant_id" element={<ProductDetail />} />
            <Route path="/loginregister" element={<LoginRegister/>} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;