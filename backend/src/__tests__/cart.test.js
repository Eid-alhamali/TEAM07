/**
 * @file cart.test.js
 * @description Unit tests for cartController
 */

const cartController = require('../controllers/cartController');
const db = require('../config/db');

// We mock the entire db module so that db.query can be easily controlled
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

describe('cartController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: {},
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) getItems
  // ─────────────────────────────────────────────────────────────────────────────
  describe('getItems', () => {
    it('should return 400 if user ID is not provided', () => {
      // userId is missing
      req.user = {}; // no user_id
      cartController.getItems(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'User ID is required' });
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should return 500 if DB error occurs', () => {
      req.user.user_id = 123;
      db.query.mockImplementation((sql, params, callback) => {
        callback(new Error('DB Error'), null);
      });

      cartController.getItems(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should return cart items with or without discount applied', () => {
      req.user.user_id = 123;
      const mockResults = [
        {
          product_name: 'Coffee A',
          variantId: 1,
          quantity: 2,
          price: 10,
          weight: 500,
          image: 'urlA',
          discount_type: 'percentage',
          discount_value: 10,
        },
        {
          product_name: 'Coffee B',
          variantId: 2,
          quantity: 1,
          price: 20,
          weight: 250,
          image: 'urlB',
          discount_type: null,
          discount_value: null,
        },
      ];
      db.query.mockImplementation((sql, params, callback) => {
        callback(null, mockResults);
      });

      cartController.getItems(req, res);

      // The second item has no discount
      // The first item discount => 10% off => 10 - 1 = 9
      expect(res.status).not.toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith([
        {
          product_name: 'Coffee A',
          variantId: 1,
          quantity: 2,
          price: 9, // discount applied
          weight: 500,
          image: 'urlA',
          discount_type: 'percentage',
          discount_value: 10,
        },
        {
          product_name: 'Coffee B',
          variantId: 2,
          quantity: 1,
          price: 20,
          weight: 250,
          image: 'urlB',
          discount_type: null,
          discount_value: null,
        },
      ]);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) addToCart
  // ─────────────────────────────────────────────────────────────────────────────
  describe('addToCart', () => {
    it('should return 500 if DB error when retrieving cart', () => {
      req.user.user_id = 1;
      req.body = { variantId: 101 };
      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(new Error('DB Error'), null);
      });

      cartController.addToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should return 404 if cart not found', () => {
      req.user.user_id = 1;
      req.body = { variantId: 101 };
      // First query => SELECT cart_id => returns empty
      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, []);
      });

      cartController.addToCart(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Shopping cart not found' });
    });

    it('should return 500 if DB error when checking item in cart', () => {
      // First query => cart found
      db.query
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, [{ cart_id: 999 }]);
        })
        // second query => fails
        .mockImplementationOnce((sql, params, cb) => {
          cb(new Error('DB Error'), null);
        });

      req.user.user_id = 1;
      req.body = { variantId: 101 };
      cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should increment item if it already exists in cart', () => {
      // 1) cart found
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ cart_id: 999 }]);
      });
      // 2) item found => quantity=5
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ quantity: 5 }]);
      });
      // 3) now calls checkStockAndUpdateCart => we mock the stock query => stock=10
      db.query.mockImplementationOnce((sql, params, cb) => {
        // stock => 10
        cb(null, [{ stock: 10 }]);
      });
      // 4) update query => success
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, { affectedRows: 1 });
      });

      req.user.user_id = 1;
      req.body = { variantId: 101 };
      cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item quantity updated successfully' });
    });

    it('should add item if not in cart', () => {
      // 1) cart found
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ cart_id: 999 }]);
      });
      // 2) item not found => []
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, []);
      });
      // 3) calls checkStockAndAddItem => stock=5
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ stock: 5 }]);
      });
      // 4) insert => success
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, { insertId: 123 });
      });

      req.user.user_id = 1;
      req.body = { variantId: 101 };
      cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item added to cart successfully' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) incrementItem
  // ─────────────────────────────────────────────────────────────────────────────
  describe('incrementItem', () => {
    it('should return 500 if DB error in stock query', () => {
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(new Error('DB error'), null);
      });
      cartController.incrementItem(101, 1, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should return 404 if variant not found in stock query', () => {
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, []);
      });
      cartController.incrementItem(101, 1, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Variant not found' });
    });

    it('should return 500 if DB error in cart query', () => {
      // stock is found
      db.query
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, [{ stock: 10 }]);
        })
        // cart query error
        .mockImplementationOnce((sql, params, cb) => {
          cb(new Error('DB error'), null);
        });

      cartController.incrementItem(101, 1, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should return 404 if item not in cart', () => {
      // 1) stock => 10
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ stock: 10 }]);
      });
      // 2) cart => no item
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, []);
      });

      cartController.incrementItem(101, 1, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item not in cart' });
    });

    it('should return 400 if newQuantity > stock', () => {
      // 1) stock => 2
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ stock: 2 }]);
      });
      // 2) cart => quantity=2 => newQuantity=3 => over stock
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ quantity: 2 }]);
      });

      cartController.incrementItem(101, 1, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient stock' });
    });

    it('should return 500 if DB error while updating quantity', () => {
      db.query
        // stock => 10
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, [{ stock: 10 }]);
        })
        // cart => quantity=2 => newQuantity=3 => OK
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, [{ quantity: 2 }]);
        })
        // update => error
        .mockImplementationOnce((sql, params, cb) => {
          cb(new Error('Update error'), null);
        });

      cartController.incrementItem(101, 1, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to update quantity' });
    });

    it('should succeed with json { message: "success" } if stock is sufficient', () => {
      db.query
        // stock => 10
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, [{ stock: 10 }]);
        })
        // cart => quantity=2 => newQuantity=3 => under stock
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, [{ quantity: 2 }]);
        })
        // update => success
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, { affectedRows: 1 });
        });

      cartController.incrementItem(101, 1, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'success' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4) decrementItem
  // ─────────────────────────────────────────────────────────────────────────────
  describe('decrementItem', () => {
    it('should return 500 if DB error in cart query', () => {
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(new Error('DB error'), null);
      });
      cartController.decrementItem(101, 1, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should return 404 if item not in cart', () => {
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, []);
      });
      cartController.decrementItem(101, 1, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item not in cart' });
    });

    it('should return 400 if currentQuantity <= 1', () => {
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ quantity: 1 }]);
      });
      cartController.decrementItem(101, 1, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Quantity cannot be less than 1' });
    });

    it('should return 500 if DB error while updating quantity', () => {
      // quantity=3 => newQuantity=2 => ok
      db.query
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, [{ quantity: 3 }]);
        })
        // update => error
        .mockImplementationOnce((sql, params, cb) => {
          cb(new Error('Update error'), null);
        });

      cartController.decrementItem(101, 1, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to update quantity' });
    });

    it('should succeed if item decrements successfully', () => {
      db.query
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, [{ quantity: 5 }]);
        })
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, { affectedRows: 1 });
        });

      cartController.decrementItem(101, 1, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'success' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) removeItem
  // ─────────────────────────────────────────────────────────────────────────────
  describe('removeItem', () => {
    it('should return 500 if DB error', () => {
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(new Error('DB Error'), null);
      });
      cartController.removeItem(101, 1, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });

    it('should return 404 if affectedRows=0', () => {
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, { affectedRows: 0 });
      });
      cartController.removeItem(101, 1, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Item not found in cart' });
    });

    it('should succeed with {message: "success"} if item is removed', () => {
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, { affectedRows: 1 });
      });
      cartController.removeItem(101, 1, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'success' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6) getOneItem
  // ─────────────────────────────────────────────────────────────────────────────
  describe('getOneItem', () => {
    it('should return 500 on DB error', () => {
      req.params.variantId = 999;
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(new Error('DB Error'), null);
      });

      cartController.getOneItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });

    it('should return 404 if no results', () => {
      req.params.variantId = 999;
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, []);
      });

      cartController.getOneItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Product variant not found' });
    });

    it('should return 200 and the item details if found', () => {
      req.params.variantId = 999;
      const mockResults = [
        {
          product_name: 'Coffee AAA',
          variantId: 999,
          stock: 50,
          price: 20,
          weight: 500,
          image: 'http://example.com/img.jpg',
        },
      ];
      db.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, mockResults);
      });

      cartController.getOneItem(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResults[0]);
    });
  });
});
