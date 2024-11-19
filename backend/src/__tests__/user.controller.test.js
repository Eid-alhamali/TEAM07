const UsersController = require('../controllers/user.controller');
const mysql = require('mysql2');
const config = require('../config/app.config');

// Mock MySQL connection
jest.mock('mysql2');
const mockConnection = {
    query: jest.fn(),
    end: jest.fn(),
};
mysql.createConnection.mockReturnValue(mockConnection);

let usersController;

beforeAll(() => {
    usersController = new UsersController();
    usersController.con = mockConnection;
});

afterAll(() => {
    usersController.con.end();
});

describe('UsersController', () => {
    const userId = 1;
    const sampleUser = {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone_number: "1234567890",
        password_hash: "hashedpassword",
        role: "user"
    };

    test('save should save a new user and return the user ID', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { insertId: userId })
        );

        const newUserId = await usersController.save(sampleUser);
        expect(newUserId).toBe(userId);
    });

    test('getUserByEmail should retrieve user information based on email', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [sampleUser])
        );

        const user = await usersController.getUserByEmail(sampleUser.email);
        expect(user).toEqual(sampleUser);
    });

    test('isAdmin should return true if the user has an admin role, otherwise false', async () => {
        const adminUser = { ...sampleUser, role: "admin" };
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [adminUser])
        );

        const isAdmin = await usersController.isAdmin(userId);
        expect(isAdmin).toBe(true);
    });

    test('getUserById should retrieve user information based on user ID', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [{ user_id: userId, ...sampleUser }])
        );

        const user = await usersController.getUserById(userId);
        expect(user).toHaveProperty('user_id', userId);
    });

    test('updateNameAndEmail should update the name and email of a user', async () => {
        mockConnection.query.mockImplementation((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const response = await usersController.updateNameAndEmail("Jane", "jane.doe@example.com", userId);
        expect(response).toBe('User details updated successfully');

        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [{ first_name: "Jane", email: "jane.doe@example.com" }])
        );

        const updatedUser = await usersController.getUserById(userId);
        expect(updatedUser).toHaveProperty('first_name', "Jane");
        expect(updatedUser).toHaveProperty('email', "jane.doe@example.com");
    });

    test('updatePassword should update the password of a user', async () => {
        mockConnection.query.mockImplementation((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const response = await usersController.updatePassword("newhashedpassword", userId);
        expect(response).toBe('Password updated successfully');

        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [{ password_hash: "newhashedpassword" }])
        );

        const updatedUser = await usersController.getUserById(userId);
        expect(updatedUser).toHaveProperty('password_hash', "newhashedpassword");
    });

    test('getUsers should retrieve a list of users with either user or admin role', async () => {
        const usersList = [
            { ...sampleUser, role: "user" },
            { ...sampleUser, role: "admin", user_id: 2 }
        ];
        mockConnection.query.mockImplementationOnce((sql, callback) =>
            callback(null, usersList)
        );

        const users = await usersController.getUsers();
        expect(Array.isArray(users)).toBe(true);
        users.forEach(user => {
            expect(["user", "admin"]).toContain(user.role);
        });
    });

    test('updateUserDetails should update user details', async () => {
        mockConnection.query.mockImplementation((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const updatedUserDetails = { first_name: "Jack", last_name: "Smith" };
        const response = await usersController.updateUserDetails(updatedUserDetails, userId);
        expect(response).toBe('User details updated successfully');

        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [{ first_name: "Jack", last_name: "Smith" }])
        );

        const updatedUser = await usersController.getUserById(userId);
        expect(updatedUser).toHaveProperty('first_name', "Jack");
        expect(updatedUser).toHaveProperty('last_name', "Smith");
    });

    test('deleteUser should delete a user by ID', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const response = await usersController.deleteUser(userId);
        expect(response).toBe('User deleted successfully');

        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [])
        );

        await expect(usersController.getUserById(userId)).rejects.toThrow("User not found");
    });
});
