const searchController = require('../controllers/searchController');
const db = require('../config/db');

jest.mock('../config/db', () => ({
    query: jest.fn()
}));

describe('searchController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    test('should return empty result when no search terms are provided', () => {
        // If no search terms provided, controller responds with empty data immediately.
        req.query = { search: '' };

        searchController.searchProducts(req, res);

        expect(res.json).toHaveBeenCalledWith({ data: [], total: 0 });
    });

    test('should validate sort parameters and return 400 if invalid', () => {
        // Invalid sort_by
        req.query = {
            search: 'coffee',
            sort_by: 'invalid_column',
            sort_order: 'asc'
        };
        
        searchController.searchProducts(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid sorting parameters" });

        // Invalid sort_order
        req.query = {
            search: 'coffee',
            sort_by: 'price',
            sort_order: 'invalid_order'
        };
        
        searchController.searchProducts(req, res);

        expect(res.status).toHaveBeenCalledTimes(2); // second call
        expect(res.status).toHaveBeenLastCalledWith(400);
        expect(res.json).toHaveBeenLastCalledWith({ error: "Invalid sorting parameters" });
    });

    test('should query the database with correct parameters when a valid search is provided', () => {
        req.query = {
            search: 'coffee beans',
            sort_by: 'price',
            sort_order: 'asc'
        };

        // Mock DB response
        const mockResults = [
            { product_id: 1, name: 'Coffee Beans', price: 10.00 },
            { product_id: 2, name: 'Espresso Beans', price: 12.50 }
        ];

        db.query.mockImplementation((sql, params, callback) => {
            // Check if the query includes the expected WHERE clauses
            // The controller splits "coffee beans" into two terms: "coffee", "beans"
            // Expect parameters for two terms: 4 params (2 for "coffee", 2 for "beans"), plus sort_by at the end
            expect(params).toHaveLength(5);
            // The last param is sort_by added at the end
            expect(params[params.length - 1]).toBe('price');

            // Simulate successful DB call
            callback(null, mockResults);
        });

        searchController.searchProducts(req, res);

        // After db.query callback is executed
        expect(res.json).toHaveBeenCalledWith({ data: mockResults, total: mockResults.length });
    });

    test('should handle multiple search terms correctly', () => {
        req.query = {
            search: 'strong arabica',
            sort_by: 'price',
            sort_order: 'desc'
        };

        const mockResults = [
            { product_id: 10, name: 'Strong Arabica Coffee', price: 20.00 },
            { product_id: 12, name: 'Arabica Blend', price: 15.00 }
        ];

        db.query.mockImplementation((sql, params, callback) => {
            // The terms are 'strong' and 'arabica'
            // Each term adds two params -> total 4 + 1 for sort_by = 5
            expect(params).toHaveLength(5);
            expect(params[params.length - 1]).toBe('price');
            callback(null, mockResults);
        });

        searchController.searchProducts(req, res);

        expect(res.json).toHaveBeenCalledWith({ data: mockResults, total: mockResults.length });
    });

    test('should return an empty array if no results are found', () => {
        req.query = {
            search: 'nonexistentproduct',
            sort_by: 'price',
            sort_order: 'asc'
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
            sort_order: 'asc'
        };

        db.query.mockImplementation((sql, params, callback) => {
            callback(new Error('DB Error'), null);
        });

        searchController.searchProducts(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    });

    test('should handle sorting order properly', () => {
        // Test descending order
        req.query = {
            search: 'latte',
            sort_by: 'price',
            sort_order: 'desc'
        };

        const mockResults = [
            { product_id: 5, name: 'Latte Blend', price: 15.00 },
            { product_id: 3, name: 'Italian Latte', price: 8.50 }
        ];

        db.query.mockImplementation((sql, params, callback) => {
            // Just return the mockResults in descending order
            callback(null, mockResults);
        });

        searchController.searchProducts(req, res);

        expect(res.json).toHaveBeenCalledWith({ data: mockResults, total: mockResults.length });
    });
});
