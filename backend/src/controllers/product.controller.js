// getAll: Retrieves a list of all products in the database. If no products are found, it returns an error.
// getAllWithVariants: Retrieves a list of all products along with their variants from the Product_Variant table. If no products with variants are found, it returns an error.
// getProductById: Retrieves details of a specific product based on its product ID, including variants. If the product does not exist, it returns an error.
// getProductsByIdList: Retrieves details for a list of products based on an array of product IDs. If none of the specified products are found, it returns an error.
// checkStock: Checks the stock level for a specific product variant based on the product ID and variant ID. If stock information is not available, it returns an error.
// updateProductDetails: Updates product details, including associated variants, based on the provided product ID and updated information for the product and variants.
// updateProduct: Updates basic product information based on the provided product ID. This is typically used as part of updateProductDetails.
// updateVariant: Updates information for a specific variant of a product based on the product ID and variant ID.
// getPaginatedProducts: Retrieves a paginated list of products based on the page number. If there are no products on the specified page, it returns an error.
// getOutOfStockProducts: Retrieves a list of products that are currently out of stock. If all products are in stock, it returns an error.


const config = require('../config/app.config.js');
const mysql = require('mysql2');

const ProductsController = class {
    constructor() {
        // Initialize MySQL connection using config
        this.con = mysql.createConnection(config.sqlCon);
    }

    getAll() {
        return new Promise((resolve, reject) => {
            this.con.query('SELECT * FROM `Products`', (err, result) => {
                if (err) return reject(err);
                if (result.length < 1) {
                    return reject(new Error("No registered products"));
                } else {
                    resolve(result);
                }
            });
        });
    }

    getAllWithVariants() {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM Product_Variant JOIN Products ON Product_Variant.product_id = Products.product_id',
                (err, result) => {
                    if (err) return reject(new Error(err));
                    if (result.length < 1) {
                        return reject(new Error("No registered products with variants"));
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    getProductById(id) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM Products JOIN Product_Variant ON Products.product_id = Product_Variant.product_id WHERE Products.product_id = ?',
                [id],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error("Product not found"));
                    } else {
                        resolve(result[0]);
                    }
                }
            );
        });
    }

    getProductsByIdList(idList) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT Products.product_id, Products.name, Product_Variant.weight_grams, Product_Variant.price FROM Products JOIN Product_Variant ON Products.product_id = Product_Variant.product_id WHERE Products.product_id IN (?)',
                [idList],
                (err, result) => {
                    if (err) return reject(err);
                    if (!result || result.length < 1) {
                        return reject(new Error("Products not found"));
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    checkStock(id, variant_id) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT stock FROM Product_Variant WHERE product_id = ? AND variant_id = ?',
                [id, variant_id],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error("Stock information not available"));
                    } else {
                        resolve(result[0]);
                    }
                }
            );
        });
    }

    async updateProductDetails(product, variants, productId) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.updateProduct(product, productId);
                for (let variant of variants) {
                    await this.updateVariant(variant, productId);
                }
                resolve('Product and variants updated successfully!');
            } catch (e) {
                reject(e);
            }
        });
    }

    updateProduct(product, productId) {
        return new Promise((resolve, reject) => {
            this.con.query('UPDATE `Products` SET ? WHERE `product_id` = ?', [product, productId], (err, result) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }

    updateVariant(variant, productId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'UPDATE `Product_Variant` SET ? WHERE `product_id` = ? AND `variant_id` = ?',
                [variant, productId, variant.variant_id],
                (err, result) => {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
    }

    getPaginatedProducts(page) {
        const itemsPerPage = 3;
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM `Products` ORDER BY product_id ASC LIMIT ? OFFSET ?',
                [itemsPerPage, page * itemsPerPage],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error("No more products available"));
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    getOutOfStockProducts() {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM Product_Variant RIGHT JOIN Products ON Product_Variant.product_id = Products.product_id WHERE Product_Variant.stock = 0',
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error("All products are in stock"));
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }
};

module.exports = ProductsController;
