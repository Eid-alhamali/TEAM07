import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import wishlistIcon from '../../assets/images/icons/wishlist/wishlist-dark.svg';
import wishlistIconFilled from '../../assets/images/icons/wishlist/wishlist-dark-filled.svg';

import './ProductInfoPanel.css';

const ProductInfoPanel = ({
    product,
    selectedVariant,
    variants,
    setSelectedVariant,
    handleAddToCart,
    wishlistFilled,
    handleWishlistClick
}) => {
    // State to store discount information for all variants
    const [discountsMap, setDiscountsMap] = useState({});

    useEffect(() => {
        if (variants && variants.length > 0) {
            // Function to fetch discount for a single variant
            const fetchDiscount = async (variant) => {
                try {
                    const response = await fetch(`http://localhost:5001/api/product/variant/${variant.variant_id}/discount`);
                    const data = await response.json();
                    if (data.success && data.discount) {
                        return { 
                            variant_id: variant.variant_id, 
                            discounted_price: data.discounted_price,
                            discount_type: data.discount.discount_type,
                            discount_value: data.discount.value
                        };
                    } else {
                        // No discount available
                        return { 
                            variant_id: variant.variant_id, 
                            discounted_price: variant.price,
                            discount_type: null,
                            discount_value: null
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching discount for variant_id ${variant.variant_id}:`, error);
                    // Fallback to original price on error
                    return { 
                        variant_id: variant.variant_id, 
                        discounted_price: variant.price,
                        discount_type: null,
                        discount_value: null
                    };
                }
            };

            // Fetch discounts for all variants concurrently
            const fetchAllDiscounts = async () => {
                const discountPromises = variants.map((variant) => fetchDiscount(variant));
                const discounts = await Promise.all(discountPromises);
                const discountsObject = {};
                discounts.forEach(({ variant_id, discounted_price, discount_type, discount_value }) => {
                    discountsObject[variant_id] = { 
                        discounted_price, 
                        discount_type, 
                        discount_value 
                    };
                });
                setDiscountsMap(discountsObject);
            };

            fetchAllDiscounts();
        }
    }, [variants]);

    return (
        <div className="key-info">
            {/* Name, Description, and Price */}
            <div className="top-info">
                <h1 className="product-name">{product.name}</h1>
                <p className="product-description">{product.description}</p>
                <div className="product-price-section">
                    <div className="product-price">
                        {selectedVariant && discountsMap[selectedVariant.variant_id]
                            ? Number(discountsMap[selectedVariant.variant_id].discounted_price).toFixed(2)
                            : Number(selectedVariant?.price).toFixed(2)} TL
                    </div>
                    {selectedVariant && discountsMap[selectedVariant.variant_id] && discountsMap[selectedVariant.variant_id].discounted_price < selectedVariant.price && (
                        <div className="price-details">
                            <span className="product-base-price">
                                {Number(selectedVariant.price).toFixed(2)} TL
                            </span>
                            <span className="dot">●</span>
                            <span className="discount-label">
                                {discountsMap[selectedVariant.variant_id].discount_type === "percentage"
                                    ? `-${discountsMap[selectedVariant.variant_id].discount_value}% Sale`
                                    : `-${Number(discountsMap[selectedVariant.variant_id].discount_value)} TL Off`}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Variant Selection */}
            <div className="variant-selection">
                <h3 className="variant-header">Weight Options</h3>
                <div className="variant-buttons">
                    {variants.map((variant) => {
                        const discountInfo = discountsMap[variant.variant_id];
                        const discountedPrice = discountInfo ? discountInfo.discounted_price : variant.price;
                        const isDiscounted = discountInfo && discountedPrice < variant.price;

                        return (
                            <button
                                key={variant.variant_id}
                                className={`variant-button ${
                                    selectedVariant?.variant_id === variant.variant_id ? "selected" : ""
                                } ${variant.stock === 0 ? "out-of-stock" : ""}`}
                                onClick={() => setSelectedVariant(variant)}
                            >
                                {variant.weight_grams}g ● {Number(discountedPrice)} TL 
                                {isDiscounted && (
                                    <span className="base-price">
                                        {Number(variant.price)} TL
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Add to Cart, Stock Info, and Wishlist */}
            <div className="actions">
                <div className={`stock-info boxy-rectangle ${selectedVariant?.stock === 0 ? "out-of-stock" : ""}`}>
                    <strong>Stock:</strong>
                    <span>{selectedVariant?.stock || 0}</span>
                </div>
                <button
                    className="add-to-cart-button"
                    onClick={()=>{handleAddToCart(selectedVariant.variant_id )}}
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                >
                    {selectedVariant?.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                <button className="wishlist-button" onClick={handleWishlistClick}>
                    <img src={wishlistFilled ? wishlistIconFilled : wishlistIcon} alt="Add to Wishlist" />
                </button>
            </div>
        </div>
    );
};

ProductInfoPanel.propTypes = {
    product: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    }).isRequired,
    selectedVariant: PropTypes.shape({
        variant_id: PropTypes.number,
        price: PropTypes.number,
        stock: PropTypes.number,
    }),
    variants: PropTypes.arrayOf(
        PropTypes.shape({
            variant_id: PropTypes.number.isRequired,
            weight_grams: PropTypes.number.isRequired,
            price: PropTypes.number.isRequired,
            stock: PropTypes.number.isRequired,
        })
    ).isRequired,
    setSelectedVariant: PropTypes.func.isRequired,
    handleAddToCart: PropTypes.func.isRequired,
    wishlistFilled: PropTypes.bool.isRequired,
    handleWishlistClick: PropTypes.func.isRequired,
};

export default ProductInfoPanel;
