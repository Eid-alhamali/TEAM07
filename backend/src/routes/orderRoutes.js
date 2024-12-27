const express = require('express');
const orderController = require('../controllers/orderController');
const {authMiddleware} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/getorders', authMiddleware, orderController.getOrders);
router.get('/getinvoice/:orderId', authMiddleware ,orderController.getInvoice);
router.put('/cancel/:orderId', authMiddleware ,orderController.cancelOrder);
router.put('/updatestatus/:orderId', authMiddleware ,orderController.updateOrderStatus);



module.exports = router;