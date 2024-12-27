import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { toggleWishlist, getWishlistStatus } from "../../hooks/useWishlist";
import "./ProductCard.css";

import cartIcon from "../../assets/images/icons/cart-dark.svg";
import wishlistIcon from "../../assets/images/icons/wishlist/wishlist-dark.svg";
import wishlistIconFilled from "../../assets/images/icons/wishlist/wishlist-dark-filled.svg";

import starIcon from "../../assets/images/icons/star.svg"; // Import star icon


const ProductCard = ({ product, onAddToCart }) => {
    const {
        name,
        price,
        stock,
        variant_id,
        weight_grams,
        average_rating,
    } = product;

    const defaultImage = {
        url: "http://localhost:5001/assets/images/products/default_mockup.png",
        alt: "Default Mockup Image",
    };

    const [isWishlist, setIsWishlist] = useState(false);
    const [images, setImages] = useState([defaultImage]); // Default to one default image
    const [discountedPrice, setDiscountedPrice] = useState(price);
    const [isDiscounted, setIsDiscounted] = useState(false);
    const [discountType, setDiscountType] = useState(null);
    const [discountValue, setDiscountValue] = useState(null);

    // Fetch images, discount, and wishlist status
    useEffect(() => {
        // Fetch images
        fetch(`http://localhost:5001/api/product/variant/${variant_id}/images`)
            .then((response) => response.json())
            .then((data) => {
                if (data.success && data.data.length > 0) {
                    setImages(data.data);
                }
            })
            .catch(() => {
                setImages([defaultImage]); // Use default image on error
            });

        // Fetch discount
        fetch(`http://localhost:5001/api/product/variant/${variant_id}/discount`)
            .then((response) => response.json())
            .then((data) => {
                if (data.success && data.discount) {
                    setDiscountedPrice(data.discounted_price);
                    setIsDiscounted(data.discounted_price < price);
                    setDiscountType(data.discount.discount_type);
                    setDiscountValue(data.discount.value);
                } else {
                    setDiscountedPrice(price); // Use original price if not successful
                    setIsDiscounted(false);
                    setDiscountType(null);
                    setDiscountValue(null);
                }
            })
            .catch((error) => {
                console.error(
                    `Error fetching discounted price from URL: http://localhost:5001/api/product/variant/${variant_id}/discount`,
                    error
                );
                setDiscountedPrice(price); // Use original price on error
                setIsDiscounted(false);
                setDiscountType(null);
                setDiscountValue(null);
            });

        // Fetch wishlist status
        const fetchWishlistStatus = async () => {
            try {
                const status = await getWishlistStatus(variant_id);
                setIsWishlist(status);
            } catch (error) {
                console.error(
                    `Error fetching wishlist status for variant_id ${variant_id}:`,
                    error
                );
            }
        };

        fetchWishlistStatus();
    }, [variant_id, price]);

    const handleWishlistClick = (e) => {
        e.preventDefault(); // Prevent navigation
        toggleWishlist(variant_id, isWishlist, setIsWishlist); 
    };

    const handleImageError = (event) => {
        if (event.target.src !== defaultImage.url) {
            console.warn(`Failed to load image from URL: ${event.target.src} for product variant ${variant_id}. Using default image.`);
        } else { 
            console.error(`Failed to load default image from URL: ${event.target.src}.`);
        }
        event.target.src = defaultImage.url;
        event.target.alt = defaultImage.alt;
    };

    return (
        <Link
            to={`/product/${variant_id}`}
            className={`product-card-link ${stock === 0 ? "out-of-stock" : ""}`}
        >
            <div className="product-card">
                <div className="product-image-wrapper">
                    <div className="product-weight">{weight_grams}g</div>
                    <div className="product-rating">
                        <img src={starIcon} alt="Star" className="star-icon" />
                        {average_rating}
                    </div>
                    <img
                        src={`http://localhost:5001${images[0]?.image_url}`}
                        alt={images[0]?.alt_text || name}
                        className="product-image"
                        onError={handleImageError}
                    />
                    {isDiscounted && discountType && discountValue && (
                        <div className="discount-label">
                            {discountType === "percentage"
                                ? `-%${Number(discountValue)} Sale`
                                : `-${Number(discountValue)} TL Off`}
                        </div>
                    )}
                    {stock === 0 && (
                        <div className="stock-overlay">Out of Stock</div>
                    )}
                    <button
                        className="wishlist-icon"
                        onClick={handleWishlistClick}
                        aria-label="Toggle Wishlist"
                    >
                        <img
                            src={isWishlist ? wishlistIconFilled : wishlistIcon}
                            alt={
                                isWishlist
                                    ? "Remove from Wishlist"
                                    : "Add to Wishlist"
                            }
                        />
                    </button>
                </div>
                <div className="product-details">
                    <div className="product-name-container">
                        <h3 className="product-name">{name}</h3>
                    </div>
                    <div className="product-bottom">
                        <div className="product-pricing">
                            <span className="product-price">
                                {Number(discountedPrice)} TL
                            </span>
                            {isDiscounted && (
                                <span className="product-original-price">
                                    {price} TL
                                </span>
                            )}
                        </div>
                        {stock > 0 && (
                            <button
                                className="add-to-cart-icon"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAddToCart(product.variant_id);
                                }}
                                aria-label="Add to Cart"
                            >
                                <img src={cartIcon} alt="Add to Cart" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        variant_id: PropTypes.number.isRequired,
        stock: PropTypes.number.isRequired,
        weight_grams: PropTypes.number.isRequired,
        average_rating: PropTypes.number.isRequired,

    }).isRequired,
    onAddToCart: PropTypes.func.isRequired,
};

export default ProductCard;