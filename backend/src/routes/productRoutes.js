const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get("/products", productController.listProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.get("/product/variants/:variant_id", productController.getProductDetailsByVariant);
router.get("/products/:product_id/variants", productController.allVariantsOfProductId);
router.get('/product/variant/:variantId/images', productController.getImagesForVariant);
router.get('/product/variant/:variantId/discount', productController.getDiscountForVariant);

module.exports = router;
