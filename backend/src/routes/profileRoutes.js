const express = require('express');
const router = express.Router();
const {authMiddleware} = require('../middleware/authMiddleware');
const profileController = require("../controllers/profileController");

router.get('/getprofile', authMiddleware, profileController.getProfile);

router.post('/remove',authMiddleware, profileController.deleteAddress); 

router.post('/add',authMiddleware, profileController.addAddress); 

router.put('/update',authMiddleware, profileController.updateAddress); 

module.exports = router;