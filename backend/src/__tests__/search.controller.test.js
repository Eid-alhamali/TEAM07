const SearchController = require('../controllers/search.controller');
const mysql = require('mysql2');

// Mock MySQL connection
jest.mock('mysql2');
const mockConnection = {
    query: jest.fn(),
    end: jest.fn(),
};
mysql.createConnection.mockReturnValue(mockConnection);

let searchController;

beforeAll(() => {
    searchController = new SearchController();
    searchController.con = mockConnection;
});

afterAll(() => {
    searchController.con.end();
});

describe('SearchController', () => {
    const sampleProducts = [
        { product_id: 1, name: 'Espresso Beans', category_id: 1, price: 15.99 },
        { product_id: 2, name: 'French Roast', category_id: 2, price: 12.99 },
    ];

    test('searchProductsByName should return matching products by name', async () => {
        const searchTerm = 'Espresso';
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [sampleProducts[0]])
        );

        const results = await searchController.searchProductsByName(searchTerm);
        expect(results).toEqual([sampleProducts[0]]);
        expect(mockConnection.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM Products WHERE name LIKE ?'),
            [`%${searchTerm}%`],
            expect.any(Function)
        );
    });

    test('searchProductsByCategory should return products by category ID', async () => {
        const categoryId = 1;
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [sampleProducts[0]])
        );

        const results = await searchController.searchProductsByCategory(categoryId);
        expect(results).toEqual([sampleProducts[0]]);
        expect(mockConnection.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM Products WHERE category_id = ?'),
            [categoryId],
            expect.any(Function)
        );
    });

    test('searchProductsByFilters should return products matching multiple filters', async () => {
        const filters = { minPrice: 10, maxPrice: 20, roastLevel: 'Medium' };
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [sampleProducts[1]])
        );

        const results = await searchController.searchProductsByFilters(filters);
        expect(results).toEqual([sampleProducts[1]]);
        expect(mockConnection.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM Products WHERE 1=1'),
            expect.arrayContaining([filters.minPrice, filters.maxPrice]),
            expect.any(Function)
        );
    });

    test('searchProductsByFlavorProfile should return products matching flavor profile keyword', async () => {
        const flavorKeyword = 'Bold';
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [sampleProducts[1]])
        );

        const results = await searchController.searchProductsByFlavorProfile(flavorKeyword);
        expect(results).toEqual([sampleProducts[1]]);
        expect(mockConnection.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM Products WHERE flavor_profile LIKE ?'),
            [`%${flavorKeyword}%`],
            expect.any(Function)
        );
    });

    test('searchProductsByOrigin should return products matching origin', async () => {
        const origin = 'Colombia';
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [sampleProducts[0]])
        );

        const results = await searchController.searchProductsByOrigin(origin);
        expect(results).toEqual([sampleProducts[0]]);
        expect(mockConnection.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM Products WHERE origin = ?'),
            [origin],
            expect.any(Function)
        );
    });

    test('should handle database errors gracefully', async () => {
        const errorMessage = 'Database connection error';

        // Test for searchProductsByName
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(new Error(errorMessage), null)
        );
        await expect(searchController.searchProductsByName('Espresso')).rejects.toThrow(errorMessage);

        // Test for searchProductsByCategory
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(new Error(errorMessage), null)
        );
        await expect(searchController.searchProductsByCategory(1)).rejects.toThrow(errorMessage);
    });
});
