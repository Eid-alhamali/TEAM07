import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { CartContext } from '../CartContext'; // Import CartContext
import './ProductDetail.css';
import whitePackage from '../assets/images/products/whitepackage.png';

const ProductDetail = () => {
    const { variant_id } = useParams(); // Get variant_id from the URL
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useContext(CartContext); // Use CartContext

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/product/${variant_id}`);
                const data = await response.json();
                setProduct(data);
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        };
        fetchProduct();
    }, [variant_id]);

    const handleIncrement = () => setQuantity((prev) => prev + 1);
    const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleAddToCart = () => {
        if (quantity > product.stock) {
            alert('Not enough stock available!');
            return;
        }
        addToCart(product.name, product.variant_id, quantity, product.price, product.weight_grams); // Call addToCart
        alert(`${quantity} item(s) of ${product.name} added to cart.`);
    };

    if (!product) return <p>Loading...</p>;

    return (
        <div className="product-detail">
            <Navbar />
            <div className="left-section">
                <img src={whitePackage} alt="Coffee Package" />
            </div>
            <div className="right-section">
                <div className="product-detail-container">
                    <div className="product-detail-info">
                        <h2 className="product-name">{product.name}</h2>
                        <p><strong>Weight:</strong> {product.weight_grams}g</p>
                        <p><strong>Price:</strong> ${product.price}</p>
                        <p><strong>Stock Available:</strong> {product.stock}</p>
                        <p><strong>Description:</strong> {product.description}</p>
                        <div className="cart-controls">
                            <button onClick={handleDecrement}>-</button>
                            <span>{quantity}</span>
                            <button onClick={handleIncrement}>+</button>
                            <button className="add-to-cart-button" onClick={handleAddToCart}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
