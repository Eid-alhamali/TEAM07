const mysql = require("mysql2");

// Database connection
const db = require('../config/db');
const checkoutPool = require('../config/promise/promise_db.js');


checkoutPool.getConnection()
    .then(connection => {
        console.log('Checkout MySQL pool connected');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to Checkout MySQL pool:', err);
    });

 
    exports.getOrders = (req, res) => {
      const user_id = req.user.user_id;
    
      const query = `
        SELECT
          o.order_id,
          o.total_price,
          o.status,
          o.created_at,
          o.user_id AS customer_id, -- Fetch Customer ID
          p.product_id, -- Fetch Product ID
          p.name AS product_name,
          oi.quantity,
          oi.price_at_purchase,
          pv.weight_grams,
          pv.variant_id AS variantId,
          pi.image_url
        FROM
          Orders o
        JOIN OrderItems oi ON o.order_id = oi.order_id
        JOIN Product_Variant pv ON oi.variant_id = pv.variant_id
        JOIN Products p ON pv.product_id = p.product_id
        LEFT JOIN (
            SELECT variant_id, MIN(image_url) AS image_url
            FROM Product_Images
            GROUP BY variant_id
        ) pi ON pv.variant_id = pi.variant_id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC, o.order_id, oi.order_item_id
      `;
    
      db.query(query, [user_id], (err, results) => {
        if (err) {
          console.error("Database error:", err); // Enhanced error logging
          return res.status(500).json({ error: "Database error" });
        }
    
        const ordersMap = {};
    
        results.forEach(row => {
          if (!ordersMap[row.order_id]) {
            ordersMap[row.order_id] = {
              order_id: row.order_id,
              total_price: row.total_price,
              status: row.status,
              created_at: row.created_at,
              customer_id: row.customer_id, // Include Customer ID in response
              order_items: []
            };
          }
    
          ordersMap[row.order_id].order_items.push({
            product_id: row.product_id, // Include Product ID in response
            name: row.product_name,
            weight_grams: row.weight_grams,
            price_at_purchase: row.price_at_purchase,
            quantity: row.quantity,
            image_url: row.image_url
          });
        });
    
        // Convert the map to an array of orders
        const orders = Object.values(ordersMap);
    
        res.status(200).json({ message: "Orders retrieved successfully.", orders });
      });
    };
    
 



exports.getInvoice = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.user_id;

  try {
    const connection = await checkoutPool.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT invoice_pdf FROM Invoices WHERE order_id = ? AND user_id = ?`,
        [orderId, userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const invoicePdf = rows[0].invoice_pdf;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
      res.send(invoicePdf);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Failed to fetch invoice. Please try again.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
      const connection = await checkoutPool.getConnection();
      await connection.query(
          `UPDATE Orders SET status = ? WHERE order_id = ?`,
          [status, orderId]
      );
      await connection.release();

      res.status(200).json({ message: "Order status updated successfully." });
  } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status. Please try again." });
  }
};


exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params; 
  const userId = req.user.user_id; 

  try {
    
    const connection = await checkoutPool.getConnection();
    await connection.beginTransaction();

    const [order] = await connection.query(
      `SELECT * FROM Orders WHERE order_id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (!order.length) {
      
      await connection.release(); 
      return res.status(404).json({ message: "Order not found or does not belong to the user." });
    }

    if (order[0].status === 'canceled') {
      await connection.release(); 
      return res.status(400).json({ message: "Order is already canceled." });
    }

    
    await connection.query(
      `UPDATE Orders SET status = 'canceled' WHERE order_id = ?`,
      [orderId]
    );

    await connection.commit(); 
    await connection.release();

    return res.status(201).json({ message: "Order successfully cancelled." });
  } catch (error) {
    console.error("Error cancelling order:", error);

    
    if (connection) await connection.rollback();
    if (connection) await connection.release();
    return res.status(500).json({ message: "An error occurred while cancelling the order." });
  }
};

