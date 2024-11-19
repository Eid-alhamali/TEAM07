const PaymentController = require('../controllers/payment.controller');
const mysql = require('mysql2');
const config = require('../config/app.config');

// Mock MySQL connection
jest.mock('mysql2');
const mockConnection = {
    query: jest.fn(),
    end: jest.fn(),
};
mysql.createConnection.mockReturnValue(mockConnection);

let paymentController;

beforeAll(() => {
    paymentController = new PaymentController();
    paymentController.con = mockConnection;
});

afterAll(() => {
    paymentController.con.end();
});

describe('PaymentController', () => {
    const userId = 1; // Example user ID
    const paymentId = 1; // Example payment ID
    const orderId = 1; // Example order ID
    const samplePayment = {
        payment_id: paymentId,
        order_id: orderId,
        user_id: userId,
        amount: 100.0,
        card_holder_name: "John Doe",
        card_number: "encrypted_card_number",
        card_expiration: "2025-12-31",
        cvv: "encrypted_cvv",
    };

    test('addPayment should add a new payment record', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const response = await paymentController.addPayment(samplePayment);
        expect(response).toBe('Payment added successfully!');
    });

    test('getPaymentById should retrieve payment details by payment ID', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [samplePayment])
        );

        const payment = await paymentController.getPaymentById(paymentId);
        expect(payment).toEqual(samplePayment);
    });

    test('getPaymentsByUser should retrieve all payments for a specific user', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [samplePayment])
        );

        const payments = await paymentController.getPaymentsByUser(userId);
        expect(payments).toEqual([samplePayment]);
    });

    test('updatePayment should update the details of a specific payment', async () => {
        const updatedPayment = { amount: 150.0 };
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const response = await paymentController.updatePayment(paymentId, updatedPayment);
        expect(response).toBe('Payment updated successfully!');
    });

    test('deletePayment should remove a payment record by payment ID', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const response = await paymentController.deletePayment(paymentId);
        expect(response).toBe('Payment deleted successfully!');
    });
});
