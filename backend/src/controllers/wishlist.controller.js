//getUserWishlist: Retrieves the current wishlist content for a specified user by their user ID.
//addToWishlist: Adds a new product to the user's wishlist. If the product is already in the wishlist, it won’t duplicate the entry.
//removeFromWishlist: Removes a specific product from the wishlist by product ID for the specified user.

const config = require('../config/app.config');
const mysql = require('mysql2');

const WishlistController = class {
    constructor() {
        // Initialize MySQL connection using config
        this.con = mysql.createConnection(config.sqlCon);
    }

    // Retrieves the current wishlist content for a specified user by their user ID
    getUserWishlist(userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM WishlistItems JOIN Products ON WishlistItems.product_id = Products.product_id WHERE WishlistItems.user_id = ?',
                [userId],
                (err, result) => {
                    if (err) return reject(new Error('Database connection error'));
                    if (!result || result.length < 1) {
                        return reject(new Error("Wishlist not found"));
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    }

    // Adds a product to the user's wishlist. If it already exists, it won't duplicate the entry.
    addToWishlist(productId, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if the product is already in the wishlist
                const existingWishlist = await this.getUserWishlist(userId);
                const productInWishlist = existingWishlist.find(item => item.product_id === productId);

                if (productInWishlist) {
                    resolve('Product already in wishlist');
                } else {
                    // If not in wishlist, add it
                    const wishlistItem = { user_id: userId, product_id: productId };
                    this.con.query('INSERT INTO WishlistItems SET ?', wishlistItem, (err) => {
                        if (err) return reject(new Error('Database connection error'));
                        resolve('Added to wishlist!');
                    });
                }
            } catch (error) {
                // If the wishlist doesn't exist, create the wishlist entry
                const wishlistItem = { user_id: userId, product_id: productId };
                this.con.query('INSERT INTO WishlistItems SET ?', wishlistItem, (err) => {
                    if (err) return reject(new Error('Database connection error'));
                    resolve('Added to wishlist!');
                });
            }
        });
    }

    // Removes a specific product from the wishlist by product ID for the specified user
    removeFromWishlist(productId, userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'DELETE FROM WishlistItems WHERE user_id = ? AND product_id = ?',
                [userId, productId],
                (err, result) => {
                    if (err) return reject(new Error('Database connection error'));
                    if (result.affectedRows === 0) {
                        return reject(new Error("Product not found in wishlist"));
                    } else {
                        resolve('Product removed from wishlist successfully');
                    }
                }
            );
        });
    }
};

module.exports = WishlistController;
