const WishlistController = require('../controllers/wishlist.controller');
const mysql = require('mysql2');
const config = require('../config/app.config');

// Mock MySQL connection
jest.mock('mysql2');
const mockConnection = {
    query: jest.fn(),
    end: jest.fn(),
};
mysql.createConnection.mockReturnValue(mockConnection);

let wishlistController;

beforeAll(() => {
    wishlistController = new WishlistController();
    wishlistController.con = mockConnection;
});

afterAll(() => {
    wishlistController.con.end();
});

describe('WishlistController', () => {
    const userId = 1; // Example user ID
    const productId = 1; // Example product ID for testing

    test('getUserWishlist should retrieve the wishlist content for a user', async () => {
        const sampleWishlist = [{ product_id: productId, user_id: userId }];
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, sampleWishlist)
        );

        const wishlist = await wishlistController.getUserWishlist(userId);
        expect(Array.isArray(wishlist)).toBe(true);
        expect(wishlist).toEqual(sampleWishlist);
    });

    test('addToWishlist should add a product to the wishlist if it is not already present', async () => {
        mockConnection.query
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, []) // Simulate empty result for product not in wishlist
            )
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, { affectedRows: 1 }) // Simulate successful insert
            );

        const response = await wishlistController.addToWishlist(productId, userId);
        expect(response).toBe('Added to wishlist!');
    });

    test('addToWishlist should not add a product if it is already in the wishlist', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [{ product_id: productId, user_id: userId }]) // Simulate product found in wishlist
        );

        const response = await wishlistController.addToWishlist(productId, userId);
        expect(response).toBe('Product already in wishlist');
    });

    test('removeFromWishlist should remove a product from the wishlist', async () => {
        // Step 1: Simulate product presence in the wishlist
        mockConnection.query
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, [{ product_id: productId, user_id: userId }]) // Simulate existing wishlist entry
            )
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, { affectedRows: 1 }) // Simulate successful deletion
            )
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, []) // Simulate empty result, confirming removal
            );

        // Step 2: Test product removal
        const response = await wishlistController.removeFromWishlist(productId, userId);
        expect(response).toBe('Product removed from wishlist successfully');

        // Step 3: Confirm the product is no longer in the wishlist
        const wishlist = await wishlistController.getUserWishlist(userId);
        expect(wishlist).not.toContainEqual(expect.objectContaining({ product_id: productId }));
    });
});
