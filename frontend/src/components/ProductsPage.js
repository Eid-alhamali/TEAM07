//src/components/ProductsPage.js

import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import Navbar from './Navbar';
import { CartContext } from '../CartContext';
import FilterPanel from './FilterPanel'; // Import FilterPanel component
import './ProductsPage.css';

const ProductsPage = () => {
  const { addToCart } = useContext(CartContext);
  const [coffees, setCoffees] = useState([]);
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

  // Fetch coffee data from the backend
  useEffect(() => {
    const fetchCoffees = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/products');
        const data = await response.json();
        setCoffees(data);
      } catch (error) {
        console.error('Error fetching coffee data:', error);
      }
    };

    fetchCoffees();
  }, []);

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

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);

  const filteredCoffees = coffees.filter((coffee) =>
    Object.keys(filters).every((key) =>
      filters[key] ? coffee[key] === filters[key] : true
    )
  );

  return (
    <div className="products-page">
      <Navbar />
      <h2>Our Coffee Products</h2>

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

      {/* Filtered Coffee List */}
      <div className="coffee-list">
        {filteredCoffees.map((coffee) => (
          <CoffeeCard key={coffee.product_id} coffee={coffee} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

const CoffeeCard = ({ coffee, addToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (quantity > coffee.stock) {
      alert('Not enough stock available!');
      return;
    }
    addToCart(coffee.name, coffee.variant_id, quantity, coffee.price, coffee.weight_grams); // Pass weight_grams here
    alert(`${quantity} item(s) of ${coffee.name} (Weight: ${coffee.weight_grams}g) added to cart.`);
  };

  return (
    <div className="coffee-card">
      <div className="image-placeholder"></div>
      <h3>{coffee.name}</h3>
      <p>Weight: {coffee.weight_grams}g</p>
      <p>Price: ${coffee.price}</p>
      <p>Stock Available: {coffee.stock}</p>
      <div className="cart-controls">
        <button onClick={handleDecrement}>-</button>
        <span>{quantity}</span>
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleAddToCart} className="add-to-cart-button">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

CoffeeCard.propTypes = {
  coffee: PropTypes.shape({
    name: PropTypes.string.isRequired,
    weight_grams: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired, // Add stock here
    variant_id: PropTypes.number.isRequired,
  }).isRequired,
  addToCart: PropTypes.func.isRequired,
};

export default ProductsPage;
