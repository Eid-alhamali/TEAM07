const request = require('supertest');
const app = require('../index');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock data for products and users
const mockProducts = [
  { product_id: 1, name: 'Product 1', price: 10 },
  { product_id: 2, name: 'Product 2', price: 20 },
];

const mockUsers = [
  { user_id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
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
    mysql.createConnection().query.mockImplementation((sql, callback) => callback(null, mockProducts));

    const res = await request(app).get('/api/products');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(mockProducts);
    expect(mysql.createConnection().query).toHaveBeenCalledWith('SELECT * FROM Products', expect.any(Function));
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

describe('User API Endpoints', () => {
  beforeEach(() => {
    mysql.createConnection().query.mockReset();
  });

  test('POST /api/users/register should register a new user', async () => {
    const newUser = { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com', password: 'password123' };
    mysql.createConnection().query
      .mockImplementationOnce((sql, params, callback) => callback(null, [])) // Check if user exists
      .mockImplementationOnce((sql, data, callback) => callback(null, { insertId: 1 })); // Insert new user

    const res = await request(app).post('/api/users/register').send(newUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({ message: 'User registered', userId: 1 });
    expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10, expect.any(Function));
  });

  test('POST /api/users/login should log in a user', async () => {
    const loginData = { email: 'john@example.com', password: 'password123' };
    mysql.createConnection().query.mockImplementationOnce((sql, params, callback) =>
      callback(null, [{ user_id: 1, password_hash: 'hashedPassword' }])
    );

    const res = await request(app).post('/api/users/login').send(loginData);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: 'Login successful', token: 'mock-jwt-token' });
    expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, 'hashedPassword', expect.any(Function));
  });
});
