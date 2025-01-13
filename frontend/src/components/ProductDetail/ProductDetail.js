import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProductDetail from "../../hooks/useProductDetail";
import ProductImagesCarousel from "./ProductImagesCarousel";
import ProductInfoTable from "./ProductInfoTable";
import ReviewsSection from "./ReviewsSection";
import ProductInfoPanel from "./ProductInfoPanel";
import { toggleWishlist, getWishlistStatus } from '../../hooks/useWishlist'; // Import toggleWishlist
import axios from "axios";
import Toast from '../Toast';

import "./ProductDetail.css";

const ProductDetail = () => {
    const { variant_id } = useParams();
    const navigate = useNavigate();

    // Fetch product details using the custom hook
    const { product, variants, reviews, averageRating, error } = useProductDetail(variant_id);

    // State for quantity, selected variant, and image navigation
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [wishlistFilled, setWishlistFilled] = useState(false);


    const [toast, setToast] = useState({ visible: false, message: '', type: '' });

    const showToast = (message, type) => {
      setToast({ visible: true, message, type });
    };
  
    const handleCloseToast = () => {
      setToast({ visible: false, message: '', type: '' });
    };


    // Set default variant when product or variants change, and fetch wishlist status
    useEffect(() => {
        if (variants.length > 0 && !selectedVariant) {
            const initialVariant = variants.find(
                (variant) => variant.variant_id === parseInt(variant_id)
            );
            setSelectedVariant(initialVariant || variants[0]); // Fallback to the first variant if not found
        }
        // Fetch wishlist status
        const fetchWishlistStatus = async () => {
            try {
                const status = await getWishlistStatus(variant_id);
                setWishlistFilled(status);
            } catch (error) {
                console.error(
                    `Error fetching wishlist status for variant_id ${variant_id}:`,
                    error
                );
            }
        };

        fetchWishlistStatus();
    }, [variants, variant_id, selectedVariant]);

    // Add to Cart Handler
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
                } 
                else if(response.status === 400){

                    showToast('Stock is insufficient for this product.', 'error');

                }
                
                else {
                    showToast('Stock is insufficient for this product.', 'error');
                }
            } catch (error) {
                console.error('Error adding product to cart:', error);
                showToast('Stock is insufficient for this product.', 'error');
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



    
    // Wishlist Button Handler
    const handleWishlistClick = () => {
        toggleWishlist(variant_id, wishlistFilled, setWishlistFilled); 
    };

    // Write Review Navigation
    const handleWriteReviewClick = () => {
        if (product?.product_id) {
            navigate(`/reviews/write/${product.product_id}`);
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!product || !variants) return <div className="loading-message">Loading...</div>;

    return (
        <div className="product-detail-container">
            {/* Top Section: Images and Key Info */}
            <div className="top-section">
                {/* Left: Product Images */}
                <ProductImagesCarousel
                    images={product.images}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                />

                {/* Right: Product Info */}
                <ProductInfoPanel
                    product={product}
                    selectedVariant={selectedVariant}
                    variants={variants}
                    setSelectedVariant={setSelectedVariant}
                    handleAddToCart={handleAddToCart}
                    wishlistFilled={wishlistFilled}
                    handleWishlistClick={handleWishlistClick}
                />
            </div>

            {/* Product Information Table */}
            <ProductInfoTable product={product} />

            {/* Reviews Section */}
            <ReviewsSection
                reviews={reviews}
                averageRating={averageRating}
                onWriteReview={handleWriteReviewClick}
            />
             <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={handleCloseToast}
      />
        </div>
    );
};

export default ProductDetail;