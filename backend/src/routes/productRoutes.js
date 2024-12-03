const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get("/products", productController.listProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.get("/product/variants/:variant_id", productController.getProductByVariantId);
router.get("/products/:product_id/variants", productController.allVariantsOfProductId);

module.exports = router;
