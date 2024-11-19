// addReview: Adds a new review to the database. Reviews are associated with a product and user and are not approved by default. Returns the newly created review ID upon success.
// getReviewsByProduct: Retrieves all approved reviews for a specified product, sorted by the most recent. This is primarily used for displaying reviews to customers.
// approveReview: Marks a review as approved. This action is typically performed by an admin to make the review visible to customers.
// deleteReview: Removes a review from the database based on its ID. Useful for admins or users to delete unwanted or inappropriate reviews.
const mysql = require('mysql2');
const config = require('../config/app.config');

const ReviewController = class {
    constructor() {
        this.con = mysql.createConnection(config.sqlCon);
    }

    // Add a new review
    addReview(reviewData) {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO Comments (product_id, user_id, rating, content, approved) VALUES (?, ?, ?, ?, ?)`;
            this.con.query(
                query,
                [reviewData.product_id, reviewData.user_id, reviewData.rating, reviewData.content, false],
                (err, result) => {
                    if (err) return reject(new Error('Database error'));
                    resolve('Review added successfully!');
                }
            );
        });
    }

    // Get all approved reviews for a product
    getReviewsByProduct(productId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Comments WHERE product_id = ? AND approved = true ORDER BY created_at DESC`;
            this.con.query(query, [productId], (err, results) => {
                if (err) return reject(new Error('Database error'));
                resolve(results);
            });
        });
    }

    // Approve a review (Admin action)
    approveReview(reviewId) {
        return new Promise((resolve, reject) => {
            const query = `UPDATE Comments SET approved = true WHERE comment_id = ?`;
            this.con.query(query, [reviewId], (err, result) => {
                if (err) return reject(new Error('Database error'));
                if (result.affectedRows === 0) return reject(new Error('Review not found or already approved'));
                resolve('Review approved successfully!');
            });
        });
    }

    // Delete a review
    deleteReview(reviewId) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM Comments WHERE comment_id = ?`;
            this.con.query(query, [reviewId], (err, result) => {
                if (err) return reject(new Error('Database error'));
                if (result.affectedRows === 0) return reject(new Error('Review not found'));
                resolve('Review deleted successfully!');
            });
        });
    }
};

module.exports = ReviewController;
