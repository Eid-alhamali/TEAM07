const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get("/products", productController.listProducts);
router.get("/products/:id", productController.getProductById);
router.post("/products/create", productController.createProduct);
router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);
router.get("/product/variants/:variant_id", productController.getProductDetailsByVariant);
router.get("/products/:product_id/variants", productController.allVariantsOfProductId);
router.get('/product/variant/:variantId/images', productController.getImagesForVariant);
router.get('/product/variant/:variantId/discount', productController.getDiscountForVariant);
router.get("/categories", productController.listCategories);
router.post("/categories/add", productController.addCategory);
router.delete("/categories/:id/delete", productController.deleteCategory);
router.put("/products/variants/:variant_id/stock", productController.updateStock);
router.delete("/products/variants/:variant_id", productController.deleteVariant);
router.get("/product-variants", productController.getAllProductVariants);
router.put("/product-variants/update", productController.updateProductVariants);

module.exports = router;
