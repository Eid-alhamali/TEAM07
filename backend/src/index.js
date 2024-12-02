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
app.use('/assets', express.static('src/assets'));


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

// GET endpoint to list all products and their variants with category filtering
app.get('/api/products', (req, res) => {
    const { category_id, roast_level, bean_type, grind_type, caffeine_content, origin } = req.query;

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
            pv.sku
        FROM 
            Products p
        JOIN 
            Product_Variant pv ON p.product_id = pv.product_id
    `;

    // Array to store dynamic conditions
    let conditions = [];
    let params = [];

    // Add conditions based on query parameters
    if (category_id) {
        conditions.push(`p.category_id = ?`);
        params.push(category_id);
    }
    if (roast_level) {
        conditions.push(`p.roast_level = ?`);
        params.push(roast_level);
    }
    if (bean_type) {
        conditions.push(`p.bean_type = ?`);
        params.push(bean_type);
    }
    if (grind_type) {
        conditions.push(`p.  = ?`);
        params.push(grind_type);
    }
    if (caffeine_content) {
        conditions.push(`p.caffeine_content = ?`);
        params.push(caffeine_content);
    }
    if (origin) {
        conditions.push(`p.origin = ?`);
        params.push(origin);
    }

    // Append conditions to the query if any
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    db.query(query, params, (error, results) => {
        if (error) {
            console.error('Error retrieving products:', error.message); // Log message only
            return res.status(500).json({ 
                error: 'Failed to retrieve products. Please try again later.',
                details: error.message // Optional, can be removed for user-facing API
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                error: 'No products found matching the criteria.'
            });
        }

        res.json(results);
    });
});

// GET endpoint to fetch all variants for a specific product
app.get('/api/products/:product_id/variants', (req, res) => {
    const { product_id } = req.params;

    const query = `
        SELECT 
            variant_id, 
            product_id, 
            weight_grams, 
            price, 
            stock, 
            sku
        FROM 
            Product_Variant
        WHERE 
            product_id = ?
    `;

    db.query(query, [product_id], (error, results) => {
        if (error) {
            console.error('Error retrieving variants:', error.message);
            return res.status(500).json({ 
                error: 'Failed to retrieve variants. Please try again later.',
                details: error.message 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                error: 'No variants found for the specified product.'
            });
        }

        res.json({
            product_id,
            variants: results,
        });
    });
});



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

// POST endpoint to create a new product
app.post('/api/products', (req, res) => {
    const productData = req.body;
    const query = 'INSERT INTO Products SET ?';
    db.query(query, productData, (error, results) => {
      if (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res
        .status(201)
        .json({ message: 'Product created', productId: results.insertId });
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
app.get('/api/product/variants/:variant_id', (req, res) => {
    const variantId = req.params.variant_id;

    const productQuery = `
        SELECT 
            p.product_id,
            p.name, 
            p.origin, 
            p.roast_level, 
            p.bean_type, 
            p.grind_type, 
            p.flavor_profile, 
            p.processing_method, 
            p.caffeine_content, 
            p.description, 
            pv.variant_id, 
            pv.weight_grams, 
            pv.price, 
            pv.stock, 
            pv.sku 
        FROM 
            Products p 
        JOIN 
            Product_Variant pv ON p.product_id = pv.product_id 
        WHERE 
            pv.variant_id = ?;
    `;

    const imagesQuery = `
        SELECT image_url, alt_text FROM Product_Images WHERE product_id = ?;
    `;

    db.query(productQuery, [variantId], (error, results) => {
        if (error) {
            console.error('Error retrieving product details:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const product = results[0];

        db.query(imagesQuery, [product.product_id], (imgError, imgResults) => {
            if (imgError) {
                console.error('Error retrieving product images:', imgError);
                return res.status(500).json({ error: 'Internal server error' });
            }
            product.images = imgResults.map(img => ({
                url: img.image_url,
                alt: img.alt_text
            }));
            res.json(product);
        });
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
