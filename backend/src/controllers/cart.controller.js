// addToCart: Adds new products to the user's cart. If the product already exists in the cart with the same size, it increments the quantity. If the cart does not exist, it creates a new cart record for the user.
// getUserCart: Retrieves the current cart content for a specified user by their user ID.
// updateCart: Updates the quantity of a specific item in the cart. If the quantity is set to zero, it removes the item from the cart. If the item is not found, it adds the new item to the cart.
// emptyCart: Empties the entire cart for the specified user, removing all items from the cart.
// checkoutCart: Processes the checkout for the user's cart. It creates a new order, transfers cart items to the order, and then empties the cart.
// deleteItemFromCart: Removes a specific item from the cart by product ID and size for the specified user.


const config = require('../config/app.config.js');
const mysql = require('mysql2');

const CartController = class {
    constructor() {
        // Initialize MySQL connection using config
        this.con = mysql.createConnection(config.sqlCon);
    }

    getUserCart(userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT content FROM ShoppingCart WHERE user_id = ?',
                [userId],
                (err, result) => {
                    if (err) return reject(new Error('Database connection error'));
                    if (!result || result.length < 1) {
                        return reject(new Error("Cart not found"));
                    } else {
                        resolve(result[0]);
                    }
                }
            );
        });
    }

    addToCart(newProducts, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                let cartContent = await this.getUserCart(userId);
                let cartProducts = JSON.parse(cartContent.content);

                for (let cartProduct of cartProducts) {
                    for (let newProduct of newProducts) {
                        if (cartProduct.id === newProduct.id && cartProduct.size === newProduct.size) {
                            cartProduct.quantity += newProduct.quantity;
                            newProducts = newProducts.filter(item => item !== newProduct);
                        }
                    }
                }

                cartProducts = JSON.stringify(cartProducts.concat(newProducts));

                this.con.query(
                    'UPDATE ShoppingCart SET content = ? WHERE user_id = ?',
                    [cartProducts, userId],
                    (err) => {
                        if (err) return reject(new Error('Database connection error'));
                        resolve('Added to the cart!');
                    }
                );
            } catch {
                let cartRow = { user_id: userId, content: JSON.stringify(newProducts) };
                this.con.query('INSERT INTO ShoppingCart SET ?', cartRow, (err) => {
                    if (err) return reject(new Error('Database connection error'));
                    resolve('Added to the cart!');
                });
            }
        });
    }

    updateCart(updateProduct, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                let cartContent = await this.getUserCart(userId);
                let cartProducts = JSON.parse(cartContent.content);
                let found = false;

                for (let cartProduct of cartProducts) {
                    if (cartProduct.id === updateProduct.id && cartProduct.size === updateProduct.size) {
                        found = true;
                        if (updateProduct.quantity > 0) {
                            cartProduct.quantity = updateProduct.quantity;
                        } else {
                            cartProducts = cartProducts.filter(item => item !== cartProduct);
                        }
                    }
                }

                if (!found) cartProducts.push(updateProduct);

                cartProducts = JSON.stringify(cartProducts);

                this.con.query(
                    'UPDATE ShoppingCart SET content = ? WHERE user_id = ?',
                    [cartProducts, userId],
                    (err) => {
                        if (err) return reject(new Error('Database connection error'));
                        resolve('Cart updated successfully!');
                    }
                );
            } catch {
                reject(new Error('Could not access cart'));
            }
        });
    }

    deleteItemFromCart(productId, size, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                let cartContent = await this.getUserCart(userId);
                let cartProducts = JSON.parse(cartContent.content);

                cartProducts = cartProducts.filter(
                    item => !(item.id === productId && item.size === size)
                );

                cartProducts = JSON.stringify(cartProducts);

                this.con.query(
                    'UPDATE ShoppingCart SET content = ? WHERE user_id = ?',
                    [cartProducts, userId],
                    (err) => {
                        if (err) return reject(new Error('Database connection error'));
                        resolve('Item removed from cart successfully!');
                    }
                );
            } catch {
                reject(new Error('Could not access cart'));
            }
        });
    }

    emptyCart(userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'DELETE FROM ShoppingCart WHERE user_id = ?',
                [userId],
                (err) => {
                    if (err) {
                        reject(new Error('Database connection error'));
                    } else {
                        resolve('Cart emptied successfully');
                    }
                }
            );
        });
    }

    checkoutCart(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Retrieve user's cart content
                const cartContent = await this.getUserCart(userId);
                const cartProducts = JSON.parse(cartContent.content);

                // Insert a new order for the user
                this.con.query(
                    'INSERT INTO Orders (user_id, total_price, status) VALUES (?, ?, ?)',
                    [userId, 0, 'processing'],
                    (err, orderResult) => {
                        if (err) return reject(new Error('Database connection error'));

                        const orderId = orderResult.insertId;
                        const formattedItems = cartProducts.map(item => [
                            orderId,
                            item.id,
                            item.quantity,
                            item.price_at_purchase // Ensure each item has a price
                        ]);

                        // Insert items into OrderItems table
                        this.con.query(
                            'INSERT INTO OrderItems (order_id, product_id, quantity, price_at_purchase) VALUES ?',
                            [formattedItems],
                            (err) => {
                                if (err) return reject(new Error('Database connection error'));

                                // Empty the cart after successful checkout
                                this.emptyCart(userId)
                                    .then(() => resolve('Checkout successful! Order created.'))
                                    .catch((err) => reject(err));
                            }
                        );
                    }
                );
            } catch {
                reject(new Error('Could not complete checkout'));
            }
        });
    }
};

module.exports = CartController;
