const mysql = require("mysql2");

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL connected");
});

// GET endpoint to fetch cart items
exports.getCartItems = (req, res) => {
    const { user_id } = req.params;

    if (!user_id) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const query = `
        SELECT ci.product_id, p.name, p.price, ci.quantity, (p.price * ci.quantity) AS subtotal
        FROM ShoppingCartItems ci
        JOIN Products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = (SELECT cart_id FROM ShoppingCart WHERE user_id = ? LIMIT 1)
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error("Error retrieving cart items:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (!results.length) {
            return res.status(200).json({ items: [], total: 0 });
        }

        const total = results.reduce((sum, item) => sum + item.subtotal, 0);
        res.json({ items: results, total });
    });
};

// POST endpoint to add an item to the cart with stock check
exports.addItemToCart = (req, res) => {
    const { user_id, variant_id, quantity } = req.body;

    if (!user_id || !variant_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: "Invalid input parameters" });
    }

    const checkStockQuery =
        "SELECT quantity FROM Product_Variant WHERE variant_id = ?";
    db.query(checkStockQuery, [variant_id], (err, results) => {
        if (err) {
            console.error("Error checking stock:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (!results.length || results[0].quantity < quantity) {
            return res.status(400).json({ error: "Insufficient stock" });
        }

        const addToCartQuery = `
            INSERT INTO Cart_Items (cart_id, variant_id, quantity)
            VALUES (
                (SELECT cart_id FROM ShoppingCart WHERE user_id = ? LIMIT 1),
                ?, ?
            )
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
        db.query(addToCartQuery, [user_id, variant_id, quantity], (err) => {
            if (err) {
                console.error("Error adding to cart:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            res.json({ message: "Item added to cart" });
        });
    });
};

// PUT endpoint to update cart item quantity
exports.updateCartItemQuantity = (req, res) => {
    const { user_id, variant_id, quantity } = req.body;

    if (!user_id || !variant_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: "Invalid input parameters" });
    }

    const stockQuery =
        "SELECT quantity FROM Product_Variant WHERE variant_id = ?";
    db.query(stockQuery, [variant_id], (err, results) => {
        if (err) {
            console.error("Error validating stock:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (!results.length || results[0].quantity < quantity) {
            return res.status(400).json({ error: "Insufficient stock" });
        }

        const updateQuery = `
            UPDATE Cart_Items
            SET quantity = ?
            WHERE cart_id = (SELECT cart_id FROM ShoppingCart WHERE user_id = ?)
            AND variant_id = ?
        `;
        db.query(updateQuery, [quantity, user_id, variant_id], (err) => {
            if (err) {
                console.error("Error updating cart item:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            res.json({ message: "Cart item updated" });
        });
    });
};

// DELETE endpoint to remove an item from the cart
exports.removeCartItem = (req, res) => {
    const { user_id, variant_id } = req.body;

    if (!user_id || !variant_id) {
        return res.status(400).json({ error: "Invalid input parameters" });
    }

    const removeQuery = `
        DELETE FROM Cart_Items
        WHERE cart_id = (SELECT cart_id FROM ShoppingCart WHERE user_id = ?)
        AND variant_id = ?
    `;
    db.query(removeQuery, [user_id, variant_id], (err) => {
        if (err) {
            console.error("Error removing item from cart:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.json({ message: "Item removed from cart" });
    });
};

// Post endpoint to checkout cart

exports.checkoutCart = (req, res) => {
    const { user_id } = req.body;

    const addressQuery = `
        SELECT address_id, address_line, city, state, postal_code, country
        FROM Address
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(addressQuery, [user_id], (err, addressResult) => {
        if (err) {
            console.error("Error fetching user address:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (!addressResult.length) {
            return res
                .status(400)
                .json({ error: "No address found for the user" });
        }

        const deliveryAddress = addressResult[0];

        const cartQuery = `
            SELECT ci.variant_id, p.price, ci.quantity
            FROM Cart_Items ci
            JOIN Product_Variant pv ON ci.variant_id = pv.variant_id
            JOIN Products p ON pv.product_id = p.product_id
            WHERE ci.cart_id = (SELECT cart_id FROM ShoppingCart WHERE user_id = ?)
        `;

        db.query(cartQuery, [user_id], (err, cartItems) => {
            if (err) {
                console.error("Error fetching cart items:", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (!cartItems.length) {
                return res.status(400).json({ error: "Cart is empty" });
            }

            const totalPrice = cartItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            const createOrderQuery = `
                INSERT INTO Orders (user_id, total_price, status, created_at)
                VALUES (?, ?, 'processing', NOW())
            `;

            db.query(createOrderQuery, [user_id, totalPrice], (err, result) => {
                if (err) {
                    console.error("Error creating order:", err);
                    return res
                        .status(500)
                        .json({ error: "Internal server error" });
                }

                const orderId = result.insertId;

                const orderItemsQuery = `
                    INSERT INTO Order_Items (order_id, variant_id, quantity, price)
                    VALUES ?
                `;

                const orderItems = cartItems.map((item) => [
                    orderId,
                    item.variant_id,
                    item.quantity,
                    item.price,
                ]);

                db.query(orderItemsQuery, [orderItems], (err) => {
                    if (err) {
                        console.error("Error inserting order items:", err);
                        return res
                            .status(500)
                            .json({ error: "Internal server error" });
                    }

                    const clearCartQuery = `
                        DELETE FROM Cart_Items
                        WHERE cart_id = (SELECT cart_id FROM ShoppingCart WHERE user_id = ?)
                    `;

                    db.query(clearCartQuery, [user_id], (err) => {
                        if (err) {
                            console.error("Error clearing cart:", err);
                            return res
                                .status(500)
                                .json({ error: "Internal server error" });
                        }

                        res.json({
                            message: "Order placed successfully",
                            order_id: orderId,
                            delivery_address: deliveryAddress,
                        });
                    });
                });
            });
        });
    });
};
