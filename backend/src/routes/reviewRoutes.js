const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const reviewsController = require('../controllers/reviewsController');

const router = express.Router();

// Routes for handling reviews
router.get('/pending', authMiddleware, reviewsController.getPendingReviews); // Get pending reviews (admin-only)
router.post('/', authMiddleware, reviewsController.addReview); // Submit a review
router.put('/approve/:comment_id', authMiddleware, reviewsController.approveReview); // Approve a review (admin-only)
router.delete('/reject/:comment_id', authMiddleware, reviewsController.rejectReview); // Reject a review (admin-only)
router.get('/:product_id', reviewsController.getReviewsByProduct);

module.exports = router;
