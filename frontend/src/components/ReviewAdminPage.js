import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from "axios";
import "./ReviewAdminPage.css"; // Import the CSS for styling

const ReviewAdminPage = () => {
    const [pendingReviews, setPendingReviews] = useState([]);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchPendingReviews = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/reviews/pending", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setPendingReviews(response.data.reviews);
            } catch (error) {
                console.error("Error fetching pending reviews:", error);
                alert("Failed to fetch pending reviews.");
            }
        };

        fetchPendingReviews();
    }, []);

    const handleApprove = async (comment_id) => {
        try {
            await axios.put(`http://localhost:5001/api/reviews/approve/${comment_id}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setPendingReviews((prev) => prev.filter((review) => review.comment_id !== comment_id));
            alert("Review approved successfully.");
        } catch (error) {
            console.error("Error approving review:", error);
            alert("Failed to approve review.");
        }
    };

    const handleReject = async (comment_id) => {
        try {
            await axios.delete(`http://localhost:5001/api/reviews/reject/${comment_id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setPendingReviews((prev) => prev.filter((review) => review.comment_id !== comment_id));
            alert("Review rejected successfully.");
        } catch (error) {
            console.error("Error rejecting review:", error);
            alert("Failed to reject review.");
        }
    };

    return (
        <div className="review-admin-container">
            <button
                className="go-back-button-review"
                onClick={() => navigate("/admin/product_management")}
            >
                Go Back
            </button>
            <h1 className="review-admin-title">Review Management</h1>
            <p className="review-admin-description">
                Approve or reject user reviews for better product experiences.
            </p>
            <div className="review-list">
                {pendingReviews.length > 0 ? (
                    pendingReviews.map((review) => (
                        <div key={review.comment_id} className="review-item">
                            <h3 className="review-title">
                                Review by {review.first_name} {review.last_name}
                            </h3>
                            <p className="review-content">{review.content}</p>
                            <p className="review-rating">Rating: {review.rating} Stars</p>
                            <p className="review-date">
                                Submitted on: {new Date(review.created_at).toLocaleDateString()}
                            </p>
                            <div className="review-actions">
                                <button
                                    className="accept-button elegant-button"
                                    onClick={() => handleApprove(review.comment_id)}
                                >
                                    Accept
                                </button>
                                <button
                                    className="reject-button elegant-button"
                                    onClick={() => handleReject(review.comment_id)}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No pending reviews.</p>
                )}
            </div>
        </div>
    );
};


export default ReviewAdminPage;