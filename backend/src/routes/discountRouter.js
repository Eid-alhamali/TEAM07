const express = require('express');
const { sendDiscountNotification } = require('../controllers/invoiceMail');

const router = express.Router();

// Notify users about a discount
router.post('/notify-discount', async (req, res) => {
  const { variantId, discountValue } = req.body;

  if (!variantId || !discountValue) {
    return res.status(400).json({ message: 'variantId and discountValue are required.' });
  }

  try {
    await sendDiscountNotification(variantId, discountValue);
    res.status(200).json({ message: 'Notifications sent successfully.' });
  } catch (err) {
    console.error('Error notifying users:', err);
    res.status(500).json({ message: 'Failed to send notifications.', error: err.message });
  }
});

module.exports = router;