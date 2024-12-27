// import { useState, useEffect } from "react";
import { useWishlistItems } from "../../hooks/useWishlist";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductCard from "../ProductsPage/ProductCard";
import "./WishlistPage.css";

const WishlistPage = () => {
    // const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const { products } = useWishlistItems(navigate);

    const handleAddToCart = async (variantId) => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const response = await axios.post(
                    "http://localhost:5001/api/cart/add-to-cart",
                    { variantId }, // Payload
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    alert("Product added to cart successfully!");
                } else {
                    alert("Failed to add product to cart. Please try again.");
                }
            } catch (error) {
                console.error("Error adding product to cart:", error);
                alert("An error occurred. Please try again.");
            }
        } else {
            try {
                const response = await axios.get(
                    `http://localhost:5001/api/cart/variant/${variantId}`
                );

                if (response.status === 200) {
                    const productDetails = response.data;

                    const {
                        product_name,
                        price,
                        weight,
                        image,
                        stock,
                        quantity: newQuantity,
                    } = productDetails;

                    const cart = JSON.parse(localStorage.getItem("cart")) || [];

                    const existingProductIndex = cart.findIndex(
                        (item) => item.variantId === variantId
                    );

                    if (existingProductIndex > -1) {
                        const existingProduct = cart[existingProductIndex];
                        if (existingProduct.quantity + 1 > stock) {
                            alert(
                                "Stock is insufficient to add more of this product."
                            );
                            return;
                        }
                        cart[existingProductIndex].quantity += 1;
                    } else {
                        if (newQuantity > stock) {
                            alert("Stock is insufficient for this product.");
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

                    localStorage.setItem("cart", JSON.stringify(cart));

                    alert("Product added to cart successfully!");
                } else {
                    alert("Failed to fetch product details. Please try again.");
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
                alert(
                    "An error occurred while adding the product. Please try again."
                );
            }
        }
    };

    return (
        <div className="wishlist-page">
            <h1 className="page-title">Products I love</h1>
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
                    <p className="empty-wishlist">Your wishlist is empty.</p>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
