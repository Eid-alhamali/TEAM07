const request = require('supertest');
const app = require('../index');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock data for products
const mockProducts = [
  {
    product_id: 1,
    name: 'Colombian Single Origin',
    price: 10,
    roast_level: 'Medium',
    bean_type: 'Arabica',
  },
  {
    product_id: 2,
    name: 'Italian Espresso Blend',
    price: 20,
    roast_level: 'Espresso',
    bean_type: 'Blend',
  },
];

// Mocking functions
jest.mock('mysql2');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Product API Endpoints', () => {
  beforeEach(() => {
    mysql.createConnection().query.mockReset();
  });

test('GET /api/products should return all products', async () => {
  mysql.createConnection().query.mockImplementation((sql, params, callback) => {
    expect(sql).toContain('SELECT'); // Validate essential SQL fragment
    expect(params).toEqual([]); // Ensure no parameters for unfiltered query
    callback(null, mockProducts); // Mock database response
  });

  const res = await request(app).get('/api/products');

  expect(res.statusCode).toEqual(200); // Ensure status code is 200
  expect(res.body).toEqual(mockProducts); // Ensure response matches mock data
  expect(mysql.createConnection().query).toHaveBeenCalledWith(
    expect.any(String),
    expect.any(Array),
    expect.any(Function)
  );
});

  test('GET /api/products with filters should return filtered products', async () => {
    const queryParameters = { roast_level: 'Medium', bean_type: 'Arabica' };

    mysql.createConnection().query.mockImplementation((sql, params, callback) => {
      expect(sql).toContain('WHERE p.roast_level = ? AND p.bean_type = ?'); // Validate SQL conditions
      expect(params).toEqual(['Medium', 'Arabica']); // Validate query parameters
      callback(null, [mockProducts[0]]); // Return filtered result
    });

    const res = await request(app).get('/api/products').query(queryParameters);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([mockProducts[0]]);
  });

  test('GET /api/products/:id should return a single product', async () => {
    mysql.createConnection().query.mockImplementation((sql, params, callback) => callback(null, [mockProducts[0]]));

    const res = await request(app).get('/api/products/1');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockProducts[0]);
    expect(mysql.createConnection().query).toHaveBeenCalledWith(
      'SELECT * FROM Products WHERE product_id = ?',
      ['1'],
      expect.any(Function)
    );
  });

  test('POST /api/products should create a new product', async () => {
    const newProduct = { name: 'New Product', price: 30 };
    mysql.createConnection().query.mockImplementation((sql, data, callback) => callback(null, { insertId: 3 }));

    const res = await request(app).post('/api/products').send(newProduct);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({ message: 'Product created', productId: 3 });
    expect(mysql.createConnection().query).toHaveBeenCalledWith(
      'INSERT INTO Products SET ?',
      newProduct,
      expect.any(Function)
    );
  });

});