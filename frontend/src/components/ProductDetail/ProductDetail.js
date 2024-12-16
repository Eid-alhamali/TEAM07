import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProductDetail from "../../hooks/useProductDetail";
import ProductImagesCarousel from "./ProductImagesCarousel";
import ProductInfoTable from "./ProductInfoTable";
import ReviewsSection from "./ReviewsSection";
import ProductInfoPanel from "./ProductInfoPanel";

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

    // Set default variant when product or variants change
    useEffect(() => {
        if (variants.length > 0 && !selectedVariant) {
            const initialVariant = variants.find(
                (variant) => variant.variant_id === parseInt(variant_id)
            );
            setSelectedVariant(initialVariant || variants[0]); // Fallback to the first variant if not found
        }
    }, [variants, variant_id, selectedVariant]);

    // Add to Cart Handler
    const handleAddToCart = () => {
        if (!selectedVariant || selectedVariant.stock === 0) {
            alert("Not enough stock available!");
            return;
        }

        // Add logic for adding to cart (e.g., context, API call)
        alert(`${product.name} added to cart.`);
    };

    // Wishlist Button Handler
    const handleWishlistClick = () => {
        setWishlistFilled(!wishlistFilled);
        // Add logic for adding/removing from wishlist (e.g., context, API call)
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
        </div>
    );
};

export default ProductDetail;