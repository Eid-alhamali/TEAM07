/**
 * @file productController.test.js
 * @description Tests for productController.js
 */

const request = require('supertest');
const db = require('../config/db');
const checkoutPool = require('../config/promise/promise_db');
const productController = require('../controllers/productController');

// We assume your main app is exported from ../index or a similar file.
// If you just want pure unit tests (no supertest), you can skip requiring the app.
const app = require('../index');

// ─────────────────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────────────────
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

jest.mock('../config/promise/promise_db', () => ({
  getConnection: jest.fn(),
}));

describe('productController', () => {
  let mockRes;
  beforeEach(() => {
    jest.clearAllMocks();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 1) listProducts
  // ────────────────────────────────────────────────────────────────────────────
  describe('listProducts', () => {
    it('should return 400 if invalid sort_by parameter', () => {
      const mockReq = {
        query: {
          sort_by: 'invalid_column',
          sort_order: 'asc',
        },
      };

      productController.listProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid sort_by parameter.',
      });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should handle DB errors gracefully', () => {
      const mockReq = {
        query: {
          sort_by: 'price',
          sort_order: 'asc',
        },
      };
      db.query.mockImplementation((sql, params, cb) => {
        cb(new Error('DB Error'), null);
      });

      productController.listProducts(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to retrieve products.',
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 2) getProductById
  // ────────────────────────────────────────────────────────────────────────────
  describe('getProductById', () => {
    it('should return 404 if product not found', () => {
      const mockReq = { params: { id: 999 } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(null, []); // no product
      });

      productController.getProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('should return 500 on DB error', () => {
      const mockReq = { params: { id: 1 } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(new Error('DB Error'), null);
      });

      productController.getProductById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 3) listCategories
  // ────────────────────────────────────────────────────────────────────────────
  describe('listCategories', () => {
    it('should return 500 if DB error occurs', () => {
      const mockReq = {};
      db.query.mockImplementation((sql, cb) => {
        cb(new Error('DB Error'), null);
      });

      productController.listCategories(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to fetch categories',
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 4) addCategory
  // ────────────────────────────────────────────────────────────────────────────
  describe('addCategory', () => {
    it('should return 400 if category name is missing', () => {
      const mockReq = { body: { description: 'Desc' } };

      productController.addCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Category name is required',
      });
    });

    it('should return 500 if DB error occurs', () => {
      const mockReq = { body: { name: 'NewCat' } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(new Error('Insert Error'), null);
      });

      productController.addCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to add category',
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 5) deleteCategory
  // ────────────────────────────────────────────────────────────────────────────
  describe('deleteCategory', () => {
    it('should return 404 if category not found', () => {
      const mockReq = { params: { id: 999 } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(null, { affectedRows: 0 });
      });

      productController.deleteCategory(mockReq, mockRes);

      expect(mockRes.status).not.toHaveBeenCalledWith(500);
      expect(mockRes.status).not.toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Category not found',
      });
    });

    it('should handle DB errors', () => {
      const mockReq = { params: { id: 5 } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(new Error('DB Error'), null);
      });

      productController.deleteCategory(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Failed to delete category',
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 6) updateStock
  // ────────────────────────────────────────────────────────────────────────────
  describe('updateStock', () => {
    it('should return 400 if stock is negative', () => {
      const mockReq = {
        params: { variant_id: 10 },
        body: { stock: -5 },
      };

      productController.updateStock(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Stock cannot be negative.',
      });
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 7) createProduct
  // ────────────────────────────────────────────────────────────────────────────
  describe('createProduct', () => {
    let mockReq;
    let mockConn;

    beforeEach(() => {
      mockReq = {
        body: {
          product: {
            name: 'New Coffee',
            origin: 'Brazil',
            roast_level: 'Medium',
            bean_type: 'Arabica',
            grind_type: 'Whole Bean',
            flavor_profile: 'Chocolaty',
            processing_method: 'Natural',
            caffeine_content: 'High',
            category_id: 1,
            description: 'Delicious coffee',
            warranty_status: true,
            distributor_info: 'Some distributor info',
          },
          variants: [
            {
              weight_grams: 500,
              price: 10.99,
              stock: 100,
              sku: 'SKU123',
            },
          ],
          images: [
            {
              image_url: 'http://example.com/img.jpg',
              alt_text: 'Example Image',
            },
          ],
        },
      };

      mockConn = {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
        query: jest.fn(),
      };
      checkoutPool.getConnection.mockResolvedValue(mockConn);
    });

    it('should rollback on error and return 500', async () => {
      // Force an error on first insert
      mockConn.query.mockRejectedValueOnce(new Error('Insert Error'));

      await productController.createProduct(mockReq, mockRes);

      expect(mockConn.beginTransaction).toHaveBeenCalledTimes(1);
      expect(mockConn.rollback).toHaveBeenCalledTimes(1);
      expect(mockConn.commit).not.toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        details: 'Insert Error',
      });
    });

    it('should commit transaction and return 201 on success', async () => {
      // Mock success for each query in the transaction
      mockConn.query
        .mockResolvedValueOnce([{ insertId: 101 }]) // Insert product
        .mockResolvedValueOnce([{ insertId: 202 }]) // Insert variant
        .mockResolvedValueOnce([{}]); // Insert images

      await productController.createProduct(mockReq, mockRes);

      expect(mockConn.beginTransaction).toHaveBeenCalled();
      expect(mockConn.commit).toHaveBeenCalled();
      expect(mockConn.release).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product added successfully',
        productId: 101,
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 8) updateProduct
  // ────────────────────────────────────────────────────────────────────────────
  describe('updateProduct', () => {
    it('should return 404 if product not found', () => {
      const mockReq = {
        params: { id: 10 },
        body: { name: 'Updated Name' },
      };
      db.query.mockImplementation((sql, params, cb) => {
        cb(null, { affectedRows: 0 });
      });

      productController.updateProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 9) deleteProduct
  // ────────────────────────────────────────────────────────────────────────────
  describe('deleteProduct', () => {
    it('should return 404 if product not found', () => {
      const mockReq = { params: { id: 999 } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(null, { affectedRows: 0 });
      });

      productController.deleteProduct(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 10) deleteVariant
  // ────────────────────────────────────────────────────────────────────────────
  describe('deleteVariant', () => {
    it('should return 404 if variant not found', () => {
      const mockReq = { params: { variant_id: 123 } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(null, { affectedRows: 0 });
      });

      productController.deleteVariant(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Variant not found.',
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 11) allVariantsOfProductId
  // ────────────────────────────────────────────────────────────────────────────
  describe('allVariantsOfProductId', () => {
    it('should return 404 if no variants found', () => {
      const mockReq = { params: { product_id: 111 } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(null, []);
      });

      productController.allVariantsOfProductId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No variants found for the specified product.',
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 12) getProductDetails
  // ────────────────────────────────────────────────────────────────────────────
  describe('getProductDetails', () => {
    it('should return 404 if product not found', () => {
      const mockReq = { params: { product_id: 999 } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(null, []);
      });

      productController.getProductDetails(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 13) getProductDetailsByVariant
  // ────────────────────────────────────────────────────────────────────────────
  describe('getProductDetailsByVariant', () => {
    it('should return 404 if product not found', () => {
      const mockReq = { params: { variant_id: 10 } };
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, []); // no product found
      });

      productController.getProductDetailsByVariant(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 14) getImagesForVariant
  // ────────────────────────────────────────────────────────────────────────────
  describe('getImagesForVariant', () => {
    it('should return 500 on DB error', () => {
      const mockReq = { params: { variantId: 999 } };
      db.query.mockImplementation((sql, params, cb) => {
        cb(new Error('DB Error'), null);
      });

      productController.getImagesForVariant(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal Server Error',
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 15) getDiscountForVariant
  // ────────────────────────────────────────────────────────────────────────────
  describe('getDiscountForVariant', () => {
    it('should return 404 if variant is not found', () => {
      const mockReq = { params: { variantId: 999 } };
      db.query.mockImplementationOnce((sql, params, cb) => {
        // First call: fetch variant price => returns empty
        cb(null, []);
      });

      productController.getDiscountForVariant(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Variant not found',
      });
    });
  });
});
