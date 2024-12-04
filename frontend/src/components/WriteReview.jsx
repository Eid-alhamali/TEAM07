import './WriteReview.css';
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const WriteReview = () => {
    const { product_id } = useParams();
    const [productName, setProductName] = useState("");
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [isValidProduct, setIsValidProduct] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductName = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5001/api/products/${product_id}`
                );
                setProductName(response.data.name);
                setIsValidProduct(true);
            } catch (error) {
                console.error("Invalid product ID:", error);
                setIsValidProduct(false);
            }
        };

        fetchProductName();
    }, [product_id]);

    const handleStarClick = (index) => {
        setRating(index + 1);
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            alert("Please write a review before submitting.");
            return;
        }
    
        try {
            await axios.post(
                "http://localhost:5001/api/reviews",
                {
                    product_id,
                    rating,
                    content,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // Retrieve token from localStorage
                    },
                }
            );
            alert("Your review has been submitted!");
            navigate(`/product/${product_id}`); // Redirect to the product detail page
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit the review. Please try again.");
        }
    };
    

    if (!isValidProduct) {
        return (
            <div className="write-review-container">
                <h2>Invalid Product</h2>
                <p>The product you are trying to review does not exist.</p>
            </div>
        );
    }

    return (
        <div className="write-review-container">
            <h2>Write a Review for {productName}</h2>
            <div className="form-group">
                <label htmlFor="rating">Rating:</label>
                <div className="star-rating">
                    {[...Array(5)].map((_, index) => (
                        <span
                            key={index}
                            className={`star ${index < rating ? "selected" : ""}`}
                            onClick={() => handleStarClick(index)}
                        >
                            &#9733;
                        </span>
                    ))}
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="content">Review:</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your review here..."
                ></textarea>
            </div>
            <button onClick={handleSubmit} className="submit-review-button">
                Submit Review
            </button>
        </div>
    );
};

export default WriteReview;
