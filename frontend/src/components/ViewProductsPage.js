import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ViewProductsPage.css"; // Custom CSS for styling

const ViewProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [stockValues, setStockValues] = useState({});
    const navigate = useNavigate();

    // Fetch products and their variants
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/products");
                const productsWithVariants = await Promise.all(
                    response.data.map(async (product) => {
                        const variantResponse = await axios.get(
                            `http://localhost:5001/api/products/${product.product_id}/variants`
                        );
                        return { ...product, variants: variantResponse.data.variants };
                    })
                );
                setProducts(productsWithVariants);
            } catch (error) {
                console.error("Error fetching products:", error);
                alert("Failed to fetch products.");
            }
        };
        fetchProducts();
    }, []);

    // Update stock for a specific variant
    const updateStock = async (variantId, newStock) => {
        if (newStock < 0 || isNaN(newStock)) {
            alert("Stock cannot be negative or empty.");
            return;
        }
        try {
            await axios.put(`http://localhost:5001/api/products/variants/${variantId}/stock`, {
                stock: newStock,
            });
            alert("Stock updated successfully!");
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error("Error updating stock:", error);
            alert("Failed to update stock.");
        }
    };

    // Delete a specific variant
    const deleteVariant = async (variantId) => {
        try {
            const confirm = window.confirm("Are you sure you want to delete this variant?");
            if (!confirm) return;

            await axios.delete(`http://localhost:5001/api/products/variants/${variantId}`);
            alert("Variant deleted successfully!");
            window.location.reload(); // Refresh the page
        } catch (error) {
            console.error("Error deleting variant:", error);
            alert("Failed to delete variant.");
        }
    };

    const handleInputChange = (variantId, value) => {
        setStockValues({ ...stockValues, [variantId]: value });
    };

    return (
        <div className="view-products-container">
            <div className="view-products-top-buttons">
                <button className="view-products-go-back-button" onClick={() => navigate("/admin/product_management")}>
                    Go Back
                </button>
                <button className="view-products-add-product-button" onClick={() => navigate("/admin/add_product")}>
                    Add Product
                </button>
            </div>

            <h1>All Products</h1>

            <div className="view-products-list">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.product_id} className="view-products-card">
                            <h3>{product.name}</h3>
                            <p><strong>Origin:</strong> {product.origin || "N/A"}</p>
                            <p><strong>Roast Level:</strong> {product.roast_level}</p>
                            <p><strong>Bean Type:</strong> {product.bean_type}</p>
                            <p><strong>Caffeine Content:</strong> {product.caffeine_content}</p>
                            <p><strong>Category ID:</strong> {product.category_id}</p>
                            <p><strong>Description:</strong> {product.description || "No description available."}</p>

                            <div className="product-variants">
                                <h4>Variants</h4>
                                {product.variants.map((variant) => (
                                    <div key={variant.variant_id} className="variant-item">
                                        <p>
                                            <strong>Weight:</strong> {variant.weight_grams}g | 
                                            <strong> Price:</strong> ${variant.price} | 
                                            <strong> Stock:</strong> {variant.stock}
                                        </p>
                                        <div className="variant-actions">
                                            <input
                                                type="number"
                                                min="0"
                                                className="stock-input"
                                                placeholder="Enter stock"
                                                value={stockValues[variant.variant_id] || ""}
                                                onChange={(e) => handleInputChange(variant.variant_id, e.target.value)}
                                            />
                                            <button
                                                className="update-stock-button elegant-button"
                                                onClick={() => updateStock(variant.variant_id, parseInt(stockValues[variant.variant_id], 10))}
                                            >
                                                Update
                                            </button>
                                            <button
                                                className="delete-variant-button elegant-button"
                                                onClick={() => deleteVariant(variant.variant_id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No products available.</p>
                )}
            </div>
        </div>
    );
};


export default ViewProductsPage;