const mysql = require("mysql2");

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL connected");
});

// GET endpoint to search products
exports.searchProducts = (req, res) => {
    const { name = '', description = '', sort_by = 'price', sort_order = 'asc' } = req.query;

    // Validate sorting parameters
    const validSortBy = ['price']; // Only price allowed for sorting
    const validSortOrder = ['asc', 'desc'];

    if (!validSortBy.includes(sort_by) || !validSortOrder.includes(sort_order)) {
        return res.status(400).json({ error: "Invalid sorting parameters" });
    }

    // Build the query
    const query = `
        SELECT 
            p.product_id, 
            p.name, 
            p.description, 
            pv.price, 
            pv.stock, 
            (pv.stock = 0) AS out_of_stock 
        FROM Products p
        LEFT JOIN Product_Variant pv ON p.product_id = pv.product_id
        WHERE p.name LIKE ? AND p.description LIKE ?
        ORDER BY ${sort_by} ${sort_order.toUpperCase()}
    `;

    const queryParams = [`%${name}%`, `%${description}%`];

    // Execute the query
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error("Error executing search query:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        res.json({ data: results, total: results.length });
    });
};
