import "./BestSellingProducts.css";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast";
import { useState} from 'react';
import axios from 'axios';  

const BestSellingProducts = () => {
  const navigate = useNavigate();
  const products = [
    { id: 3, name: "Sunrise Over the Serengeti", rating: 5.0, reviewcount: 1, price: 450, image: "./product1.png", link : "./product/3" },
    { id: 5, name: "Bolivian Echoes", rating: 4.0, reviewcount: 1, price: 800, image: "./product2.png" ,link : "./product/5" },
    { id: 6, name: "The Midnight Drifter", rating: 5.0, reviewcount: 1, price: 60, image: "./product3.png", link : "./product/6" },
    { id: 3, name: "Sunrise Over the Serengeti", rating: 5.0, reviewcount: 1, price: 450, image: "./product1.png", link : "./product/3" },
  ];

  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
      setToast({ visible: true, message, type });
    };
  
    const handleCloseToast = () => {
      setToast({ visible: false, message: '', type: '' });
    };
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
                
                showToast('Product added to cart successfully!', 'success');
            } else {
                showToast('An error occurred. Please try again.', 'error');
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
                        showToast('Stock is insufficient for this product.', 'error');
                        return;
                    }
                    cart[existingProductIndex].quantity += 1;
                } else {
                    
                    if (newQuantity > stock) {
                        
                        showToast('Stock is insufficient for this product.', 'error');
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

                showToast('Product added to cart successfully!', 'success');
            } else {
                showToast('Failed to fetch product details. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            showToast('Failed to fetch product details. Please try again.', 'error');
        }
    }

};


  return (
    <div className="bestselling-container">
      <h2 className="bestselling-heading">Bestselling Products</h2>
      <div className="bestselling-list">
        {products.map((product) => (
          <div className="bestselling-product-card" key={product.id}>
            <a href="#" onClick={() => navigate(product.link)} className="bestselling-image-link" aria-label={product.name}>
              <div
                className="bestselling-image-wrapper"
                style={{ backgroundImage: `url(${product.image})` }}
              ></div>
            </a>
            <div className="bestselling-product-info">
              <p className="bestselling-name">
                <a href="#" onClick={(event) => event.preventDefault()} aria-label={product.name}>{product.name}</a>
              </p>
              <p className="bestselling-rating">⭐{product.rating.toFixed(1)} ({product.reviewcount})</p>
              <p className="bestselling-price">{product.price} TL</p>
            </div>
            <button className="bestselling-add-button" aria-label={`Add ${product.name} to cart`}  onClick={() => handleAddToCart(product.id)}   >+</button>
          </div>
        ))}
      </div>
      <p className="bestselling-view-all">
        <a href="#" onClick={() => navigate("/products")}>View All</a>
      </p>

      <Toast
              message={toast.message}
              type={toast.type}
              visible={toast.visible}
              onClose={handleCloseToast}
            />
    </div>
  );
};

export default BestSellingProducts;
