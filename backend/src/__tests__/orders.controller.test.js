const OrdersController = require('../controllers/order.controller');
const mysql = require('mysql2');
const config = require('../config/app.config');

// Mock MySQL connection
jest.mock('mysql2');
const mockConnection = {
    query: jest.fn(),
    end: jest.fn(),
};
mysql.createConnection.mockReturnValue(mockConnection);

let ordersController;

beforeAll(() => {
    ordersController = new OrdersController();
    ordersController.con = mockConnection;
});

afterAll(() => {
    ordersController.con.end();
});

describe('OrdersController', () => {
    const userId = 1; // Example user ID
    const sampleOrder = { user_id: userId, total_price: 50, status: 'processing' };
    let orderId = 100; // Example order ID

    const sampleOrderItems = [
        { id: 1, quantity: 2, price_at_purchase: 10.00 },
        { id: 2, quantity: 1, price_at_purchase: 30.00 }
    ];

    test('create should create a new order and return the order ID', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, { insertId: orderId }));

        const resultOrderId = await ordersController.create(sampleOrder);
        expect(resultOrderId).toBe(orderId);
    });

    test('saveOrderProducts should save products associated with an order ID', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: sampleOrderItems.length })
        );

        const response = await ordersController.saveOrderProducts(orderId, sampleOrderItems);
        expect(response.affectedRows).toBe(sampleOrderItems.length);
    });

    test('getOrderById should retrieve a specific order by ID', async () => {
        const expectedOrder = {
            order_id: orderId,
            user_id: userId,
            total_price: sampleOrder.total_price,
            status: sampleOrder.status,
        };
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [expectedOrder]));

        const order = await ordersController.getOrderById(orderId);
        expect(order).toEqual(expectedOrder);
    });

    test('getAllOrdersByUserId should retrieve all orders associated with a specific user ID', async () => {
        const expectedOrders = [
            { order_id: 101, user_id: userId, total_price: 25, status: 'completed' },
            { order_id: 102, user_id: userId, total_price: 50, status: 'processing' }
        ];
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, expectedOrders));

        const orders = await ordersController.getAllOrdersByUserId(userId);
        expect(orders).toEqual(expect.arrayContaining(expectedOrders));
    });

    test('getOrderItems should retrieve items associated with a specific order ID', async () => {
        const expectedItems = sampleOrderItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price_at_purchase
        }));
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, expectedItems));

        const items = await ordersController.getOrderItems(orderId);
        expect(items).toEqual(expect.arrayContaining(expectedItems));
    });

    test('updateOrderStatus should update the status of a specific order', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, { affectedRows: 1 }));

        const response = await ordersController.updateOrderStatus(orderId, 'shipped');
        expect(response).toBe('Order status updated successfully');

        // Verify the updated status
        const updatedOrder = { ...sampleOrder, order_id: orderId, status: 'shipped' };
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [updatedOrder]));

        const finalOrder = await ordersController.getOrderById(orderId);
        expect(finalOrder).toHaveProperty('status', 'shipped');
    });

    test('cancelOrder should set the status of a specific order to "canceled"', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, { affectedRows: 1 }));

        const response = await ordersController.cancelOrder(orderId);
        expect(response).toBe('Order canceled successfully');

        // Verify the canceled status
        const canceledOrder = { ...sampleOrder, order_id: orderId, status: 'canceled' };
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [canceledOrder]));

        const finalOrder = await ordersController.getOrderById(orderId);
        expect(finalOrder).toHaveProperty('status', 'canceled');
    });
});
