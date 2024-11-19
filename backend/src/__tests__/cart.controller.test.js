const CartController = require('../controllers/cart.controller');
const mysql = require('mysql2');
const config = require('../config/app.config');

// Mock MySQL connection
jest.mock('mysql2');
const mockConnection = {
    query: jest.fn(),
    end: jest.fn(),
};
mysql.createConnection.mockReturnValue(mockConnection);

let cartController;

beforeAll(() => {
    cartController = new CartController();
    cartController.con = mockConnection;
});

afterAll(() => {
    cartController.con.end();
});

describe('CartController', () => {
    const userId = 1; // Example user ID for testing
    const sampleProducts = [
        { id: 1, quantity: 2, size: 'M', price_at_purchase: 10.00 },
        { id: 2, quantity: 1, size: 'L', price_at_purchase: 15.00 }
    ];

    test('addToCart should add products to the cart', async () => {
        mockConnection.query
            .mockImplementationOnce((sql, params, callback) => callback(null, [])) // No existing cart
            .mockImplementationOnce((sql, data, callback) => callback(null, { insertId: 1 })); // Insert new cart

        const response = await cartController.addToCart(sampleProducts, userId);
        expect(response).toBe('Added to the cart!');
    });

    test('getUserCart should retrieve the cart content', async () => {
        const mockCartContent = { content: JSON.stringify(sampleProducts) };
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [mockCartContent]));

        const cartContent = await cartController.getUserCart(userId);
        expect(cartContent).toHaveProperty('content');
        expect(JSON.parse(cartContent.content)).toEqual(expect.arrayContaining(sampleProducts));
    });

    test('updateCart should update the quantity of a product in the cart', async () => {
        const updatedProduct = { id: 1, quantity: 5, size: 'M' };
        const updatedCartContent = [
            { id: 1, quantity: 5, size: 'M', price_at_purchase: 10.00 },
            { id: 2, quantity: 1, size: 'L', price_at_purchase: 15.00 }
        ];

        mockConnection.query
            .mockImplementationOnce((sql, params, callback) => callback(null, [{ content: JSON.stringify(sampleProducts) }])) // Get existing cart
            .mockImplementationOnce((sql, params, callback) => callback(null, { affectedRows: 1 })); // Update cart

        const response = await cartController.updateCart(updatedProduct, userId);
        expect(response).toBe('Cart updated successfully!');

        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [{ content: JSON.stringify(updatedCartContent) }]));
        
        const finalCartContent = await cartController.getUserCart(userId);
        const finalProducts = JSON.parse(finalCartContent.content);
        expect(finalProducts.find(p => p.id === updatedProduct.id && p.size === updatedProduct.size).quantity).toBe(5);
    });

    test('deleteItemFromCart should remove a specific item from the cart', async () => {
        const updatedCartContent = [{ id: 1, quantity: 2, size: 'M', price_at_purchase: 10.00 }];

        mockConnection.query
            .mockImplementationOnce((sql, params, callback) => callback(null, [{ content: JSON.stringify(sampleProducts) }])) // Get existing cart
            .mockImplementationOnce((sql, params, callback) => callback(null, { affectedRows: 1 })); // Update cart after deletion

        const response = await cartController.deleteItemFromCart(2, 'L', userId);
        expect(response).toBe('Item removed from cart successfully!');

        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [{ content: JSON.stringify(updatedCartContent) }]));
        
        const finalCartContent = await cartController.getUserCart(userId);
        const productsAfterDeletion = JSON.parse(finalCartContent.content);
        expect(productsAfterDeletion.find(item => item.id === 2 && item.size === 'L')).toBeUndefined();
    });

    test('emptyCart should remove all items from the cart', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, { affectedRows: 1 })); // Delete cart

        const response = await cartController.emptyCart(userId);
        expect(response).toBe('Cart emptied successfully');

        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [])); // Cart not found after deletion
        
        await expect(cartController.getUserCart(userId)).rejects.toThrow("Cart not found");
    });

    test('checkoutCart should create an order, transfer items, and empty the cart', async () => {
        mockConnection.query
            .mockImplementationOnce((sql, params, callback) => callback(null, [{ content: JSON.stringify(sampleProducts) }])) // Get existing cart
            .mockImplementationOnce((sql, params, callback) => callback(null, { insertId: 100 })) // Insert new order
            .mockImplementationOnce((sql, params, callback) => callback(null, { affectedRows: sampleProducts.length })) // Insert order items
            .mockImplementationOnce((sql, params, callback) => callback(null, { affectedRows: 1 })); // Empty the cart

        const response = await cartController.checkoutCart(userId);
        expect(response).toBe('Checkout successful! Order created.');

        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [])); // Cart not found after checkout

        await expect(cartController.getUserCart(userId)).rejects.toThrow("Cart not found");
    });
});
