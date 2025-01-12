import { useState, useEffect } from "react";
import FilterPanel from "./FilterPanel";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductCard from "./ProductCard";
import "./ProductsPage.css";
import useFetchCategories from "../../hooks/userFetchCategories";

const ProductsPage = () => {
  const { categories } = useFetchCategories();
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState({ field: 'price', order: 'asc' });
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
    const [field, order] = event.target.value.split('|');

    // Update local state
    setSortOption({ field, order });
  
    // Build query params
    const queryParams = new URLSearchParams(location.search);
    queryParams.set('sort_by', field);
    queryParams.set('sort_order', order);
  
    // Navigate with the new sorting parameters
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
          case 'category_id':
            label = 'Category';
            break;
          default:
            label = key;
        }
        if (key === 'category_id' && categories[value - 1]) {
          breadcrumbs.push({ label: 'Category', value: categories[value - 1].name });
        } else {
          breadcrumbs.push({ label, value });
        }
      }
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumb();
  console.log(breadcrumbs);
  
  const handleAddToCart= async (variantId) => {
        
    const token = localStorage.getItem('token');
    if(token){

        try {
            // Send a POST request to the backend with the token and variant details
            const response = await axios.post('http://localhost:5001/api/cart/add-to-cart', 
                {variantId}, // Payload
                {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    }
                }
            );

            
            if (response.status === 200) {
                alert('Product added to cart successfully!');
            } else {
                alert('Failed to add product to cart. Please try again.');
            }
        } catch (error) {
            console.error('Error adding product to cart:', error);
            alert('An error occurred. Please try again.');
        }
    }


    else {
        
        try {
            
            const response = await axios.get(
                `http://localhost:5001/api/cart/variant/${variantId}`
            );

            if (response.status === 200) {
                const productDetails = response.data;

               
                const { product_name, price, weight, image, stock, quantity: newQuantity } = productDetails;

                
                const cart = JSON.parse(localStorage.getItem('cart')) || [];

                
                const existingProductIndex = cart.findIndex(
                    (item) => item.variantId === variantId
                );

                if (existingProductIndex > -1) {
                    
                    const existingProduct = cart[existingProductIndex];
                    if (existingProduct.quantity + 1 > stock) {
                        alert('Stock is insufficient to add more of this product.');
                        return;
                    }
                    cart[existingProductIndex].quantity += 1;
                } else {
                    
                    if (newQuantity > stock) {
                        alert('Stock is insufficient for this product.');
                        return;
                    }
                    cart.push({
                        variantId,
                        product_name,
                        price,
                        weight,
                        image,
                        quantity: 1,
                    });
                }

                
                localStorage.setItem('cart', JSON.stringify(cart));

                alert('Product added to cart successfully!');
            } else {
                alert('Failed to fetch product details. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            alert('An error occurred while adding the product. Please try again.');
        }
    }

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
        <select value={`${sortOption.field}|${sortOption.order}`} onChange={handleSortChange} className="sort-dropdown">
          <option value="price|asc">Lowest to Highest Price</option>
          <option value="price|desc">Highest to Lowest Price</option>
          <option value="average_rating|desc">Most Popular</option>
          <option value="average_rating|asc">Least Popular</option>
          <option value="stock|desc">Highest Stock</option>
          <option value="stock|asc">Lowest Stock</option>
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
