const express = require('express');
const UsersController = require('../controllers/userController');

const router = express.Router();
const usersController = new UsersController(); // Instantiate UsersController

// Middleware for validating user input
const validateUserInput = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    next();
};

// Registration Endpoint
router.post('/register', async (req, res) => {
    try {
        const user = req.body; // Get user details from the request body
        const result = await usersController.register(user); // Call register method
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login Endpoint
router.post('/login', validateUserInput, async (req, res) => {
    try {
        const { email, password } = req.body; // Get email and password from the request body
        const userDetails = await usersController.login(email, password); // Call login method
        res.status(200).json(userDetails);
    } catch (err) {
        res.status(401).json({ error: err.message }); // Unauthorized
    }
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
