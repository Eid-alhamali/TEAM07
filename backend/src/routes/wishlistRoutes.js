const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/wishlist", wishlistController.getWishlistVariants);
router.post("/wishlist/add", wishlistController.addProductToWishlist);
router.delete("/wishlist/remove", wishlistController.removeProductFromWishlist);
router.get("/wishlist/:variantId/status", wishlistController.getWishlistStatus);

module.exports = router;
