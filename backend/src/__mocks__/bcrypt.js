module.exports = {
    hash: jest.fn((password, saltRounds, callback) => callback(null, 'hashedPassword')),
    compare: jest.fn((password, hashedPassword, callback) => callback(null, password === 'password123')),
};