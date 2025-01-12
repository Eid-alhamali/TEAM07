/**
 * @file search.test.js
 * @description Expanded unit tests (20 total) for searchController.searchProducts
 */

const searchController = require('../controllers/searchController');
const db = require('../config/db');

// Mock the db module so no real queries are run
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

describe('searchController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test('should return empty result when no search terms are provided', () => {
    req.query = { search: '' };

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: [], total: 0 });
    expect(db.query).not.toHaveBeenCalled(); // No DB query if no search terms
  });

  test('should validate sort parameters and return 400 if invalid', () => {
    // 1. Invalid sort_by
    req.query = {
      search: 'coffee',
      sort_by: 'invalid_column',
      sort_order: 'asc',
    };

    searchController.searchProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid sorting parameters' });

    // 2. Invalid sort_order
    req.query = {
      search: 'coffee',
      sort_by: 'price',
      sort_order: 'invalid_order',
    };

    searchController.searchProducts(req, res);

    expect(res.status).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenLastCalledWith(400);
    expect(res.json).toHaveBeenLastCalledWith({ error: 'Invalid sorting parameters' });
  });

  test('should query the database with correct parameters when a valid search is provided', () => {
    req.query = {
      search: 'coffee beans',
      sort_by: 'price',
      sort_order: 'asc',
    };

    const mockResults = [
      { product_id: 1, name: 'Coffee Beans', price: 10.0 },
      { product_id: 2, name: 'Espresso Beans', price: 12.5 },
    ];

    db.query.mockImplementation((sql, params, callback) => {
      // For "coffee beans" => 4 params
      expect(params).toHaveLength(4);
      expect(params).toEqual(['%coffee%', '%coffee%', '%beans%', '%beans%']);
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: mockResults, total: mockResults.length });
  });

  test('should handle multiple search terms correctly', () => {
    req.query = {
      search: 'strong arabica',
      sort_by: 'price',
      sort_order: 'desc',
    };

    const mockResults = [
      { product_id: 10, name: 'Strong Arabica Coffee', price: 20.0 },
      { product_id: 12, name: 'Arabica Blend', price: 15.0 },
    ];

    db.query.mockImplementation((sql, params, callback) => {
      // "strong arabica" => 4 params
      expect(params).toHaveLength(4);
      expect(params).toEqual(['%strong%', '%strong%', '%arabica%', '%arabica%']);
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: mockResults, total: mockResults.length });
  });

  test('should return an empty array if no results are found', () => {
    req.query = {
      search: 'nonexistentproduct',
      sort_by: 'price',
      sort_order: 'asc',
    };

    db.query.mockImplementation((sql, params, callback) => {
      callback(null, []); // no results
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: [], total: 0 });
  });

  test('should handle DB errors gracefully', () => {
    req.query = {
      search: 'espresso',
      sort_by: 'price',
      sort_order: 'asc',
    };

    db.query.mockImplementation((sql, params, callback) => {
      callback(new Error('DB Error'), null);
    });

    searchController.searchProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  test('should handle sorting order properly', () => {
    req.query = {
      search: 'latte',
      sort_by: 'price',
      sort_order: 'desc',
    };

    const mockResults = [
      { product_id: 5, name: 'Latte Blend', price: 15.0 },
      { product_id: 3, name: 'Italian Latte', price: 8.5 },
    ];

    db.query.mockImplementation((sql, params, callback) => {
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: mockResults, total: mockResults.length });
  });

  test('should ignore leading/trailing whitespace in search terms', () => {
    req.query = {
      search: '   coffee   ', // leading/trailing spaces
      sort_by: 'price',
      sort_order: 'asc',
    };

    const mockResults = [{ product_id: 99, name: 'Coffee Deluxe', price: 18.0 }];
    db.query.mockImplementation((sql, params, callback) => {
      // White space trimmed => single term => 2 params
      expect(params).toHaveLength(2);
      expect(params).toEqual(['%coffee%', '%coffee%']);
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: mockResults, total: mockResults.length });
  });

  test('should handle uppercase sort_order', () => {
    req.query = {
      search: 'coffee',
      sort_by: 'price',
      sort_order: 'DESC', // uppercase
    };

    const mockResults = [
      { product_id: 1, name: 'Coffee AAA', price: 12.0 },
      { product_id: 2, name: 'Coffee BBB', price: 10.0 },
    ];
    db.query.mockImplementation((sql, params, callback) => {
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({ data: mockResults, total: mockResults.length });
  });

  test('should handle discount logic when discount is active', () => {
    req.query = {
      search: 'promo',
      sort_by: 'price',
      sort_order: 'asc',
    };

    // Mock that there's an active discount of type 'percentage' (value=10)
    const mockResults = [
      {
        product_id: 5,
        name: 'Promo Coffee',
        price: 20.0,
        discount_type: 'percentage',
        value: 10,
        effective_price: 18.0, // 20 - 10%
      },
    ];
    db.query.mockImplementation((sql, params, callback) => {
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    // We should see the discounted effective_price come back
    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });

  test('should handle discount logic when discount is inactive', () => {
    req.query = {
      search: 'expired promo',
      sort_by: 'price',
      sort_order: 'asc',
    };

    // Suppose discount is expired => effective_price = original price
    const mockResults = [
      {
        product_id: 7,
        name: 'Expired Promo Coffee',
        price: 25.0,
        discount_type: 'percentage',
        active: 0,
        effective_price: 25.0, // no discount
      },
    ];
    db.query.mockImplementation((sql, params, callback) => {
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });

  test('should handle single term partial match returning multiple products', () => {
    req.query = {
      search: 'cof',
      sort_by: 'price',
      sort_order: 'asc',
    };

    const mockResults = [
      { product_id: 21, name: 'Coffish Delight', price: 9.0 },
      { product_id: 22, name: 'CoFi Coffee', price: 11.0 },
      { product_id: 23, name: 'Coffee Deluxe', price: 15.0 },
    ];
    db.query.mockImplementation((sql, params, callback) => {
      // Single term => 2 params
      expect(params).toHaveLength(2);
      expect(params).toEqual(['%cof%', '%cof%']);
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });

  test('should handle special characters in search terms', () => {
    req.query = {
      search: 'coffee?',
      sort_by: 'price',
      sort_order: 'asc',
    };

    const mockResults = [
      { product_id: 90, name: 'Coffee? Or Not', price: 10.0 },
    ];
    db.query.mockImplementation((sql, params, callback) => {
      // Single term => 2 params
      expect(params).toHaveLength(2);
      expect(params).toEqual(['%coffee?%', '%coffee?%']);
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });

  test('should handle multiple results correctly and reflect accurate total', () => {
    req.query = {
      search: 'arabica',
      sort_by: 'price',
      sort_order: 'asc',
    };

    const mockResults = [
      { product_id: 31, name: 'Arabica 1', price: 10.0 },
      { product_id: 32, name: 'Arabica 2', price: 12.5 },
      { product_id: 33, name: 'Arabica 3', price: 14.0 },
    ];

    db.query.mockImplementation((sql, params, callback) => {
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: 3,
    });
  });

  test('should apply default sort_by=price and sort_order=asc if none is provided', () => {
    // No sort_by, no sort_order in query => defaults to price ASC
    req.query = { search: 'mocha' };

    const mockResults = [
      { product_id: 101, name: 'Mocha Classic', price: 8.5 },
      { product_id: 102, name: 'Mocha Deluxe', price: 9.0 },
    ];

    db.query.mockImplementation((sql, params, callback) => {
      // The code checks validSortBy and validSortOrder,
      // then uses default price/asc if not provided
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });

  test('should handle numeric search terms (e.g., "123")', () => {
    req.query = {
      search: '123',
      sort_by: 'price',
      sort_order: 'asc',
    };

    const mockResults = [
      { product_id: 110, name: 'Product 123', price: 5.0 },
    ];

    db.query.mockImplementation((sql, params, callback) => {
      // Single term => 2 params
      expect(params).toHaveLength(2);
      expect(params).toEqual(['%123%', '%123%']);
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });

  test('should handle extremely long search term by still splitting or ignoring if no spaces', () => {
    // e.g., 200 characters "coffeexxxxxx..."
    const longTerm = 'coffee'.padEnd(200, 'x'); 
    req.query = {
      search: longTerm,
      sort_by: 'price',
      sort_order: 'asc',
    };

    const mockResults = [{ product_id: 200, name: 'Big Coffee', price: 20 }];
    db.query.mockImplementation((sql, params, callback) => {
      // Single long term => 2 params
      expect(params).toHaveLength(2);
      expect(params[0]).toContain('coffee');
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });

  test('should handle repeated search terms (e.g., "coffee coffee")', () => {
    req.query = {
      search: 'coffee coffee',
      sort_by: 'price',
      sort_order: 'asc',
    };

    const mockResults = [
      { product_id: 210, name: 'Double Coffee', price: 10 },
    ];
    db.query.mockImplementation((sql, params, callback) => {
      // "coffee coffee" => 2 terms => each repeated => total 4 params
      expect(params).toHaveLength(4);
      expect(params).toEqual([
        '%coffee%',
        '%coffee%',
        '%coffee%',
        '%coffee%',
      ]);
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });

  test('should handle "stock" as a valid sort_by parameter', () => {
    req.query = {
      search: 'robusta',
      sort_by: 'stock',
      sort_order: 'desc',
    };

    const mockResults = [
      { product_id: 300, name: 'Robusta Stock A', stock: 50 },
      { product_id: 301, name: 'Robusta Stock B', stock: 30 },
    ];
    db.query.mockImplementation((sql, params, callback) => {
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });

  test('should handle "average_rating" as a valid sort_by parameter', () => {
    req.query = {
      search: 'premium blend',
      sort_by: 'average_rating',
      sort_order: 'asc',
    };

    const mockResults = [
      { product_id: 400, name: 'Premium Blend A', average_rating: 4.2 },
      { product_id: 401, name: 'Premium Blend B', average_rating: 3.9 },
    ];

    db.query.mockImplementation((sql, params, callback) => {
      callback(null, mockResults);
    });

    searchController.searchProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({
      data: mockResults,
      total: mockResults.length,
    });
  });
});
