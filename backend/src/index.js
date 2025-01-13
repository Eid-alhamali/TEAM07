const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const cartRoutes = require('./routes/cartRoutes');
const searchRoutes = require('./routes/searchRoutes');
const productRoutes = require("./routes/productRoutes");
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes'); // Import review routes
const checkoutRoutes = require('./routes/checkoutRoutes'); 
const orderRoutes = require('./routes/orderRoutes'); 
const wishlistRoutes = require('./routes/wishlistRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const LineRoutes = require('./routes/LineRoutes'); 
const discountRouter = require('./routes/discountRouter'); // Adjust the path as needed
const profileRoutes = require('./routes/profileRoutes');


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
app.use('/auth',authRoutes)
app.use('/checkout', checkoutRoutes);
app.use('/order',orderRoutes)
app.use('/chart',LineRoutes);
app.use('/api/discounts', discountRouter); 

// integrate prodcuts routes
app.use("/api", productRoutes);
app.use('/api/reviews', reviewRoutes); // Add review routes integration

app.use('/api', wishlistRoutes);

app.use('/profile',profileRoutes);

// Database connection
const db = require('./config/db');


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
