const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT;


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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


    //Hash the password before storing
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Insert the new user with the hashed password
      const insertUserQuery = 'INSERT INTO Users SET ?';
      const newUser = {
        first_name,
        last_name,
        email,
        phone_number,
        password_hash: hash, // **Store the hashed password**
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
});

// **Added POST endpoint for user login with authentication**
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;

  // Fetch the user by email
  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare the provided password with the stored password hash
    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate a JWT token
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ message: 'Login successful', token });
    });
  });
});

// DELETE endpoint to delete a user
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'DELETE FROM Users WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// PUT endpoint to update a user's details
app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { first_name, last_name, email, phone_number, password } = req.body;

  // Hash the password if provided
  const updateUser = { first_name, last_name, email, phone_number };
  if (password) {
    const saltRounds = 10;
    updateUser.password_hash = await bcrypt.hash(password, saltRounds);
  }

  const query = 'UPDATE Users SET ? WHERE user_id = ?';
  db.query(query, [updateUser, userId], (err, results) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// GET endpoint to retrieve a user's details by ID
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT user_id, first_name, last_name, email, phone_number FROM Users WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// GET endpoint to list all users
app.get('/api/users', (req, res) => {
  const query = 'SELECT user_id, first_name, last_name, email, phone_number FROM Users';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving users:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
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