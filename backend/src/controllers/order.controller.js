// create: Creates a new order record in the database for the specified user with the initial status set to "processing".
// saveOrderProducts: Saves a list of products associated with a specific order ID. It stores each product in the OrderItems table with details like quantity and price at the time of purchase.
// getOrderById: Retrieves the details of a specific order based on its order ID. If the order does not exist, it returns an error.
// getAllOrdersByUserId: Retrieves all orders associated with a specific user based on their user ID.
// getOrderItems: Retrieves the items associated with a specific order based on the order ID, including details like quantity and price for each item.
// updateOrderStatus: Updates the status of an order based on the order ID. If the order does not exist, it returns an error.
// cancelOrder: Sets the status of a specific order to "canceled" based on the order ID. If the order does not exist, it returns an error.


const config = require('../config/app.config.js');
const mysql = require('mysql2');

const OrdersController = class {
    constructor() {
        // Initialize MySQL connection using config
        this.con = mysql.createConnection(config.sqlCon);
    }

    create(order) {
        return new Promise((resolve, reject) => {
            this.con.query('INSERT INTO Orders SET ?', order, (err, result) => {
                if (err) return reject(new Error('Database connection error'));
                resolve(result.insertId);
            });
        });
    }

    saveOrderProducts(orderId, cartContent) {
        const formattedItems = cartContent.map(item => [
            orderId,
            parseInt(item.id),
            item.quantity,
            item.price_at_purchase
        ]);

        return new Promise((resolve, reject) => {
            this.con.query(
                'INSERT INTO OrderItems (order_id, product_id, quantity, price_at_purchase) VALUES ?',
                [formattedItems],
                (err, result) => {
                    if (err) return reject(new Error(err));
                    resolve(result);
                }
            );
        });
    }

    getOrderById(orderId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM Orders WHERE order_id = ?',
                [orderId],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error("Order not found"));
                    } else {
                        resolve(result[0]);
                    }
                }
            );
        });
    }

    getAllOrdersByUserId(userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM Orders WHERE user_id = ?',
                [userId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    }

    getOrderItems(orderId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM OrderItems WHERE order_id = ?',
                [orderId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    }

    updateOrderStatus(orderId, status) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'UPDATE Orders SET status = ? WHERE order_id = ?',
                [status, orderId],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.affectedRows === 0) {
                        return reject(new Error("Order not found"));
                    } else {
                        resolve('Order status updated successfully');
                    }
                }
            );
        });
    }

    cancelOrder(orderId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'UPDATE Orders SET status = "canceled" WHERE order_id = ?',
                [orderId],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.affectedRows === 0) {
                        return reject(new Error("Order not found"));
                    } else {
                        resolve('Order canceled successfully');
                    }
                }
            );
        });
    }
};

module.exports = OrdersController;
