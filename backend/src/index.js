const express = require('express');
const mysql = require('mysql2');

const cors = require('cors');
const app = express();
const cartRoutes = require('./routes/cartRoutes');

const port = process.env.PORT;


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Middleware to parse JSON bodies

app.use(express.json());
app.use(cors());

// integrate cart routes
app.use('/api/cart', cartRoutes);

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

// GET endpoint to list all products
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM Products', (error, results) => {
    if (error) {
      console.error('Error retrieving products:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});

// GET endpoint to retrieve a single product by ID
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  db.query(
    'SELECT * FROM Products WHERE product_id = ?',
    [productId],
    (error, results) => {
      if (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(results[0]);
    }
  );
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

app.get('/', (req, res) => {
  res.send('Backend is running');
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app; // Export the app for testing