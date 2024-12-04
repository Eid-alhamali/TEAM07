import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../CartContext";
import "./ProductDetail.css";

const ProductDetail = () => {
    const { variant_id } = useParams();
    const [product, setProduct] = useState(null);
    const { addToCart } = useContext(CartContext);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState({
        stock: 0,
        price: 0,
    });
    const [quantity, setQuantity] = useState(1);
    const [variants, setVariants] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0); // State for average rating
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5001/api/product/variants/${variant_id}`
                );
                const productData = response.data;
                setProduct(productData);

                const variant = productData;
                setSelectedVariant(variant || { stock: 0, price: 0 });

                // Fetch all variants for the product
                const allVariantsResponse = await axios.get(
                    `http://localhost:5001/api/products/${productData.product_id}/variants`
                );
                setVariants(allVariantsResponse.data.variants);

                // Fetch reviews and calculate average rating
                const reviewsResponse = await axios.get(
                    `http://localhost:5001/api/reviews/${productData.product_id}`
                );
                const reviewsData = reviewsResponse.data.reviews || [];
                setReviews(reviewsData);

                if (reviewsData.length > 0) {
                    const totalRating = reviewsData.reduce(
                        (sum, review) => sum + review.rating,
                        0
                    );
                    setAverageRating(totalRating / reviewsData.length);
                }
            } catch (error) {
                console.error("Error fetching product or reviews:", error);
            }
        };

        fetchProduct();
    }, [variant_id]);

    const handleWriteReviewClick = () => {
        if (product?.product_id) {
            navigate(`/reviews/write/${product.product_id}`);
        }
    };

    const handlePrevImage = () => {
        if (!product.images || product.images.length === 0) return;
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        if (!product.images || product.images.length === 0) return;
        setCurrentImageIndex((prevIndex) =>
            prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const handleDotClick = (index) => {
        setCurrentImageIndex(index);
    };

    const handleVariantChange = (e) => {
        const variantId = e.target.value;
        const selected = variants.find(
            (variant) => variant.variant_id === parseInt(variantId)
        );
        setSelectedVariant(selected);
        setCurrentImageIndex(0);
    };

    const handleAddToCart = () => {
        if (quantity > product.stock) {
            alert("Not enough stock available!");
            return;
        }
        addToCart(
            product.name,
            selectedVariant.variant_id,
            quantity,
            selectedVariant.price,
            selectedVariant.weight_grams
        );
        alert(`${quantity} item(s) of ${product.name} added to cart.`);
    };

    if (!product || !selectedVariant) {
        return <div>Loading...</div>;
    }

    return (
        <div className="product-detail-container">
            <div className="image-carousel">
                {product.images && product.images.length > 0 ? (
                    <>
                        <div className="main-image">
                            <img
                                src={`http://localhost:5001${product.images[currentImageIndex].url}`}
                                alt={product.images[currentImageIndex].alt}
                            />
                            <button
                                className="nav-button left"
                                onClick={handlePrevImage}
                                aria-label="Previous Image"
                            >
                                &#10094;
                            </button>
                            <button
                                className="nav-button right"
                                onClick={handleNextImage}
                                aria-label="Next Image"
                            >
                                &#10095;
                            </button>
                        </div>
                        <div className="dots-container">
                            {product.images.map((image, index) => (
                                <span
                                    key={index}
                                    className={`dot ${
                                        index === currentImageIndex
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => handleDotClick(index)}
                                    aria-label={`View image ${index + 1}`}
                                ></span>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="no-image">No images available</div>
                )}
            </div>
            <div className="product-details">
                <h1 className="product-name">{product.name}</h1>
                <div className="average-rating">
                    <strong>Average Rating:</strong>
                    <div className="star-rating">
                        {[...Array(5)].map((_, index) => {
                            const fillPercentage = Math.min(
                                Math.max((averageRating - index) * 100, 0),
                                100
                            );
                            return (
                                <span key={index} className="star">
                                    <span
                                        className="star-filled"
                                        style={{
                                            width: `${fillPercentage}%`,
                                            overflow: "hidden",
                                        }}
                                    >
                                        ★
                                    </span>
                                    <span className="star-empty">★</span>
                                </span>
                            );
                        })}
                    </div>
                    <p>({averageRating.toFixed(2)})</p>
                </div>
                <p className="product-origin">
                    <strong>Origin:</strong> {product.origin}
                </p>
                <p className="product-roast">
                    <strong>Roast Level:</strong> {product.roast_level}
                </p>
                <p className="product-bean">
                    <strong>Bean Type:</strong> {product.bean_type}
                </p>
                <p className="product-flavor">
                    <strong>Flavor Profile:</strong> {product.flavor_profile}
                </p>
                <p className="product-description">{product.description}</p>

                <div className="variant-selection">
                    <label htmlFor="variant">Choose Weight:</label>
                    <select
                        id="variant"
                        value={selectedVariant.variant_id}
                        onChange={handleVariantChange}
                    >
                        {variants.map((variant) => (
                            <option
                                key={variant.variant_id}
                                value={variant.variant_id}
                            >
                                {variant.weight_grams}g - ${variant.price}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="quantity-selection">
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                        type="number"
                        id="quantity"
                        min="1"
                        max={selectedVariant.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                    />
                    <span className="stock">
                        {selectedVariant.stock} in stock
                    </span>
                </div>

                <div className="price-add">
                    <p className="price">
                        ${Number(selectedVariant.price).toFixed(2)}
                    </p>
                    <button
                        className="add-to-cart-button"
                        onClick={handleAddToCart}
                        disabled={selectedVariant.stock === 0}
                    >
                        {selectedVariant.stock === 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                    </button>
                </div>
            </div>
            <div className="reviews-section">
                <h2>Customer Reviews</h2>
                {reviews.length > 0 ? (
                    <div className="reviews-container">
                        {reviews.map((review, index) => (
                            <div key={index} className="review-box">
                                <div className="review-header">
                                    <div className="star-rating">
                                        {[...Array(5)].map((_, starIndex) => (
                                            <span
                                                key={starIndex}
                                                className={`star ${
                                                    starIndex <
                                                    review.rating
                                                        ? "filled"
                                                        : ""
                                                }`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="review-author">
                                        {review.first_name} {review.last_name}
                                    </p>
                                </div>
                                <p className="review-content">
                                    {review.content}
                                </p>
                                <p className="review-date">
                                    {new Date(
                                        review.created_at
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No reviews yet.</p>
                )}
                <button
                    onClick={handleWriteReviewClick}
                    className="write-review-button"
                >
                    Write a Review
                </button>
            </div>
        </div>
    );

};

export default ProductDetail;
