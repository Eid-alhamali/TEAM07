const express = require('express');
const UsersController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const mysql = require("mysql2");
const {authMiddleware} = require('../middleware/authMiddleware');
const JWT_SECRET = process.env.JWT_SECRET;

// Database connection
const db = require('../config/db');

const router = express.Router();
const usersController = new UsersController(); 


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
          const hashedPassword = crypto.createHash("sha256").update(passwordString).digest("hex");
  
          
          db.query(
            'INSERT INTO Users (first_name, last_name, email, phone_number, password_hash) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone_number, hashedPassword],
            (insertErr, result) => {
              if (insertErr) {
                console.error('Insert error:', insertErr);
                return res.status(500).json({ error: 'Failed to register user' });
              }
          
              const userId = result.insertId; 
              
              
              db.query(
                'INSERT INTO ShoppingCart (user_id) VALUES (?)',
                [userId],
                (cartErr) => {
                  if (cartErr) {
                    console.error('Cart creation error:', cartErr);
                    return res.status(500).json({ error: 'Failed to create shopping cart for user' });
                  }
          
                  res.status(201).json({
                    message: 'User registered successfully and shopping cart created',
                    userId: userId,
                  });
                }
              );
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
  console.error("Received login request:", req.body);

  if (!email || !password) {
      console.error("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
  }

  // Check for a match in Managers table
  const managerQuery = "SELECT manager_id, first_name, last_name, password_hash, role FROM Managers WHERE email = ?";
  console.log("Executing Manager Query:", managerQuery);

  db.query(managerQuery, [email], async (err, results) => {
      console.error("Manager query results:", results);

      if (err) {
          console.error("Database error in Managers query:", err);
          return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length > 0) {
          const manager = results[0];
          console.error("Manager record found:", manager);

          // Hash the provided password using SHA256 to match the database hash
          const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
          console.error("Provided password hashed:", hashedPassword);

          if (hashedPassword !== manager.password_hash) {
              console.error("Password mismatch for manager:", email);
              return res.status(401).json({ error: "Invalid email or password" });
          }

          // Generate JWT token
          const token = jwt.sign(
              { manager_id: manager.manager_id, role: manager.role },
              JWT_SECRET,
              { expiresIn: "12h" }
          );

          console.log("Manager login successful:", email);
          console.log("Generated token and role:", token, manager.role);
          return res.json({ token, role: manager.role }); // Include role in response
      }

      // If no match in Managers, check Users table
      const userQuery = "SELECT user_id, password_hash FROM Users WHERE email = ?";
      console.log("Executing User Query:", userQuery);

      db.query(userQuery, [email], async (userErr, userResults) => {
          console.error("User query results:", userResults);

          if (userErr) {
              console.error("Database error in Users query:", userErr);
              return res.status(500).json({ error: "Internal server error" });
          }

          if (userResults.length === 0) {
              console.error("No user found with email:", email);
              return res.status(401).json({ error: "Invalid email or password" });
          }

          const user = userResults[0];

          const passwordString = String(password);
        
          const hashedPassword = crypto.createHash("sha256").update(passwordString).digest("hex");
          
          if (hashedPassword != user.password_hash) {
              return res.status(401).json({ error: "Invalid email or password" });
          }

          // Generate JWT token for users
          const token = jwt.sign(
              { user_id: user.user_id },
              JWT_SECRET,
              { expiresIn: "12h" }
          );

          console.log("User login successful:", email);
          return res.json({ token, role: "user" }); // Non-admin users
      });
  });
});


router.get('/user-name', authMiddleware, (req, res) => {
  const userId = req.user.user_id; 
  
  if (!userId) {
      return res.status(400).send('User ID not found');
  }

 
  const query = 'SELECT first_name, last_name FROM Users WHERE user_id = ?';

  db.query(query, [userId], (err, results) => {
      if (err) {
          console.error('Database query error:', err);
          return res.status(500).send('Server error');
      }

      if (results.length === 0) {
          return res.status(404).send('User not found');
      }

      // Format the full name
      const fullName = `${results[0].first_name} ${results[0].last_name}`;

      // Send the response
      res.json({ full_name: fullName });
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

router.get('/:id/is-admin', async (req, res) => {
  const { id } = req.params;

  try {
      const isAdminResult = await usersController.isAdmin(id);

      if (isAdminResult.isAdmin) {
          res.json({ isAdmin: true, role: isAdminResult.role });
      } else {
          res.json({ isAdmin: false });
      }
  } catch (err) {
      res.status(400).json({ error: err.message });
  }
});

module.exports = router;
