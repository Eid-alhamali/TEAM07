const path = require('path');
require('dotenv').config();

const config = {
    root: path.join(__dirname, '/../../'),
    controllers: path.join(__dirname, '/../Controllers'),
    sqlCon: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        charset: 'utf8mb4'
    },
    populateCon: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        charset: 'utf8mb4',
        multipleStatements: true
    }
};

module.exports = config;
