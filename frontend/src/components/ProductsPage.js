//src/components/ProductsPage.js

import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import { CartContext } from '../CartContext';
import FilterPanel from './FilterPanel';
import { useLocation, Link } from 'react-router-dom'; // Import Link
import axios from 'axios';
import './ProductsPage.css';  

const ProductsPage = () => {
  const { addToCart } = useContext(CartContext);
  const [filters, setFilters] = useState({
    type: '',
    region: '',
    stature: '',
    beanSize: '',
    optimalAltitude: '',
    leafTipColor: '',
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters); // Temporary filters to apply on confirmation
  const [products, setProducts] = useState([]);
  const location = useLocation();

  // Fetch products data from backend based on location.search
  useEffect(() => {
    const fetchProducts = async () => {
      const query = new URLSearchParams(location.search);
      try {
        const response = await axios.get(`http://localhost:5001/api/products?${query.toString()}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, [location.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setIsPanelOpen(false);
  };

  const clearFilters = () => {
    setTempFilters({
      type: '',
      region: '',
      stature: '',
      beanSize: '',
      optimalAltitude: '',
      leafTipColor: '',
    });
  };
  // Generate breadcrumb from location.search
  const generateBreadcrumb = () => {
    const query = new URLSearchParams(location.search);
    const breadcrumbs = [];
    query.forEach((value, key) => {
      let label;
      switch (key) {
        case 'roast_level':
          label = 'Roast Level';
          break;
        case 'bean_type':
          label = 'Bean Type';
          break;
        case 'grind_type':
          label = 'Grind Type';
          break;
        case 'caffeine_content':
          label = 'Caffeine Content';
          break;
        case 'origin':
          label = 'Origin';
          break;
        default:
          label = key;
      }
      breadcrumbs.push({ label, value });
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumb();

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);
  

  return (
    <div className="products-page">
      <Navbar />
      <h1>Our Coffee Products</h1>

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <Link to="/products">All Products</Link>
         {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            {' > '}
            <span>{crumb.label}: </span>
            <span>{crumb.value}</span>
          </span>
        ))}
      </div>

      {/* Filter Button */}
      <button onClick={openPanel} className="filter-button">
        Filter
      </button>

      {/* Filter Panel */}
      {isPanelOpen && (
        <FilterPanel
          filters={tempFilters}
          handleFilterChange={handleFilterChange}
          applyFilters={applyFilters}
          closePanel={closePanel}
          clearFilters={clearFilters}
        />
      )}

      {/* Product List */}

      <div className="coffee-list">
        {products.length > 0 ? (
          products.map((coffee) => (
            <CoffeeCard key={coffee.variant_id} coffee={coffee} addToCart={addToCart} />
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
};

const CoffeeCard = ({ coffee, addToCart }) => {

  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = (e) => {
      e.preventDefault(); // Prevent page navigation
      if (quantity > coffee.stock) {
          alert('Not enough stock available!');
          return;
      }
      addToCart(coffee.name, coffee.variant_id, quantity, coffee.price, coffee.weight_grams);
      alert(`${quantity} item(s) of ${coffee.name} added to cart.`);
  };

  return (
      <Link to={`/product/${coffee.variant_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="coffee-card">
              <div className="image-placeholder"></div>
              <h3>{coffee.name}</h3>
              <p>Weight: {coffee.weight_grams}g</p>
              <p>Price: ${coffee.price}</p>
              <p>Stock Available: {coffee.stock}</p>
              <div className="cart-controls">
                  <button onClick={(e) => e.preventDefault(handleDecrement())}>-</button>
                  <span>{quantity}</span>
                  <button onClick={(e) => e.preventDefault(handleIncrement())}>+</button>
                  <button onClick={handleAddToCart}>Add to Cart</button>
              </div>
          </div>
      </Link>
  );
};

CoffeeCard.propTypes = {
  coffee: PropTypes.shape({
    name: PropTypes.string.isRequired,
    weight_grams: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    variant_id: PropTypes.number.isRequired,
  }).isRequired,
  addToCart: PropTypes.func.isRequired,
};


export default ProductsPage;
