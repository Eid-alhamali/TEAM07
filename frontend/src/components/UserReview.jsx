import { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import './UserReview.css'

const ReviewForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    rating: 0,
    comment: ''
  });

  const [error, setError] = useState(''); // State to store error message

  // Star Rating Component
  const StarRating = ({ initialRating, onRatingChange }) => {
    const [rating, setRating] = useState(initialRating);

    const handleClick = (newRating) => {
      setRating(newRating);
      if (onRatingChange) {
        onRatingChange(newRating); // Pass rating back to parent component
      }
    };

    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${rating >= star ? 'filled' : ''}`}
            onClick={() => handleClick(star)}
            style={{ cursor: 'pointer', fontSize: '30px' }}
          >
            ★
          </span>
        ))}
        <p>{rating} out of 5</p>
      </div>
    );
  };

  // Add PropTypes validation
  StarRating.propTypes = {
    initialRating: PropTypes.number,      // Validate as a number
    onRatingChange: PropTypes.func        // Validate as a function
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle rating change from StarRating
  const handleRatingChange = (newRating) => {
    setFormData(prevState => ({
      ...prevState,
      rating: newRating
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.comment || formData.rating < 1) {
      setError('Please fill in all fields correctly.');
      return;
    }

    // If validation passes, submit the form
    console.log('Review Submitted:', formData);
    setFormData({ name: '', rating: 0, comment: '' }); // Reset form after submission
    setError(''); // Clear error message after submission
  };

  return (
    <div className='wrapper'>
      <div>
        <label htmlFor="name">Your Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Your Rating:</label>
        <StarRating 
          initialRating={formData.rating} 
          onRatingChange={handleRatingChange} 
        />
      </div>

      <div>
        <label htmlFor="comment">Your Review:</label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          required
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" onClick={handleSubmit}>Submit Review</button>
    </div>
  );
};

export default ReviewForm;
