import { useState, useEffect } from 'react'; // Import useState and useEffect
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import Mnovo from './components/Mnovo';
import Card from './components/Card';
import ProductsPage from './components/ProductsPage';
import LoginRegister from './components/LoginRegister';
import { CartProvider } from './CartContext'; // Import CartProvider

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
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/mnovo" element={<Mnovo />} />
          <Route path="/card" element={<Card />} />
          <Route path="/products" element={<ProductsPage products={products} />} /> 
          <Route path="/loginregister" element={<LoginRegister/>} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
