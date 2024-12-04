const mysql = require("mysql2");

// Database connection
const db = require('../config/db');

// GET endpoint to search products
exports.searchProducts = (req, res) => {
    const { search = '', sort_by = 'price', sort_order = 'asc' } = req.query;

    // Validate sorting parameters
    const validSortBy = ['price']; // Only price allowed for sorting
    const validSortOrder = ['asc', 'desc'];

    if (!validSortBy.includes(sort_by) || !validSortOrder.includes(sort_order.toLowerCase())) {
        return res.status(400).json({ error: "Invalid sorting parameters" });
    }

    // Split search terms
    const searchTerms = search.trim().split(' ').filter(Boolean);

    // Build the WHERE clause and query parameters
    let whereClause = '';
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

    // Build the query
    let query = `
        SELECT 
 p.product_id, 
            p.name, 
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
            (pv.stock = 0) AS out_of_stock 
        FROM Products p
        LEFT JOIN Product_Variant pv ON p.product_id = pv.product_id
        WHERE ${whereClause}
        ORDER BY ${sort_by} ${sort_order.toUpperCase()}

    `;

    // Add the sort_by parameter to queryParams
    queryParams.push(sort_by);

    // Execute the query
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error executing search query:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        res.json({ data: results, total: results.length });
    });
};
