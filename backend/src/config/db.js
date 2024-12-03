// backend/src/config/db.js
const mysql = require('mysql2');
const config = require('./appConfig');

const db = mysql.createConnection(config.sqlCon);

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected');
});

module.exports = db;