const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT;

// Middleware to parse JSON bodies
app.use(express.json());

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
    if (error) throw error;
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


// POST endpoint for user registration
app.post('/api/users/register', async (req, res) => {
  const { first_name, last_name, email, phone_number, password } = req.body;

  // Check if the user already exists
  const checkUserQuery = 'SELECT * FROM Users WHERE email = ?';
  db.query(checkUserQuery, [email], async (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }


    // Insert the new user
    const insertUserQuery = 'INSERT INTO Users SET ?';
    const newUser = {
      first_name,
      last_name,
      email,
      phone_number,
      password_hash: password,
    };
    db.query(insertUserQuery, newUser, (error, result) => {
      if (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res
        .status(201)
        .json({ message: 'User registered', userId: result.insertId });
    });
  });
});


// GET endpoit to list all users
app.get('/api/users', (req,res) => {
  db.query('SELECT * FROM Users', (error,results) => {
    if (error) throw error;
    res.json(results);
  })
})

// GET endpoint to retrieve a specific user by ID
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT * FROM Users WHERE user_id = ?';

  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});



app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});