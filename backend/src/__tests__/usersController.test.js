/**
 * @file userController.test.js
 * @description Unit tests (20 total) for UsersController class
 */

const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const UsersController = require('../controllers/userController');

// --- Mocks ---
jest.mock('mysql2', () => {
  const mockQuery = jest.fn();
  return {
    createConnection: jest.fn().mockReturnValue({
      query: mockQuery,
    }),
  };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersController', () => {
  let usersController;
  let mockConn; // We'll capture the connection object from mysql

  beforeAll(() => {
    // The constructor calls mysql.createConnection(...) which we have mocked
    usersController = new UsersController();
    mockConn = mysql.createConnection(); // Our mocked connection
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) register
  // ─────────────────────────────────────────────────────────────────────────────
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
        password: 'plainpassword',
      };

      // Mock hashing
      bcrypt.hash.mockResolvedValueOnce('hashedpassword');

      // Mock the "save" call
      // The "register" method calls "save", which will do two queries:
      // 1) SELECT ...
      // 2) INSERT ...
      // We'll mock them in sequence using mockConn.query.mockImplementation.
      mockConn.query
        // 1) SELECT => no conflicts
        .mockImplementationOnce((sql, params, cb) => cb(null, []))
        // 2) INSERT => success => insertId=101
        .mockImplementationOnce((sql, params, cb) => cb(null, { insertId: 101 }));

      const result = await usersController.register(userData);

      expect(result).toEqual({ message: 'Registration successful', userId: 101 });
      expect(bcrypt.hash).toHaveBeenCalledWith('plainpassword', 10);
    });

    it('should fail if "save" rejects (e.g., email exists)', async () => {
      const userData = {
        email: 'duplicate@example.com',
        phone_number: '1234567890',
        password: 'plainpassword',
      };
      bcrypt.hash.mockResolvedValueOnce('somehashedpw');

      // 1) SELECT => found 1 => conflict
      mockConn.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{}]); // length>0 => conflict
      });

      await expect(usersController.register(userData)).rejects.toThrow(
        'Registration failed: Email or phone number already exists'
      );
    });
  });


  // ─────────────────────────────────────────────────────────────────────────────
  // 3) save
  // ─────────────────────────────────────────────────────────────────────────────
  describe('save', () => {
    it('should insert a new user and return insertId', async () => {
      // SELECT => no results => safe to insert
      mockConn.query
        .mockImplementationOnce((sql, params, cb) => cb(null, []))
        .mockImplementationOnce((sql, params, cb) => cb(null, { insertId: 111 }));

      const user = {
        email: 'unique@example.com',
        phone_number: '1234567890',
      };
      const resultId = await usersController.save(user);
      expect(resultId).toBe(111);
    });

    it('should reject if email or phone_number already exists', async () => {
      // SELECT => found 1 => conflict
      mockConn.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ user_id: 555 }]);
      });

      const user = {
        email: 'duplicate@example.com',
        phone_number: '1234567890',
      };
      await expect(usersController.save(user)).rejects.toThrow(
        'Email or phone number already exists'
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 4) getUserByEmail
  // ─────────────────────────────────────────────────────────────────────────────
  describe('getUserByEmail', () => {
    it('should return user data if found', async () => {
      mockConn.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ user_id: 777, email: 'found@example.com' }]);
      });
      const user = await usersController.getUserByEmail('found@example.com');
      expect(user).toEqual({ user_id: 777, email: 'found@example.com' });
    });

    it('should throw an error if user not found', async () => {
      mockConn.query.mockImplementationOnce((sql, params, cb) => cb(null, []));
      await expect(usersController.getUserByEmail('missing@example.com')).rejects.toThrow(
        'User not found'
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 5) isAdmin
  // ─────────────────────────────────────────────────────────────────────────────
  describe('isAdmin', () => {
    it('should return { isAdmin: true } if manager found', async () => {
      mockConn.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ role: 'sales_manager' }]);
      });
      const result = await usersController.isAdmin(10);
      expect(result).toEqual({ isAdmin: true, role: 'sales_manager' });
    });

    it('should return { isAdmin: false } if manager not found', async () => {
      mockConn.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, []);
      });
      const result = await usersController.isAdmin(999);
      expect(result).toEqual({ isAdmin: false });
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 6) getUserById
  // ─────────────────────────────────────────────────────────────────────────────
  describe('getUserById', () => {
    it('should return user data if found', async () => {
      mockConn.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{ user_id: 888, first_name: 'Jane' }]);
      });
      const user = await usersController.getUserById(888);
      expect(user).toEqual({ user_id: 888, first_name: 'Jane' });
    });

    it('should throw an error if user not found', async () => {
      mockConn.query.mockImplementationOnce((sql, params, cb) => cb(null, []));
      await expect(usersController.getUserById(999)).rejects.toThrow('User not found');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 7) updateNameAndEmail
  // ─────────────────────────────────────────────────────────────────────────────
  describe('updateNameAndEmail', () => {
    it('should update the name and email successfully', async () => {
      // 1) SELECT => no conflict => []
      mockConn.query
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, []);
        })
        // 2) UPDATE => success
        .mockImplementationOnce((sql, params, cb) => {
          cb(null);
        });

      const result = await usersController.updateNameAndEmail('NewName', 'new@example.com', 999);
      expect(result).toBe('User details updated successfully');
    });

    it('should reject if email in use by another user', async () => {
      // 1) SELECT => found => conflict
      mockConn.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, [{}]);
      });

      await expect(
        usersController.updateNameAndEmail('Name', 'used@example.com', 123)
      ).rejects.toThrow('Email is already in use by another user');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 8) updatePassword
  // ─────────────────────────────────────────────────────────────────────────────
  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockConn.query.mockImplementationOnce((sql, params, cb) => cb(null));
      const result = await usersController.updatePassword('hashed123', 500);
      expect(result).toBe('Password updated successfully');
    });

    it('should fail if db error occurs', async () => {
      mockConn.query.mockImplementationOnce((sql, params, cb) => {
        cb(new Error('Update Error'));
      });

      await expect(usersController.updatePassword('hashed123', 500)).rejects.toThrow(
        'Update Error'
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 9) getUsers
  // ─────────────────────────────────────────────────────────────────────────────
  describe('getUsers', () => {
    it('should return a list of users if they exist', async () => {
      mockConn.query.mockImplementationOnce((sql, cb) => {
        cb(null, [
          { user_id: 1, email: 'a@example.com' },
          { user_id: 2, email: 'b@example.com' },
        ]);
      });

      const users = await usersController.getUsers();
      expect(users).toHaveLength(2);
    });

    it('should reject if no users found', async () => {
      mockConn.query.mockImplementationOnce((sql, cb) => cb(null, []));
      await expect(usersController.getUsers()).rejects.toThrow('No users found in the database');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 10) deleteUser
  // ─────────────────────────────────────────────────────────────────────────────
  describe('deleteUser', () => {
    it('should delete user successfully if user found', async () => {
      // 1) SELECT => user found
      mockConn.query
        .mockImplementationOnce((sql, params, cb) => {
          cb(null, [{ user_id: 777 }]);
        })
        // 2) DELETE => success
        .mockImplementationOnce((sql, params, cb) => {
          cb(null);
        });

      const result = await usersController.deleteUser(777);
      expect(result).toBe('User deleted successfully');
    });

    it('should reject if user not found', async () => {
      // 1) SELECT => empty => not found
      mockConn.query.mockImplementationOnce((sql, params, cb) => {
        cb(null, []);
      });
      await expect(usersController.deleteUser(999)).rejects.toThrow('User not found');
    });
  });
});
