import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

// Fetch all details of all product variants in the wishlist
export const useWishlistItems = (navigate) => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            axios
                .get(`${API_BASE_URL}/wishlist`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setProducts(
                        response.data.map((product) => ({
                            ...product,
                            price: Number(product.price),
                            discountedPrice: Number(product.effective_price),
                            isDiscounted: product.price > product.effective_price,
                            discountType: product.discount_type,
                            discountValue: product.discount_value,
                        }))
                    );
                })
                .catch((err) => {
                    console.error("Error fetching wishlist products:", err);
                    setError(err);
                    setProducts([]);
                });
        } else {
            alert("Please log in to view your wishlist.");
            navigate("/login");
        }
    }, [navigate]);

    return { products, error };
};

const addToWishlist = async (variantId) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("User is not authenticated.");
        }

        const response = await axios.post(
            "http://localhost:5001/api/wishlist/add",
            { variantId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data.message;
    } catch (error) {
        console.error("Error adding product to wishlist:", error);
        throw error;
    }
};

const removeFromWishlist = async (variantId) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("User is not authenticated.");
        }

        const response = await axios.delete(
            "http://localhost:5001/api/wishlist/remove",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: { variantId },
            }
        );

        return response.data.message;
    } catch (error) {
        console.error("Error removing product from wishlist:", error);
        throw error;
    }
};

export const toggleWishlist = async (
    variantId,
    isWishlist,
    setWishlistState
) => {
    try {
        if (isWishlist) {
            await removeFromWishlist(variantId); // Remove from wishlist
            alert("Removed from wishlist");
        } else {
            await addToWishlist(variantId); // Add to wishlist
            alert("Added to wishlist");
        }
        setWishlistState((prev) => !prev); // Toggle wishlist state
    } catch (error) {
        console.error(
            `Error ${isWishlist ? "removing from" : "adding to"} wishlist:`,
            error
        );
        alert(
            `Failed to ${
                isWishlist ? "remove from" : "add to"
            } wishlist. Please try again.`
        );
    }
};

export const getWishlistStatus = async (variantId) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("User is not authenticated.");
        }

        const response = await axios.get(
            `http://localhost:5001/api/wishlist/${variantId}/status`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data.isInWishlist;
    } catch (error) {
        console.error("Error fetching wishlist status:", error);
        throw error;
    }
};
