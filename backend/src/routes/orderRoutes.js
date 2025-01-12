const express = require('express');
const orderController = require('../controllers/orderController');
const {authMiddleware} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/getorders', authMiddleware, orderController.getOrders);

router.get('/getallorders', orderController.getAllOrders);

router.get('/getinvoice/:orderId', authMiddleware ,orderController.getInvoice);

router.put('/cancel/:orderId', authMiddleware ,orderController.cancelOrder);

router.get('/getrefunds' , orderController.getRefunds);

router.post('/refund-request',authMiddleware ,orderController.createRefund);

router.post('/refund/:id/approve',orderController.approveRefund );

router.post('/refund/:id/reject',orderController.rejectRefund );

router.put('/updatestatus/:orderId', authMiddleware ,orderController.updateOrderStatus);

module.exports = router;