const UsersController = require('../controllers/userController');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Mock MySQL connection
jest.mock('mysql2');
jest.mock('bcrypt');

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

jest.setTimeout(10000); // Set a global timeout of 10 seconds for all tests

describe('UsersController', () => {
    const userId = 1;
    const sampleUser = {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone_number: "1234567890",
        password: "SecurePassword123", // Plain password for testing registration
        password_hash: "hashedpassword",
        role: "user"
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('register should hash password, save user, and return the user ID', async () => {
        const userWithPassword = { ...sampleUser }; // Clone sampleUser to preserve `password`
        bcrypt.hash.mockResolvedValueOnce("hashedpassword");
        mockConnection.query
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, [])
            ) // Simulate no duplicate user found
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, { insertId: userId })
            ); // Simulate user successfully saved
    
        const result = await usersController.register(userWithPassword);
        expect(bcrypt.hash).toHaveBeenCalledWith("SecurePassword123", 10); // Match expected arguments
        expect(mockConnection.query).toHaveBeenNthCalledWith(
            1,
            'SELECT * FROM `Users` WHERE `email` = ? OR `phone_number` = ?',
            [sampleUser.email, sampleUser.phone_number],
            expect.any(Function)
        );
        expect(mockConnection.query).toHaveBeenNthCalledWith(
            2,
            'INSERT INTO Users SET ?',
            expect.objectContaining({ password_hash: "hashedpassword" }),
            expect.any(Function)
        );
        expect(result).toEqual({ message: 'Registration successful', userId });
    });
    
    test('login should validate credentials and return user details', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, [sampleUser])
        );
        bcrypt.compare.mockResolvedValueOnce(true);

        const userDetails = await usersController.login(sampleUser.email, sampleUser.password);
        expect(mockConnection.query).toHaveBeenCalledWith(
            'SELECT * FROM `Users` WHERE `email` = ?',
            [sampleUser.email],
            expect.any(Function)
        );
        expect(bcrypt.compare).toHaveBeenCalledWith(sampleUser.password, sampleUser.password_hash);
        expect(userDetails).toEqual(expect.objectContaining({
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com"
        }));
    });

    test('save should save a new user and return the user ID', async () => {
        mockConnection.query
            // Check for existing user
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, [])
            )
            // Insert user
            .mockImplementationOnce((sql, params, callback) =>
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

    test('isAdmin should return true if the user is an admin, otherwise false', async () => {
        mockConnection.query
            // Check `Users` table
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, [])
            )
            // Check `Managers` table
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, [{ manager_id: userId, role: "product_manager" }])
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
        mockConnection.query
            // Check for existing email
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, [])
            )
            // Update user details
            .mockImplementationOnce((sql, params, callback) =>
                callback(null, { affectedRows: 1 })
            );

        const response = await usersController.updateNameAndEmail("Jane", "jane.doe@example.com", userId);
        expect(response).toBe('User details updated successfully');
    });

    test('updatePassword should update the password of a user', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const response = await usersController.updatePassword("newhashedpassword", userId);
        expect(response).toBe('Password updated successfully');
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
        expect(users).toHaveLength(2);
    });

    test('updateUserDetails should update user details', async () => {
        mockConnection.query.mockImplementation((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const updatedUserDetails = { first_name: "Jack", last_name: "Smith" };
        const response = await usersController.updateUserDetails(updatedUserDetails, userId);
        expect(response).toBe('User details updated successfully');
    });

    test('deleteUser should delete a user by ID', async () => {
        mockConnection.query.mockImplementationOnce((sql, params, callback) =>
            callback(null, { affectedRows: 1 })
        );

        const response = await usersController.deleteUser(userId);
        expect(response).toBe('User deleted successfully');
    });
});
