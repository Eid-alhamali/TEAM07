const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const cartRoutes = require('./routes/cartRoutes');
const searchRoutes = require('./routes/searchRoutes');

const port = process.env.PORT;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// integrate cart routes
app.use('/api/cart', cartRoutes);

// integrate search routes
app.use('/api/search', searchRoutes);

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected');
});

// GET endpoint to list all products and their variants
app.get('/api/products', (req, res) => {
    const query = `
        SELECT 
            p.product_id, p.name, pv.variant_id, pv.weight_grams, pv.price, pv.stock, pv.sku
        FROM 
            Products p
        JOIN 
            Product_Variant pv ON p.product_id = pv.product_id;
    `;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error retrieving products:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

//-----------------------------
// GET endpoint to retrieve a single product by ID
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = `
        SELECT 
            p.name, 
            p.origin, 
            p.roast_level, 
            p.bean_type, 
            p.grind_type, 
            p.flavor_profile, 
            p.processing_method, 
            p.caffeine_content, 
            p.description, 
            pv.weight_grams, 
            pv.price, 
            pv.stock, 
            pv.sku 
        FROM Products p 
        JOIN Product_Variant pv ON p.product_id = pv.product_id 
        WHERE pv.variant_id = ?`;
    db.query(query, [productId], (error, results) => {
        if (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(results[0]);
    });
});


// DELETE endpoint to delete a product
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM Products WHERE product_id = ?';
    db.query(query, [productId], (error, results) => {
    if (error) {
        console.error('Error deleting product:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
    });
});
  
// PUT endpoint to update a product
app.put('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const updateData = req.body;
    const query = 'UPDATE Products SET ? WHERE product_id = ?';
    db.query(query, [updateData, productId], (error, results) => {
    if (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated' });
    });
});

// GET endpoint to retrieve product details by variant_id
app.get('/api/product/:variant_id', (req, res) => {
    const variantId = req.params.variant_id;

    const query = `
        SELECT 
            p.name, pv.variant_id, pv.weight_grams, pv.price, pv.stock, pv.sku, p.description
        FROM 
            Products p
        JOIN 
            Product_Variant pv ON p.product_id = pv.product_id
        WHERE 
            pv.variant_id = ?;
    `;

    db.query(query, [variantId], (error, results) => {
        if (error) {
            console.error('Error retrieving product details:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(results[0]);
    });
});

// POST endpoint to add items to the cart
app.post('/api/cart', (req, res) => {
    const { userId, variantId, quantity } = req.body;

    if (!variantId || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO ShoppingCartItems (cart_id, variant_id, quantity)
        VALUES (
            (SELECT cart_id FROM ShoppingCart WHERE user_id = ?),
            ?, ?
        )
        ON DUPLICATE KEY UPDATE
            quantity = quantity + VALUES(quantity);
    `;

    db.query(query, [userId || null, variantId, quantity], (error, results) => {
        if (error) {
            console.error('Error adding item to cart:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Item added to cart' });
    });
});


app.get('/', (req, res) => {
    res.send('Backend is running');
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

module.exports = app; // Export the app for testing
