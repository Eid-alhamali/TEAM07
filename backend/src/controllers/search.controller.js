// searchProductsByName: Searches for products by their name using a case-insensitive match. Supports partial name matching.
// searchProductsByCategory: Searches for products within a specific category. Returns all products belonging to the given category ID.
// searchProductsByFilters: Searches for products based on multiple optional filters such as price range, roast level, bean type, and grind type.
// searchProductsByFlavorProfile: Searches for products based on a specific flavor profile keyword.
// searchProductsByOrigin: Searches for products originating from a specific country or region.


const mysql = require('mysql2');
const config = require('../config/app.config');

const SearchController = class {
    constructor() {
        this.con = mysql.createConnection(config.sqlCon);
    }

    // searchProductsByName: Searches for products by name (partial and case-insensitive match)
    searchProductsByName(productName) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Products WHERE name LIKE ?`;
            const formattedName = `%${productName}%`;
            this.con.query(query, [formattedName], (err, results) => {
                if (err) return reject(new Error('Database connection error'));
                resolve(results);
            });
        });
    }

    // searchProductsByCategory: Searches for products within a specific category ID
    searchProductsByCategory(categoryId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Products WHERE category_id = ?`;
            this.con.query(query, [categoryId], (err, results) => {
                if (err) return reject(new Error('Database connection error'));
                resolve(results);
            });
        });
    }

    // searchProductsByFilters: Searches for products with multiple filters (price range, roast level, etc.)
    searchProductsByFilters(filters) {
        return new Promise((resolve, reject) => {
            const { minPrice, maxPrice, roastLevel, beanType, grindType } = filters;
            let query = `SELECT * FROM Products WHERE 1=1`;
            const params = [];

            if (minPrice) {
                query += ` AND price >= ?`;
                params.push(minPrice);
            }
            if (maxPrice) {
                query += ` AND price <= ?`;
                params.push(maxPrice);
            }
            if (roastLevel) {
                query += ` AND roast_level = ?`;
                params.push(roastLevel);
            }
            if (beanType) {
                query += ` AND bean_type = ?`;
                params.push(beanType);
            }
            if (grindType) {
                query += ` AND grind_type = ?`;
                params.push(grindType);
            }

            this.con.query(query, params, (err, results) => {
                if (err) return reject(new Error('Database connection error'));
                resolve(results);
            });
        });
    }

    // searchProductsByFlavorProfile: Searches for products by flavor profile keyword
    searchProductsByFlavorProfile(flavorKeyword) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Products WHERE flavor_profile LIKE ?`;
            const formattedKeyword = `%${flavorKeyword}%`;
            this.con.query(query, [formattedKeyword], (err, results) => {
                if (err) return reject(new Error('Database connection error'));
                resolve(results);
            });
        });
    }

    // searchProductsByOrigin: Searches for products originating from a specific location
    searchProductsByOrigin(origin) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Products WHERE origin = ?`;
            this.con.query(query, [origin], (err, results) => {
                if (err) return reject(new Error('Database connection error'));
                resolve(results);
            });
        });
    }
};

module.exports = SearchController;
