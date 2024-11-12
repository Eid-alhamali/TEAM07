const mockQuery = jest.fn();

const mysql = {
  createConnection: jest.fn().mockReturnValue({
    connect: jest.fn((callback) => callback(null)),
    query: mockQuery,
    end: jest.fn(),
  }),
};

module.exports = mysql;
