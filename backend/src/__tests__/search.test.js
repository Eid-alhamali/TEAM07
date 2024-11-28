const request = require("supertest");
const app = require("../index");
const mysql = require("mysql2");

// Mocking the database
jest.mock("mysql2");

describe("Search API Endpoints", () => {
    beforeEach(() => {
        mysql.createConnection().query.mockReset();
    });

    test("GET /api/search should fetch products by name", async () => {
        const mockResults = [
            { product_id: 1, name: "Coffee", description: "Dark roast", price: 10.0, stock: 50, out_of_stock: false },
        ];

        mysql
            .createConnection()
            .query.mockImplementation((sql, params, callback) =>
                callback(null, mockResults)
            );

        const res = await request(app).get("/api/search?name=Coffee");

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual(mockResults);

        const expectedQuery = `
            SELECT 
                p.product_id, 
                p.name, 
                p.description, 
                pv.price, 
                pv.stock, 
                (pv.stock = 0) AS out_of_stock 
            FROM Products p
            LEFT JOIN Product_Variant pv ON p.product_id = pv.product_id
            WHERE p.name LIKE ? AND p.description LIKE ?
            ORDER BY price ASC
        `
            .replace(/\s+/g, " ")
            .trim();

        const receivedQuery = mysql
            .createConnection()
            .query.mock.calls[0][0].replace(/\s+/g, " ")
            .trim();

        expect(receivedQuery).toBe(expectedQuery);
        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.any(String),
            ["%Coffee%", "%%"],
            expect.any(Function)
        );
    });

    test("GET /api/search should fetch products sorted by price descending", async () => {
        const mockResults = [
            { product_id: 1, name: "Coffee", price: 20.0, stock: 50, out_of_stock: false },
            { product_id: 2, name: "Espresso", price: 15.0, stock: 30, out_of_stock: false },
        ];

        mysql
            .createConnection()
            .query.mockImplementation((sql, params, callback) =>
                callback(null, mockResults)
            );

        const res = await request(app).get("/api/search?sort_by=price&sort_order=desc");

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toEqual(mockResults);

        expect(mysql.createConnection().query).toHaveBeenCalledWith(
            expect.stringContaining("ORDER BY price DESC"),
            expect.arrayContaining(["%%", "%%"]),
            expect.any(Function)
        );
    });

    test("GET /api/search should handle invalid sorting parameters", async () => {
        const res = await request(app).get("/api/search?sort_by=popularity&sort_order=asc");

        expect(res.statusCode).toEqual(400);
        expect(res.body).toEqual({ error: "Invalid sorting parameters" });
    });

    test("GET /api/search should return empty results if no products match", async () => {
        mysql
            .createConnection()
            .query.mockImplementation((sql, params, callback) =>
                callback(null, [])
            );

        const res = await request(app).get("/api/search?name=NonexistentProduct");

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveLength(0);
    });
});
