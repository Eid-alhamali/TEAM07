// Load environment variables from .env file
require("dotenv").config();

const mysql = require("mysql2/promise");

// Create a connection pool with MySQL database
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0, // Maximum number of queued connection requests (0 means no limit)
});

// Test the connection pool
dbPool
    .getConnection()
    .then((connection) => {
        console.log("MySQL pool connected");
        connection.release();
    })
    .catch((err) => {
        console.error("Error connecting to MySQL pool:", err);
    });

module.exports = dbPool;
