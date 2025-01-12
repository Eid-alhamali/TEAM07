const mysql = require("mysql2");

// Database connection
const db = require('../config/db');

// GET endpoint to search products
exports.searchProducts = (req, res) => {
    const { search = '', sort_by = 'price', sort_order = 'asc' } = req.query;

    // Validate sorting parameters
    const validSortBy = ['price', 'average_rating', 'stock']; // sort by price only for now
    const validSortOrder = ['asc', 'desc'];

    if (!validSortBy.includes(sort_by) || !validSortOrder.includes(sort_order.toLowerCase())) {
        return res.status(400).json({ error: "Invalid sorting parameters" });
    }

    // Split search terms
    const searchTerms = search.trim().split(' ').filter(Boolean);

    // Build the WHERE clause and query parameters
    let whereClause = '1=1';
    let queryParams = [];

    if (searchTerms.length > 0) {
        whereClause = searchTerms.map(term => {
            queryParams.push(`%${term}%`, `%${term}%`);
            return `(p.name LIKE ? OR p.description LIKE ?)`;
        }).join(' OR ');
    } else {
        // If no search terms provided, return an empty result
        return res.json({ data: [], total: 0 });
    }

    const sortByColumn = {
        price: 'effective_price',
        average_rating: 'p.average_rating',
        stock: 'pv.stock'
    };

    // Build the query
    let query = `
SELECT 
            p.product_id, 
            p.name, 
            p.average_rating,
            p.category_id,
            p.roast_level, 
            p.bean_type, 
            p.grind_type,
            p.caffeine_content, 
            p.origin, 
            pv.variant_id, 
            pv.weight_grams, 
            pv.price, 
            pv.stock, 
            pv.sku,
            CASE
                WHEN d.discount_id IS NULL OR d.active = 0
                    OR (d.start_date IS NOT NULL AND d.start_date > CURDATE())
                    OR (d.end_date IS NOT NULL AND d.end_date < CURDATE())
                THEN 
                    pv.price
                WHEN d.discount_type = 'percentage'
                    THEN (pv.price * GREATEST(0, 1 - (d.value / 100)))
                WHEN d.discount_type = 'fixed'
                    THEN GREATEST(0, pv.price - d.value)
                ELSE
                    pv.price
            END AS effective_price
        FROM 
            Products p
        JOIN 
            Product_Variant pv ON p.product_id = pv.product_id
        LEFT JOIN Discounts d ON d.variant_id = pv.variant_id
            AND d.active = 1
            AND (d.start_date IS NULL OR d.start_date <= CURDATE())
            AND (d.end_date IS NULL OR d.end_date >= CURDATE())
        WHERE ${whereClause}
        ORDER BY ${sortByColumn[sort_by]} ${sort_order.toUpperCase()}

    `;

    

    // Add the sort_by parameter to queryParams
    // queryParams.push(sort_by);

    // Execute the query
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error executing search query:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        res.json({ data: results, total: results.length });
    });
};
