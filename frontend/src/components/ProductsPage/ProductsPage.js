import { useState, useEffect } from "react";
import FilterPanel from "./FilterPanel";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "./ProductCard";
import "./ProductsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState("asc");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch products data based on filters and sort order
  useEffect(() => {
    const fetchProducts = async () => {
      const query = new URLSearchParams(location.search);

      try {
        let response;
        if (location.pathname.includes('/search')) {
          response = await axios.get(`http://localhost:5001/api/search?${query.toString()}`);
          
          const productsData = response.data.data.map(product => ({
            ...product,
            price: Number(product.price),
          }));
          setProducts(productsData);

        } else {
          response = await axios.get(`http://localhost:5001/api/products?${query.toString()}`);
          setProducts(response.data);
          const productsData = response.data.map(product => ({
            ...product,
            price: Number(product.price),
          }));
          setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [location.search]);

  // Handle sort option change
  const handleSortChange = (event) => {
    const newSortOption = event.target.value;
    setSortOption(newSortOption);

    const queryParams = new URLSearchParams(location.search);
    queryParams.set("sort_by", "price");
    queryParams.set("sort_order", newSortOption);
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  // Apply filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    const queryParams = new URLSearchParams(location.search);

    Object.entries(newFilters).forEach(([key, value]) => {
      value ? queryParams.set(key, value) : queryParams.delete(key);
    });

    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  // Generate breadcrumb from location.search
  const generateBreadcrumb = () => {
    const query = new URLSearchParams(location.search);
    const breadcrumbs = [];
    query.forEach((value, key) => {
      if (key === 'search') {
        breadcrumbs.push({ label: 'Search', value });
      } else if (key === 'sort_by' || key === 'sort_order') {
        // Skip sort parameters in breadcrumb
      } else {
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
      }
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumb();
  console.log(breadcrumbs);
  const handleAddToCart = (product) => {
    alert(`${product.name} has been added to the cart!`);
  };


  return (
    <div className="products-page">
      <h1 className="page-title">Our Coffee Products</h1>
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <a href="/products">All Products</a>
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            {' / '}
            <span>{crumb.label}: </span>
            <span>{crumb.value}</span>
          </span>
        ))}
      </div>
      {/* Sorting and Filtering */}
      <div className="actions">
        <button onClick={() => setIsPanelOpen(true)} className="filter-button">
          Filter
        </button>
        <select value={sortOption} onChange={handleSortChange} className="sort-dropdown">
          <option value="asc">Lowest to Highest Price</option>
          <option value="desc">Highest to Lowest Price</option>
        </select>
      </div>

      {isPanelOpen && (
        <FilterPanel
          filters={filters}
          applyFilters={applyFilters}
          closePanel={() => setIsPanelOpen(false)}
        />
      )}

      {/* Product Grid */}
      <div className="products-grid">
        {products.length ? (
          products.map((product) => (
            <ProductCard
              key={product.variant_id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))
        ) : (
          <p className="no-products">No products available.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
