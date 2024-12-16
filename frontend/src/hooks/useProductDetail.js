import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Custom hook to fetch product details, variants, and reviews.
 *
 * @param {string} variant_id - The ID of the selected variant.
 * @returns {Object} - Returns product, variants, reviews, and averageRating.
 */
const useProductDetail = (variant_id) => {
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                // Fetch product details
                const productResponse = await axios.get(
                    `http://localhost:5001/api/product/variants/${variant_id}`
                );
                const productData = productResponse.data;

                // Convert warranty_status to boolean
                if (typeof productData.warranty_status !== "boolean") {
                    productData.warranty_status = Boolean(productData.warranty_status);
                }

                // Ensure price is a number
                productData.price = Number(productData.price);
                
                setProduct(productData);

                // Fetch all variants for the product
                const variantsResponse = await axios.get(
                    `http://localhost:5001/api/products/${productData.product_id}/variants`
                );
                const formattedVariants = variantsResponse.data.variants.map(variant => ({
                    ...variant,
                    price: Number(variant.price),
                }));
                setVariants(formattedVariants);

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
                console.error("Error fetching product data:", error);
                setError("Failed to load product details. Please try again.");
            }
        };

        fetchProductData();
    }, [variant_id]);

    return { product, variants, reviews, averageRating, error };
};

export default useProductDetail;
