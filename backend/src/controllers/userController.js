// save: Saves a new user record in the database with the provided user details.
// getUserByEmail: Retrieves user information based on the user's email. If the user does not exist, it returns an error.
// isAdmin: Checks if the user with the specified user ID has an admin role. Returns `true` if the user is an admin, otherwise `false`.
// getUserById: Retrieves user information based on the user's ID. If the user does not exist, it returns an error.
// updateNameAndEmail: Updates the first name and email of a user based on their user ID.
// updatePassword: Updates the password of a user with the provided hashed password based on their user ID.
// getUsers: Retrieves a list of all users who have either a user or admin role.
// updateUserDetails: Updates the details of a user based on the provided user ID and updated information.
// deleteUser: Deletes a user record based on the user's ID. If the user does not exist, it returns an error.


const config = require('../config/appConfig.js');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');


const UsersController = class {
    constructor() {
        // Initialize MySQL connection using config
        this.con = mysql.createConnection(config.sqlCon);
    }

    register(user) {
        return new Promise(async (resolve, reject) => {
            try {
                user.password_hash = await bcrypt.hash(user.password, 10); // Hash the password
                delete user.password; // Remove plain password

                const userId = await this.save(user); // Save the user
                resolve({ message: 'Registration successful', userId });
            } catch (err) {
                reject(new Error('Registration failed: ' + err.message));
            }
        });
    }

    login(email, password) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("we are here");
                const user = await this.getUserByEmail(email);

                // Validate password
                const passwordMatch = await bcrypt.compare(password, user.password_hash);
                if (!passwordMatch) {
                    return reject(new Error('Invalid email or password'));
                }

                // Exclude password_hash in response
                const { password_hash, ...userDetails } = user;
                resolve(userDetails);
            } catch (err) {
                reject(new Error('Login failed: ' + err.message));
            }
        });
    }
    
    save(user) {
        return new Promise((resolve, reject) => {

            this.con.query(
                'SELECT * FROM `Users` WHERE `email` = ? OR `phone_number` = ?',
                [user.email, user.phone_number],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length > 0) {     // Ensure email and phone_number are unique before inserting
                        return reject(new Error('Email or phone number already exists'));
                    }
                    // Insert user after validation
                    this.con.query('INSERT INTO Users SET ?', user, (err, result) => {
                        if (err) return reject(err);
                        return resolve(result.insertId);
                    });
                }
            );
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
                        return resolve(result[0]);
                    }
                }
            );
        });
    }

    getManagerByEmail(email) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM Managers WHERE email = ?',
                [email],
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error("Manager not found"));
                    } else {
                        return resolve(result[0]);
                    }
                }
            );
        });
    }


    isAdmin(id) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT role FROM Managers WHERE manager_id = ?',
                [id],
                (err, result) => {
                    if (err) return reject(err);

                    if (result.length > 0) {
                        return resolve({ isAdmin: true, role: result[0].role });
                    } else {
                        return resolve({ isAdmin: false });
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
                        return resolve(result[0]);
                    }
                }
            );
        });
    }

    updateNameAndEmail(name, email, userId) {
        return new Promise((resolve, reject) => {

            this.con.query(
                'SELECT * FROM `Users` WHERE `email` = ? AND `user_id` != ?',
                [email, userId],    // Ensure email is unique for update
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length > 0) {
                        return reject(new Error('Email is already in use by another user'));
                    }
                    this.con.query(
                        'UPDATE `Users` SET `first_name` = ?, `email` = ? WHERE `user_id` = ?',
                        [name, email, userId],
                        (err) => {
                            if (err) return reject(err);
                            return resolve('User details updated successfully');
                        }
                    );
                }
            );
        });
    }

    updatePassword(hashedPassword, userId) {
        return new Promise((resolve, reject) => {
            this.con.query(
                'UPDATE `Users` SET `password_hash` = ? WHERE `user_id` = ?',
                [hashedPassword, userId],
                (err) => {
                    if (err) return reject(err);
                    return resolve('Password updated successfully');
                }
            );
        });
    }

    getUsers() {
        return new Promise((resolve, reject) => {
            this.con.query(
                'SELECT * FROM `Users`',
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length === 0) {
                        return reject(new Error('No users found in the database'));
                    }
                    return resolve(result);
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
                    if (result.affectedRows === 0) {
                        return reject(new Error('No user found with the provided ID'));
                    }
                    return resolve('User details updated successfully');
                }
            );
        });
    }

    deleteUser(userId) {
        return new Promise((resolve, reject) => {

            this.con.query(
                'SELECT * FROM `Users` WHERE `user_id` = ?',
                [userId],     // Ensure user exists before deleting
                (err, result) => {
                    if (err) return reject(err);
                    if (result.length < 1) {
                        return reject(new Error('User not found'));
                    }
                    this.con.query(
                        'DELETE FROM `Users` WHERE `user_id` = ?',
                        [userId],
                        (err) => {
                            if (err) return reject(err);
                            return resolve('User deleted successfully');
                        }
                    );
                }
            );
        });
    }
};



module.exports = UsersController;
