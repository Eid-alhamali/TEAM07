require('dotenv').config();
const fs = require('fs');
const { generateInvoicePdf, sendInvoiceEmail } = require('./invoiceMail');


const checkoutPool = require('../config/promise/promise_db.js');

// Test the connection pool
checkoutPool.getConnection()
    .then(connection => {
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to Checkout MySQL pool:', err);
    });



const checkout=  async (req, res) => {
    const { address, payment, cartItems, totalPrice } = req.body;
    const user_id = req.user.user_id;

    // Basic validation
    if (!address || !payment || !cartItems || !totalPrice) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    let connection;

    try {
        // Get a connection from the checkout pool
        connection = await checkoutPool.getConnection();

        // Start transaction
        await connection.beginTransaction();

        // Insert into Orders table
        const [orderResult] = await connection.execute(
            `INSERT INTO Orders (user_id, total_price, status, delivery_option_id)
             VALUES (?, ?, 'processing', ?)`,
            [user_id, +parseFloat(totalPrice).toFixed(2), 1 ] 
        );
        
        const order_id = orderResult.insertId;
        
        // Prepare OrderItems insertion
        const orderItemsData = cartItems.map(item => [
            order_id,
            +parseInt(item.variantId, 10),
            +parseInt(item.quantity, 10),
            +parseFloat(item.price).toFixed(2) 
        ]);
        
        // Insert into OrderItems
        await connection.query(
            `INSERT INTO OrderItems (order_id, variant_id, quantity, price_at_purchase)
             VALUES ?`,
            [orderItemsData]
        );
        

        await connection.execute(
            `DELETE FROM ShoppingCartItems WHERE cart_id IN (SELECT cart_id FROM ShoppingCart WHERE user_id = ?)`,
            [user_id]
          );
          


        
        for (const item of cartItems) {
            const [updateResult] = await connection.execute(
                `UPDATE Product_Variant 
                 SET stock = stock - ?
                 WHERE variant_id = ? AND stock >= ?`,
                [+parseInt(item.quantity, 10),+parseInt(item.variantId, 10), +parseInt(item.quantity, 10)]
            );

            if (updateResult.affectedRows === 0) {
                throw new Error(`Insufficient stock for variant ID ${item.variantId}`);
            }
        }

     
        await connection.execute(
            `INSERT INTO Address (order_id, address_line, city, phone_number, postal_code, country)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [order_id, address.address, address.city, address.phonenumber, address.zipcode, address.country]
        );



     const invoicePdfPath = await generateInvoicePdf(order_id, cartItems, address, totalPrice);

     
     if (!fs.existsSync(invoicePdfPath)) {
       throw new Error(`PDF was not created at path: ${invoicePdfPath}`);
     }
 
     const pdfBuffer = fs.readFileSync(invoicePdfPath);
 
     
     const insertQuery = `
       INSERT INTO Invoices (order_id, user_id, invoice_pdf)
       VALUES (?, ?, ?)
     `;
     const [result] = await connection.execute(insertQuery, [order_id, user_id, pdfBuffer]);
 
     
    
 

        await sendInvoiceEmail(user_id, invoicePdfPath);

         fs.unlink(invoicePdfPath, (err) => {
       if (err) {
         console.error(`Failed to delete temp PDF file: ${invoicePdfPath}`, err);
       }
     });
        
        await connection.commit();
       
        res.status(201).json({ message: 'Order placed successfully.', order_id :order_id });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Checkout Error:', error);
        res.status(500).json({ message: 'An error occurred during checkout.', error: error.message });
        
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {checkout };