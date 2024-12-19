const express = require('express');
const {checkout} = require('../controllers/checkoutController');
const {authMiddleware} = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/status', authMiddleware,checkout);

module.exports = router;
