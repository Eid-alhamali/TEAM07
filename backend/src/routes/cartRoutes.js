const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:user_id', cartController.getCartItems);
router.post('/add', cartController.addItemToCart);
router.put('/update', cartController.updateCartItemQuantity);
router.delete('/remove', cartController.removeCartItem);
router.post('/checkout', cartController.checkoutCart);

module.exports = router;

