const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT;

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected');
});

// GET endpoint to list all products
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM Products', (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});