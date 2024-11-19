module.exports = {
    testEnvironment: 'node', // Set up Jest to use Node.js environment
    roots: ['<rootDir>/src/__tests__'], // Define the root directory for tests
    moduleDirectories: ['node_modules', '<rootDir>/src'], // Allow imports from node_modules and src
    testMatch: ['**/__tests__/**/*.test.js'], // Match test files with .test.js suffix
    verbose: true, // Display individual test results with the test suite hierarchy
};
