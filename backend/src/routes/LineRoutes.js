const express = require('express');
const LineController = require('../controllers/LineController');


const router = express.Router();

router.get('/getSalesData', LineController.getSalesData);
router.get('/getRefundData', LineController.getRefundData);

module.exports = router;