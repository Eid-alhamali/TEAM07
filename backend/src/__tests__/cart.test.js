// cart.test.js
const request = require("supertest");
const app = require("../index");
const mysql = require("mysql2");
const {
    generateMockUserId,
    generateMockVariantId,
    generateMockCartItems,
    generateMockAddress,
} = require("../utils/mockData.js");

// Mocking functions
jest.mock("mysql2");

describe("Cart API Endpoints", () => {
    beforeEach(() => {
        mysql.createConnection().query.mockReset();
    });

    test("GET /api/cart/:user_id should fetch cart items", async () => {
        const mockUserId = generateMockUserId();
        const mockCartItems = generateMockCartItems();

        mysql
            .createConnection()
            .query.mockImplementation((sql, params, callback) =>
                callback(null, mockCartItems)
            );

        const res = await request(app).get(`/api/cart/${mockUserId}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ items: mockCartItems, total: 200 });

        // Normalize query string
        const expectedQuery = `
            SELECT ci.product_id, p.name, p.price, ci.quantity, (p.price * ci.quantity) AS subtotal
            FROM ShoppingCartItems ci
            JOIN Products p ON ci.product_id = p.product_id
            WHERE ci.cart_id = (SELECT cart_id FROM ShoppingCart WHERE user_id = ? LIMIT 1)
            `
            .replace(/\s+/g, " ")
            .trim(); // Remove extra spaces

        const receivedQuery = mysql
            .createConnection()
            .query.mock.calls[0][0].replace(/\s+/g, " ")
            .trim(); // Normalize actual query

        expect(receivedQuery).toBe(expectedQuery); // Compare normalized queries
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.any(String),
            [String(mockUserId)], // Ensure user_id is passed as a string
            expect.any(Function)
        );
    });

    test("POST /api/cart/add should add an item to the cart", async () => {
        const mockUserId = generateMockUserId();
        const mockVariantId = generateMockVariantId();
        const mockQuantity = 3;

        mysql
            .createConnection()
            .query.mockImplementationOnce((sql, params, callback) =>
                callback(null, [{ quantity: 10 }])
            ) // Check stock
            .mockImplementationOnce((sql, params, callback) => callback(null)); // Add to cart

        const res = await request(app).post("/api/cart/add").send({
            user_id: mockUserId,
            variant_id: mockVariantId,
            quantity: mockQuantity,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: "Item added to cart" });
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            "SELECT quantity FROM Product_Variant WHERE variant_id = ?",
            [mockVariantId],
            expect.any(Function)
        );
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO Cart_Items"),
            expect.arrayContaining([mockUserId, mockVariantId, mockQuantity]),
            expect.any(Function)
        );
    });

    test("PUT /api/cart/update should update cart item quantity", async () => {
        const mockUserId = generateMockUserId();
        const mockVariantId = generateMockVariantId(); 
        const mockQuantity = 5;

        mysql
            .createConnection()
            .query.mockImplementationOnce((sql, params, callback) =>
                callback(null, [{ quantity: 10 }])
            ) // Check stock
            .mockImplementationOnce((sql, params, callback) => callback(null)); // Update quantity

        const res = await request(app).put("/api/cart/update").send({
            user_id: mockUserId,
            variant_id: mockVariantId,
            quantity: mockQuantity,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: "Cart item updated" });
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            "SELECT quantity FROM Product_Variant WHERE variant_id = ?",
            [mockVariantId],
            expect.any(Function)
        );
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.stringContaining("UPDATE Cart_Items"),
            expect.arrayContaining([mockQuantity, mockUserId, mockVariantId]),
            expect.any(Function)
        );
    });

    test("DELETE /api/cart/remove should remove an item from the cart", async () => {
        const mockUserId = generateMockUserId();
        const mockVariantId = generateMockVariantId();

        mysql
            .createConnection()
            .query.mockImplementation((sql, params, callback) =>
                callback(null)
            );

        const res = await request(app).delete("/api/cart/remove").send({
            user_id: mockUserId,
            variant_id: mockVariantId,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: "Item removed from cart" });
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM Cart_Items"),
            expect.arrayContaining([mockUserId, mockVariantId]),
            expect.any(Function)
        );
    });

    test("POST /api/cart/checkout should place an order", async () => {
        const mockUserId = generateMockUserId();
        const mockAddress = generateMockAddress();
        const mockCartItems = generateMockCartItems();
        const mockOrderId = 12345;

        mysql
            .createConnection()
            .query.mockImplementationOnce((sql, params, callback) =>
                callback(null, [mockAddress])
            ) // Fetch address
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, mockCartItems)
            ) // Fetch cart items
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, { insertId: mockOrderId })
            ) // Create order
            .mockImplementationOnce((sql, params, callback) => callback(null)) // Insert order items
            .mockImplementationOnce((sql, params, callback) => callback(null)); // Clear cart

        const res = await request(app).post("/api/cart/checkout").send({
            user_id: mockUserId,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({
            message: "Order placed successfully",
            order_id: mockOrderId,
            delivery_address: mockAddress,
        });

        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.stringContaining(
                "SELECT address_id, address_line, city, state, postal_code, country"
            ),
            [mockUserId],
            expect.any(Function)
        );
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.stringContaining(
                "SELECT ci.variant_id, p.price, ci.quantity"
            ),
            [mockUserId],
            expect.any(Function)
        );
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO Orders"),
            [mockUserId, 200],
            expect.any(Function)
        );
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.stringContaining("INSERT INTO Order_Items"),
            expect.any(Array),
            expect.any(Function)
        );
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.stringContaining("DELETE FROM Cart_Items"),
            [mockUserId],
            expect.any(Function)
        );
    });
});
