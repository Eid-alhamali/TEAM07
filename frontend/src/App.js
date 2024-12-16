// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import Cart from './components/Cart';
import ProductsPage from './components/ProductsPage/ProductsPage';
import ProductDetail from './components/ProductDetail/ProductDetail'; // Import ProductDetail
import { CartProvider } from './CartContext'; // Import CartProvider
import Navbar from './components/Navbar';
import LoginForm from "./components/LoginForm";
import Register from "./components/Register";
import WriteReview from './components/WriteReview'; 
import ReviewAdminPage from './components/ReviewAdminPage';
import MainAdminPage from './components/MainAdminPage'; 
import About from './components/About';
import AdminLoginPage from './components/AdminLoginPage'; 
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
            <Route path="/search" element={<ProductsPage />} />  
            <Route path="/product/:variant_id" element={<ProductDetail />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<Register/>} />
            <Route path="/reviews/write/:product_id" element={<WriteReview />} />
            <Route path="/admin/review_management" element={<ReviewAdminPage />} />
            <Route path="/admin/main_page" element={<MainAdminPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;