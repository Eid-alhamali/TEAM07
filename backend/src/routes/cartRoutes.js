const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const {authMiddleware} = require('../middleware/authMiddleware');




router.put('/increment', authMiddleware, (req, res) => {
    const { variantId } = req.body;
    const userId = req.user.user_id; 
    cartController.incrementItem(variantId, userId, res);
  });
  
router.put('/decrement', authMiddleware, (req, res) => {
    const { variantId } = req.body;
    const userId = req.user.user_id;
    cartController.decrementItem(variantId, userId, res);
  });

router.delete('/remove', authMiddleware, (req, res) => {
    const { variantId } = req.body;
    const userId = req.user.user_id;
    cartController.removeItem(variantId, userId, res);
  });


router.get('/getcartitems', authMiddleware, cartController.getItems);
router.post('/add-to-cart', authMiddleware, cartController.addToCart );
router.get('/variant/:variantId', cartController.getOneItem );
router.post('/sync_cart', authMiddleware, cartController.syncToCart );

module.exports = router;