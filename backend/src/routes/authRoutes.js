const express = require('express');
const UsersController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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




const router = express.Router();
const usersController = new UsersController(); 

// Middleware for validating user input


// Registration Endpoint
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, phone_number } = req.body;
  
  
    try {
    
      db.query(
        'SELECT * FROM Users WHERE email = ? OR phone_number = ?',
        [email, phone_number],
        async (err, results) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
  
          if (results.length > 0) {
            return res.status(400).json({ error: 'Email or Phone number already exists' });
          }
  
          const passwordString = String(password);
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(passwordString, salt);
  
          
          db.query(
            'INSERT INTO Users (first_name, last_name, email, phone_number, password_hash) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone_number, hashedPassword],
            (insertErr, result) => {
              if (insertErr) {
                console.error('Insert error:', insertErr);
                return res.status(500).json({ error: 'Failed to register user' });
              }
  
              
              res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
            }
          );
        }
      );
    } catch (err) {
      console.error('Error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });


// Login Endpoint
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    
    
    const query = "SELECT user_id, password_hash FROM Users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];
       
        const passwordString = String(password);
        
        const match = await bcrypt.compare(passwordString, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        
        const token = jwt.sign({ user_id: user.user_id }, "abcd12d", {
            expiresIn: "12h"
        });

        res.json({ token });
    });
});


// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await usersController.getUsers(); // Call getUsers method
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usersController.getUserById(id); // Call getUserById method
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ error: err.message }); // Not Found
    }
});

// Update user details
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userDetails = req.body; // Get updated user details from the request body
        const result = await usersController.updateUserDetails(userDetails, id); // Call updateUserDetails method
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await usersController.deleteUser(id); // Call deleteUser method
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(404).json({ error: err.message }); // Not Found
    }
});

// Update user password
router.put('/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body; // Get new password from the request body

        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const result = await usersController.updatePassword(hashedPassword, id); // Call updatePassword method
        res.status(200).json({ message: result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
