import PropTypes from "prop-types";
import "./ReviewsSection.css";

const ReviewsSection = ({ reviews, averageRating, onWriteReview }) => {
    return (
        <div className="reviews-section">
            <h2>Customer Reviews</h2>

            {/* Average Rating */}
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

            {/* Reviews */}
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
                                                starIndex < review.rating
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
                                {new Date(review.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No reviews yet.</p>
            )}

            {/* Write Review Button */}
            <button
                onClick={onWriteReview}
                className="write-review-button"
            >
                Write a Review
            </button>
        </div>
    );
};

ReviewsSection.propTypes = {
    reviews: PropTypes.arrayOf(
        PropTypes.shape({
            rating: PropTypes.number.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
            created_at: PropTypes.string.isRequired,
        })
    ).isRequired,
    averageRating: PropTypes.number.isRequired,
    onWriteReview: PropTypes.func.isRequired,
};

export default ReviewsSection;
