const dbPool = require("../config/promise/promise_db.js");

// Get all product variants in the wishlist of a user
exports.getWishlistVariants = async (req, res) => {
    const userId = req.user.user_id;

    if (!userId) {
        return res.status(401).json({ error: "User is not authenticated." });
    }

    const query = `
        SELECT 
            p.product_id,
            p.name,
            p.average_rating,
            p.origin,
            p.roast_level,
            p.bean_type,
            p.grind_type,
            p.caffeine_content,
            pv.variant_id,
            pv.weight_grams,
            pv.price,
            pv.stock,
            pv.sku,
            CASE
                WHEN d.discount_id IS NULL OR d.active = 0
                    OR (d.start_date IS NOT NULL AND d.start_date > CURDATE())
                    OR (d.end_date IS NOT NULL AND d.end_date < CURDATE())
                THEN pv.price
                WHEN d.discount_type = 'percentage'
                    THEN (pv.price * GREATEST(0, 1 - (d.value / 100)))
                WHEN d.discount_type = 'fixed'
                    THEN GREATEST(0, pv.price - d.value)
                ELSE
                    pv.price
            END AS effective_price
        FROM Wishlist w
        JOIN WishlistItems wi ON w.wishlist_id = wi.wishlist_id
        JOIN Product_Variant pv ON wi.variant_id = pv.variant_id
        JOIN Products p ON pv.product_id = p.product_id
        LEFT JOIN Discounts d ON d.variant_id = pv.variant_id
            AND d.active = 1
            AND (d.start_date IS NULL OR d.start_date <= CURDATE())
            AND (d.end_date IS NULL OR d.end_date >= CURDATE())
        WHERE w.user_id = ?
    `;

    try {
        const [results] = await dbPool.query(query, [userId]);
        res.json(results);
    } catch (error) {
        console.error("Error retrieving wishlist variants:", error.message);
        res.status(500).json({ error: "Failed to retrieve wishlist." });
    }
};

exports.addProductToWishlist = async (req, res) => {
    const userId = req.user.user_id;
    const { variantId } = req.body;

    if (!userId) {
        return res.status(401).json({ error: "User is not authenticated." });
    }

    if (!variantId) {
        return res.status(400).json({ error: "Variant ID is required." });
    }

    try {
        // Ensure the user has a wishlist
        const [wishlist] = await dbPool.query(
            `SELECT wishlist_id FROM Wishlist WHERE user_id = ?`,
            [userId]
        );

        let wishlistId;
        if (!wishlist.length) {
            // Create a new wishlist if one doesn't exist
            const [result] = await dbPool.query(
                `INSERT INTO Wishlist (user_id) VALUES (?)`,
                [userId]
            );
            wishlistId = result.insertId;
        } else {
            wishlistId = wishlist[0].wishlist_id;
        }

        // Add the variant to the wishlist
        await dbPool.query(
            `INSERT IGNORE INTO WishlistItems (wishlist_id, variant_id) VALUES (?, ?)`,
            [wishlistId, variantId]
        );

        res.status(200).json({ message: "Product variant added to wishlist." });
    } catch (error) {
        console.error(
            "Error adding product variant to wishlist:",
            error.message
        );
        res.status(500).json({
            error: "Failed to add product variant to wishlist.",
        });
    }
};

exports.removeProductFromWishlist = async (req, res) => {
    const userId = req.user.user_id;
    const { variantId } = req.body;

    if (!userId) {
        return res.status(401).json({ error: "User is not authenticated." });
    }

    if (!variantId) {
        return res.status(400).json({ error: "Variant ID is required." });
    }

    try {
        // Get the user's wishlist
        const [wishlist] = await dbPool.query(
            `SELECT wishlist_id FROM Wishlist WHERE user_id = ?`,
            [userId]
        );

        if (!wishlist.length) {
            return res.status(404).json({ error: "Wishlist not found." });
        }

        const wishlistId = wishlist[0].wishlist_id;

        // Remove the variant from the wishlist
        const [result] = await dbPool.query(
            `DELETE FROM WishlistItems WHERE wishlist_id = ? AND variant_id = ?`,
            [wishlistId, variantId]
        );

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ error: "Product variant not found in wishlist." });
        }

        res.status(200).json({
            message: "Product variant removed from wishlist.",
        });
    } catch (error) {
        console.error(
            "Error removing product variant from wishlist:",
            error.message
        );
        res.status(500).json({
            error: "Failed to remove product variant from wishlist.",
        });
    }
};

exports.getWishlistStatus = async (req, res) => {
    const userId = req.user.user_id;
    const { variantId } = req.params;

    if (!userId) {
        return res.status(401).json({ error: "User is not authenticated." });
    }

    if (!variantId) {
        return res.status(400).json({ error: "Variant ID is required." });
    }

    try {
        const query = `
            SELECT COUNT(*) AS is_in_wishlist
            FROM Wishlist w
            JOIN WishlistItems wi ON w.wishlist_id = wi.wishlist_id
            WHERE w.user_id = ? AND wi.variant_id = ?
        `;

        const [result] = await dbPool.query(query, [userId, variantId]);

        const isInWishlist = result[0]?.is_in_wishlist > 0;
        res.status(200).json({ variantId, isInWishlist });
    } catch (error) {
        console.error("Error fetching wishlist status:", error.message);
        res.status(500).json({ error: "Failed to retrieve wishlist status." });
    }
};
