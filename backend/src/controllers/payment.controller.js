// addPayment: Adds a new payment record to the Payments table in the database. It includes details like the user ID, order ID, payment amount, and encrypted card information.
// getPaymentById: Retrieves the details of a specific payment record based on its payment ID. If the payment does not exist, it returns an error.
// getPaymentsByUser: Retrieves all payment records associated with a specific user based on their user ID. It returns an array of payment records or an empty array if none exist.
// updatePayment: Updates the details of a specific payment record based on its payment ID. If the payment record does not exist, it returns an error.
// deletePayment: Deletes a payment record from the Payments table based on its payment ID. If the payment record does not exist, it returns an error.


const config = require('../config/app.config.js');
const mysql = require('mysql2');

const PaymentController = class {
    constructor() {
        // Initialize MySQL connection using config
        this.con = mysql.createConnection(config.sqlCon);
    }

    // addPayment: Adds a new payment record to the database.
    addPayment(paymentDetails) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO Payments SET ?';
            this.con.query(query, paymentDetails, (err, result) => {
                if (err) return reject(new Error('Database connection error'));
                resolve('Payment added successfully!');
            });
        });
    }

    // getPaymentById: Retrieves a specific payment by its ID.
    getPaymentById(paymentId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Payments WHERE payment_id = ?';
            this.con.query(query, [paymentId], (err, result) => {
                if (err) return reject(new Error('Database connection error'));
                if (!result || result.length < 1) {
                    return reject(new Error('Payment not found'));
                } else {
                    resolve(result[0]);
                }
            });
        });
    }

    // getPaymentsByUser: Retrieves all payment records for a specific user.
    getPaymentsByUser(userId) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM Payments WHERE user_id = ?';
            this.con.query(query, [userId], (err, result) => {
                if (err) return reject(new Error('Database connection error'));
                resolve(result);
            });
        });
    }

    // updatePayment: Updates the details of a specific payment by its ID.
    updatePayment(paymentId, updatedDetails) {
        return new Promise((resolve, reject) => {
            const query = 'UPDATE Payments SET ? WHERE payment_id = ?';
            this.con.query(query, [updatedDetails, paymentId], (err, result) => {
                if (err) return reject(new Error('Database connection error'));
                if (result.affectedRows === 0) {
                    return reject(new Error('Payment not found'));
                }
                resolve('Payment updated successfully!');
            });
        });
    }

    // deletePayment: Deletes a payment record by its ID.
    deletePayment(paymentId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM Payments WHERE payment_id = ?';
            this.con.query(query, [paymentId], (err, result) => {
                if (err) return reject(new Error('Database connection error'));
                if (result.affectedRows === 0) {
                    return reject(new Error('Payment not found'));
                }
                resolve('Payment deleted successfully!');
            });
        });
    }
};

module.exports = PaymentController;
