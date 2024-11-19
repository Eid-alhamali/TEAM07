const ReviewController = require('../controllers/review.controller');
const mysql = require('mysql2');
const config = require('../config/app.config');

// Mock MySQL connection
jest.mock('mysql2');
const mockConnection = {
    query: jest.fn(),
    end: jest.fn(),
};
mysql.createConnection.mockReturnValue(mockConnection);

let reviewController;

beforeAll(() => {
    reviewController = new ReviewController();
    reviewController.con = mockConnection;
});

afterAll(() => {
    reviewController.con.end();
});

describe('ReviewController', () => {
    const productId = 1;
    const userId = 1;
    const sampleReview = { product_id: productId, user_id: userId, rating: 4, content: 'Great product!' };

    test('addReview should add a review to the product', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { insertId: 1 }) // Simulate successful insert
        );

        const response = await reviewController.addReview(sampleReview);
        expect(response).toBe('Review added successfully!');
        expect(mockConnection.query).toHaveBeenCalledWith(
            'INSERT INTO Comments (product_id, user_id, rating, content, approved) VALUES (?, ?, ?, ?, ?)',
            [sampleReview.product_id, sampleReview.user_id, sampleReview.rating, sampleReview.content, false],
            expect.any(Function)
        );
    });

    test('addReview should fail if adding the review encounters an error', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(new Error('Database error'), null) // Simulate database error
        );

        await expect(reviewController.addReview(sampleReview)).rejects.toThrow('Database error');
    });

    test('getReviewsByProduct should retrieve reviews for a specific product', async () => {
        const sampleReviews = [
            { comment_id: 1, product_id: productId, user_id: userId, rating: 4, content: 'Great product!' },
            { comment_id: 2, product_id: productId, user_id: 2, rating: 5, content: 'Excellent!' },
        ];

        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, sampleReviews) // Simulate successful query
        );

        const reviews = await reviewController.getReviewsByProduct(productId);
        expect(reviews).toEqual(sampleReviews);
        expect(mockConnection.query).toHaveBeenCalledWith(
            'SELECT * FROM Comments WHERE product_id = ? AND approved = true ORDER BY created_at DESC',
            [productId],
            expect.any(Function)
        );
    });

    test('getReviewsByProduct should handle no reviews', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, []) // Simulate no reviews found
        );

        const reviews = await reviewController.getReviewsByProduct(productId);
        expect(reviews).toEqual([]);
    });

    test('approveReview should approve a review', async () => {
        const reviewId = 1;

        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 1 }) // Simulate successful update
        );

        const response = await reviewController.approveReview(reviewId);
        expect(response).toBe('Review approved successfully!');
        expect(mockConnection.query).toHaveBeenCalledWith(
            'UPDATE Comments SET approved = true WHERE comment_id = ?',
            [reviewId],
            expect.any(Function)
        );
    });

    test('approveReview should fail if the review does not exist', async () => {
        const reviewId = 99;

        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 0 }) // Simulate no review updated
        );

        await expect(reviewController.approveReview(reviewId)).rejects.toThrow('Review not found or already approved');
    });

    test('deleteReview should delete a review', async () => {
        const reviewId = 1;

        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 1 }) // Simulate successful delete
        );

        const response = await reviewController.deleteReview(reviewId);
        expect(response).toBe('Review deleted successfully!');
        expect(mockConnection.query).toHaveBeenCalledWith(
            'DELETE FROM Comments WHERE comment_id = ?',
            [reviewId],
            expect.any(Function)
        );
    });

    test('deleteReview should fail if the review does not exist', async () => {
        const reviewId = 99;

        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 0 }) // Simulate no review deleted
        );

        await expect(reviewController.deleteReview(reviewId)).rejects.toThrow('Review not found');
    });
});
