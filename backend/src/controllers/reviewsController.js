const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        process.exit(1);
    }
    console.log("MySQL connected");
});

// Controller Functions

// Get all approved reviews for a product
exports.getReviewsByProduct = (req, res) => {
    const { product_id } = req.params;

    if (!product_id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    const query = `
        SELECT c.comment_id, c.rating, c.content, c.created_at, u.first_name, u.last_name
        FROM Comments c
        JOIN Users u ON c.user_id = u.user_id
        WHERE c.product_id = ? AND c.approved = TRUE
        ORDER BY c.created_at DESC
    `;

    db.query(query, [product_id], (err, results) => {
        if (err) {
            console.error("Error fetching reviews:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        res.status(200).json({ reviews: results });
    });
};

// Submit a new review
exports.addReview = (req, res) => {
    const { product_id, rating, content } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    if (!product_id || !rating || !content) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    console.log("Adding review:", { product_id, user_id, rating, content });

    const addReviewQuery = `
        INSERT INTO Comments (product_id, user_id, rating, content, approved)
        VALUES (?, ?, ?, ?, FALSE)
    `;

    const updateAverageRatingQuery = `
        UPDATE Products
        SET average_rating = (
            SELECT AVG(rating)
            FROM Comments
            WHERE product_id = ? AND approved = TRUE
        )
        WHERE product_id = ?
    `;

    db.query(addReviewQuery, [product_id, user_id, rating, content], (err) => {
        if (err) {
            console.error("Error adding review:", err);
            return res.status(500).json({ error: "Internal server error." });
        }

        // Update the product's average rating
        db.query(updateAverageRatingQuery, [product_id, product_id], (updateErr) => {
            if (updateErr) {
                console.error("Error updating average rating:", updateErr);
                return res.status(500).json({ error: "Internal server error while updating average rating." });
            }

            res.status(201).json({ message: "Review submitted successfully. Awaiting approval." });
        });
    });
};


exports.getReviewsByProduct = (req, res) => {
    const { product_id } = req.params;

    if (!product_id) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    const query = `
        SELECT c.comment_id, c.rating, c.content, c.created_at, u.first_name, u.last_name
        FROM Comments c
        JOIN Users u ON c.user_id = u.user_id
        WHERE c.product_id = ? AND c.approved = TRUE
        ORDER BY c.created_at DESC
    `;

    db.query(query, [product_id], (err, results) => {
        if (err) {
            console.error('Error fetching reviews:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(200).json({ reviews: results });
    });
};


// Get pending reviews (admin-only)
exports.getPendingReviews = (req, res) => {
    const query = `
        SELECT c.comment_id, c.rating, c.content, c.created_at, u.first_name, u.last_name
        FROM Comments c
        JOIN Users u ON c.user_id = u.user_id
        WHERE c.approved = FALSE
        ORDER BY c.created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching pending reviews:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        res.status(200).json({ reviews: results });
    });
};

// Approve a review (Admin-only)
exports.approveReview = (req, res) => {
    const { comment_id } = req.params;

    if (!comment_id) {
        return res.status(400).json({ error: "Comment ID is required." });
    }

    const query = `
        UPDATE Comments SET approved = TRUE WHERE comment_id = ?
    `;

    db.query(query, [comment_id], (err, result) => {
        if (err) {
            console.error("Error approving review:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Review not found." });
        }

        res.status(200).json({ message: "Review approved successfully." });
    });
};

// Reject a review (Admin-only)
exports.rejectReview = (req, res) => {
    const { comment_id } = req.params;

    if (!comment_id) {
        return res.status(400).json({ error: "Comment ID is required." });
    }

    const query = `
        DELETE FROM Comments WHERE comment_id = ? AND approved = FALSE
    `;

    db.query(query, [comment_id], (err, result) => {
        if (err) {
            console.error("Error rejecting review:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Review not found or already approved." });
        }

        res.status(200).json({ message: "Review rejected successfully." });
    });
};
