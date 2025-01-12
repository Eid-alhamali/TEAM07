/**
 * @file checkoutController.test.js
 * @description Unit tests (20 total) for checkoutController.checkout
 */

const fs = require('fs');
const { generateInvoicePdf, sendInvoiceEmail } = require('../controllers/invoiceMail');
const dbPool = require('../config/promise/promise_db.js');
const { checkout } = require('../controllers/checkoutController');

// Mocks
jest.mock('fs');
jest.mock('../controllers/invoiceMail', () => ({
  generateInvoicePdf: jest.fn(),
  sendInvoiceEmail: jest.fn(),
}));
jest.mock('../config/promise/promise_db.js', () => ({
  getConnection: jest.fn(),
}));

describe('checkoutController', () => {
  let mockReq, mockRes;
  let mockConnection;

  const validRequestBody = {
    address: {
      line1: '123 Mock St',
      city: 'Mockville',
      state: 'MockState',
      postalCode: '12345',
      country: 'MockCountry',
    },
    payment: { method: 'card' },
    cartItems: [
      { variantId: 1, quantity: 2, price: 10.0 },
      { variantId: 2, quantity: 1, price: 5.0 },
    ],
    totalPrice: 25.0,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      user: { user_id: 999 }, // normally set by authMiddleware
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock a DB connection
    mockConnection = {
      beginTransaction: jest.fn().mockResolvedValue(),
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
      release: jest.fn().mockResolvedValue(),
      execute: jest.fn(),
      query: jest.fn(),
    };
    dbPool.getConnection.mockResolvedValue(mockConnection);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) Basic Validation Tests (Missing Fields)
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Validation Checks', () => {
    test('should return 400 if address is missing', async () => {
      mockReq.body = { ...validRequestBody, address: undefined };
      await checkout(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields.' });
    });

    test('should return 400 if payment is missing', async () => {
      mockReq.body = { ...validRequestBody, payment: undefined };
      await checkout(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields.' });
    });

    test('should return 400 if cartItems is missing', async () => {
      mockReq.body = { ...validRequestBody, cartItems: undefined };
      await checkout(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields.' });
    });

    test('should return 400 if totalPrice is missing', async () => {
      mockReq.body = { ...validRequestBody, totalPrice: undefined };
      await checkout(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Missing required fields.' });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 2) DB Insertion & Transaction Flow
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Transaction Flow & Success Path', () => {
    test('should place an order successfully (201)', async () => {
      // Arrange
      mockReq.body = { ...validRequestBody };

      // Mock DB calls in sequence
      // 1) Insert into Orders => returns { insertId: 1234 }
      mockConnection.execute.mockResolvedValueOnce([{ insertId: 1234 }]);
      // 2) Insert into OrderItems => .query
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      // 3) DELETE cart items
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 2 }]);
      // 4) For each cartItem => update stock => repeated calls
      // We'll just mock them all as success
      mockConnection.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // for variantId=1
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // for variantId=2
        // 5) Generate invoice
        // next calls in the chain are outside the DB logic
        ;

      generateInvoicePdf.mockResolvedValue('/path/to/invoice.pdf');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(Buffer.from('FAKE_PDF_DATA'));
      mockConnection.execute.mockResolvedValueOnce([{ insertId: 5678 }]); // Insert invoice

      sendInvoiceEmail.mockResolvedValue(); // email success

      // Act
      await checkout(mockReq, mockRes);

      // Assert
      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Order placed successfully.',
        order_id: 1234,
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3) Error Handling in DB Operations
  // ─────────────────────────────────────────────────────────────────────────────
  describe('DB Errors & Rollback', () => {
    test('should rollback if error inserting into Orders', async () => {
      mockReq.body = { ...validRequestBody };
      mockConnection.execute.mockRejectedValueOnce(new Error('Insert Orders Error'));

      await checkout(mockReq, mockRes);
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred during checkout.',
        error: 'Insert Orders Error',
      });
    });

    test('should rollback if error inserting OrderItems', async () => {
      mockReq.body = { ...validRequestBody };
      // 1) Insert orders OK
      mockConnection.execute.mockResolvedValueOnce([{ insertId: 999 }]);
      // 2) Insert into OrderItems => fail
      mockConnection.query.mockRejectedValueOnce(new Error('Insert OrderItems Error'));

      await checkout(mockReq, mockRes);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred during checkout.',
        error: 'Insert OrderItems Error',
      });
    });

    test('should rollback if error deleting cart items', async () => {
      mockReq.body = { ...validRequestBody };
      // 1) Insert orders => ok
      mockConnection.execute.mockResolvedValueOnce([{ insertId: 999 }]);
      // 2) Insert OrderItems => ok
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      // 3) Delete cart => fail
      mockConnection.execute.mockRejectedValueOnce(new Error('Delete Cart Error'));

      await checkout(mockReq, mockRes);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred during checkout.',
        error: 'Delete Cart Error',
      });
    });

    test('should rollback if insufficient stock for any item', async () => {
      mockReq.body = { ...validRequestBody };
      // 1) Insert Orders => ok
      mockConnection.execute.mockResolvedValueOnce([{ insertId: 999 }]);
      // 2) Insert OrderItems => ok
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
      // 3) Delete cart => ok
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 2 }]);
      // 4) update stock => variant #1 => success
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      // 5) update stock => variant #2 => fail => affectedRows=0 => throw error
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      await checkout(mockReq, mockRes);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred during checkout.',
        error: expect.stringContaining('Insufficient stock for variant ID 2'),
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4) Invoice Generation Errors
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Invoice Generation and File Operations', () => {
    test('should rollback if generateInvoicePdf throws error', async () => {
      mockReq.body = { ...validRequestBody };
      // DB operations succeed up to updating stock
      mockConnection.execute
        .mockResolvedValueOnce([{ insertId: 111 }]) // insert Orders
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // delete cart
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // update stock #1
        .mockResolvedValueOnce([{ affectedRows: 2 }]); // update stock #2
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // insert order items

      generateInvoicePdf.mockRejectedValueOnce(new Error('PDF Generation Error'));

      await checkout(mockReq, mockRes);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred during checkout.',
        error: 'PDF Generation Error',
      });
    });

    test('should rollback if invoice PDF does not exist after generation', async () => {
      mockReq.body = { ...validRequestBody };
      mockConnection.execute
        .mockResolvedValueOnce([{ insertId: 111 }]) // Orders
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // del cart
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // stock #1
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // stock #2
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // insert orderitems

      generateInvoicePdf.mockResolvedValue('/fake/path/to/invoice.pdf');
      fs.existsSync.mockReturnValue(false); // file not found

      await checkout(mockReq, mockRes);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred during checkout.',
        error: expect.stringContaining('PDF was not created'),
      });
    });

    test('should rollback if fs.readFileSync fails', async () => {
      mockReq.body = { ...validRequestBody };
      mockConnection.execute
        .mockResolvedValueOnce([{ insertId: 111 }]) // Orders
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // del cart
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // stock #1
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // stock #2
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // insert orderitems

      generateInvoicePdf.mockResolvedValue('/fake/path/to/invoice.pdf');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Read File Error');
      });

      await checkout(mockReq, mockRes);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred during checkout.',
        error: 'Read File Error',
      });
    });

    test('should rollback if error inserting into Invoices table', async () => {
      // All good until we insert invoice
      mockReq.body = { ...validRequestBody };
      mockConnection.execute
        .mockResolvedValueOnce([{ insertId: 111 }]) // Orders
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // del cart
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // stock #1
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // stock #2
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // Insert orderitems

      generateInvoicePdf.mockResolvedValue('/fake/path/to/invoice.pdf');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(Buffer.from('PDF_DATA'));
      // Insert invoice => fail
      mockConnection.execute.mockRejectedValueOnce(new Error('Insert Invoice Error'));

      await checkout(mockReq, mockRes);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred during checkout.',
        error: 'Insert Invoice Error',
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) Email Errors & Cleanup
  // ─────────────────────────────────────────────────────────────────────────────
  describe('Email and File Cleanup', () => {
    test('should rollback if sendInvoiceEmail fails', async () => {
      mockReq.body = { ...validRequestBody };
      // All DB ops succeed
      mockConnection.execute
        .mockResolvedValueOnce([{ insertId: 111 }]) // insert Orders
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // del cart
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // stock #1
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // stock #2
        .mockResolvedValueOnce([{ insertId: 222 }]); // insert invoice
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // insert orderitems

      generateInvoicePdf.mockResolvedValue('/fake/path/to/invoice.pdf');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(Buffer.from('FAKE_PDF'));
      sendInvoiceEmail.mockRejectedValueOnce(new Error('Email Error'));

      await checkout(mockReq, mockRes);

      // We do a rollback because sending email is part of the success flow
      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'An error occurred during checkout.',
        error: 'Email Error',
      });
    });

    test('should ignore fs.unlink errors and still succeed', async () => {
      mockReq.body = { ...validRequestBody };
      // All DB ops OK
      mockConnection.execute
        .mockResolvedValueOnce([{ insertId: 111 }])
        .mockResolvedValueOnce([{ affectedRows: 2 }]) // del cart
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ affectedRows: 1 }])
        .mockResolvedValueOnce([{ insertId: 999 }]);
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 2 }]); // orderitems

      generateInvoicePdf.mockResolvedValue('/fake/path/to/invoice.pdf');
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(Buffer.from('FAKE_PDF'));
      sendInvoiceEmail.mockResolvedValue();
      // fs.unlink => error
      fs.unlink.mockImplementation((path, cb) => {
        cb(new Error('Unlink Error'));
      });

      await checkout(mockReq, mockRes);

      // Because unlink is after commit, the order is placed successfully anyway.
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.rollback).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Order placed successfully.',
        order_id: 111,
      });
    });
  });
});
