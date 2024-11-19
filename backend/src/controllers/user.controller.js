// save: Saves a new user record in the database with the provided user details.
// getUserByEmail: Retrieves user information based on the user's email. If the user does not exist, it returns an error.
// isAdmin: Checks if the user with the specified user ID has an admin role. Returns `true` if the user is an admin, otherwise `false`.
// getUserById: Retrieves user information based on the user's ID. If the user does not exist, it returns an error.
// updateNameAndEmail: Updates the first name and email of a user based on their user ID.
// updatePassword: Updates the password of a user with the provided hashed password based on their user ID.
// getUsers: Retrieves a list of all users who have either a user or admin role.
// updateUserDetails: Updates the details of a user based on the provided user ID and updated information.
// deleteUser: Deletes a user record based on the user's ID. If the user does not exist, it returns an error.


const config = require('../config/app.config');
const mysql = require('mysql2');

const UsersController = class {
    constructor() {
        // Initialize MySQL connection using config
        this.con = mysql.createConnection(config.sqlCon);
    }

    save(user) {
        return new Promise((resolve, reject) => {
            this.con.query('INSERT INTO Users SET ?', user, (err, result) => {
                if (err) return reject(err);
                resolve(result.insertId);
            });
        });
    }

    getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM `Users` WHERE `email` = ?',
                [email],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error("User not found"));
                    } else {
                        resolve(result[0]);
                    }
                }
            );
        });
    }

    isAdmin(id) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM `Users` WHERE `user_id` = ?',
                [id],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error("User not found"));
                    } else {
                        const userType = result[0].role;
                        if (userType === 'admin') resolve(true);
                        else resolve(false);
                    }
                }
            );
        });
    }

    getUserById(id) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM `Users` WHERE `user_id` = ?',
                [id],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error("User not found"));
                    } else {
                        resolve(result[0]);
                    }
                }
            );
        });
    }

    updateNameAndEmail(name, email, userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'UPDATE `Users` SET `first_name` = ?, `email` = ? WHERE `user_id` = ?',
                [name, email, userId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve('User details updated successfully');
                }
            );
        });
    }

    updatePassword(hashedPassword, userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'UPDATE `Users` SET `password_hash` = ? WHERE `user_id` = ?',
                [hashedPassword, userId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve('Password updated successfully');
                }
            );
        });
    }

    getUsers() {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM `Users` WHERE `role` IN ("user", "admin")',
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            );
        });
    }

    updateUserDetails(user, userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'UPDATE `Users` SET ? WHERE `user_id` = ?',
                [user, userId],
                (err, result) => {
                    if (err) return reject(err);
                    resolve('User details updated successfully');
                }
            );
        });
    }

    deleteUser(userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'DELETE FROM `Users` WHERE `user_id` = ?',
                [userId],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.affectedRows === 0) {
                        return reject(new Error("User not found"));
                    } else {
                        resolve('User deleted successfully');
                    }
                }
            );
        });
    }
};

module.exports = UsersController;
