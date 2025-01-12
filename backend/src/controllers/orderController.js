const mysql = require("mysql2");

// Database connection
const db = require('../config/db');
const dbPool = require('../config/promise/promise_db.js');
const {sendRefundEmail , sendRejectEmail} = require('./invoiceMail');
 
exports.getAllOrders = (req, res) => {
  const query = `
    SELECT
      o.order_id,
      o.total_price,
      o.status,
      o.created_at,
      p.name AS product_name,
      oi.quantity,
      oi.price_at_purchase,
      pv.weight_grams,
      pv.variant_id AS variantId,
      pi.image_url,
      COALESCE(rr.status, 'notrefunded') AS refund_status,
      a.address_line,
      a.city,
      a.phone_number,
      a.postal_code,
      a.country,
      o.user_id
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
    LEFT JOIN RefundRequests rr ON o.order_id = rr.order_id 
                                 AND oi.variant_id = rr.variant_id
                                 AND o.user_id = rr.user_id
    LEFT JOIN Address a ON o.order_id = a.order_id
    ORDER BY o.created_at DESC, o.order_id, oi.order_item_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err); // Enhanced error logging
      return res.status(500).json({ error: 'Database error' });
    }

    const ordersMap = {};




    results.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          total_price: row.total_price,
          status: row.status,
          created_at: row.created_at,
          user_id: row.user_id,
          address: {
            address_line: row.address_line,
            city: row.city,
            phone_number: row.phone_number,
            postal_code: row.postal_code,
            country: row.country
          },
          order_items: []
        };
      }

      ordersMap[row.order_id].order_items.push({
        name: row.product_name,
        weight_grams: row.weight_grams,
        refund_status: row.refund_status,
        price_at_purchase: row.price_at_purchase,
        quantity: row.quantity,
        image_url: row.image_url,
        variant_id: row.variantId
      });
    });
    


    // Convert the map to an array of orders
    const orders = Object.values(ordersMap);

    res.status(200).json({ message: 'Orders retrieved successfully.', orders });
  });
};


exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
      const connection = await dbPool.getConnection();
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


 
exports.getOrders = (req, res) => {
  const user_id = req.user.user_id;
  
  const query = `
    SELECT
      o.order_id,
      o.total_price,
      o.status,
      o.created_at,
      p.name AS product_name,
      oi.quantity,
      oi.price_at_purchase,
      pv.weight_grams,
      o.user_id AS customer_id,
      p.product_id,
      pv.variant_id AS variantId,
      pi.image_url,
      COALESCE(rr.status, 'notrefunded') AS refund_status,
      a.address_line,
      a.city,
      a.phone_number,
      a.postal_code,
      a.country
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
    LEFT JOIN RefundRequests rr ON o.order_id = rr.order_id 
                                 AND oi.variant_id = rr.variant_id
                                 AND o.user_id = rr.user_id
    LEFT JOIN Address a ON o.order_id = a.order_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC, o.order_id, oi.order_item_id
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Database error:', err); // Enhanced error logging
      return res.status(500).json({ error: 'Database error' });
    }

    const ordersMap = {};

    results.forEach(row => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          total_price: row.total_price,
          status: row.status,
          created_at: row.created_at,
          address: {
            address_line: row.address_line,
            city: row.city,
            phone_number: row.phone_number,
            postal_code: row.postal_code,
            country: row.country
          },

          customer_id: row.customer_id,
          order_items: []
        };
      }

      ordersMap[row.order_id].order_items.push({

        product_id: row.product_id,
        name: row.product_name,
        weight_grams: row.weight_grams,
        refund_status: row.refund_status,
        price_at_purchase: row.price_at_purchase,
        quantity: row.quantity,
        image_url: row.image_url,
        variant_id: row.variantId
      });
    });

    // Convert the map to an array of orders
    const orders = Object.values(ordersMap);

    res.status(200).json({ message: 'Orders retrieved successfully.', orders });
  });
};



exports.getInvoice = async (req, res) => {
  const { orderId } = req.params;

  try {
    const connection = await dbPool.getConnection();

    try {
      const [rows] = await connection.query(
        `SELECT invoice_pdf FROM Invoices WHERE order_id = ?`,
        [orderId]
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



exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params; 
  const userId = req.user.user_id; 

  let connection;
  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    // 1. Check if the order exists and belongs to the user
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

    // 2. Get the order items for this order to update stock
    const [orderItems] = await connection.query(
      `SELECT * FROM OrderItems WHERE order_id = ?`,
      [orderId]
    );

    // 3. Update the stock levels for each product variant in the order
    for (const item of orderItems) {
      const { variant_id, quantity } = item;
      
      // Update the stock in Product_Variant (increase stock by quantity)
      await connection.query(
        `UPDATE Product_Variant SET stock = stock + ? WHERE variant_id = ?`,
        [quantity, variant_id]
      );
    }

    // 4. Now cancel the order by updating its status
    await connection.query(
      `UPDATE Orders SET status = 'canceled' WHERE order_id = ?`,
      [orderId]
    );

    await connection.commit(); 
    await connection.release();

    return res.status(201).json({ message: "Order successfully cancelled and stock updated." });
  } catch (error) {
    console.error("Error cancelling order:", error);

    if (connection) await connection.rollback();
    if (connection) await connection.release();
    return res.status(500).json({ message: "An error occurred while cancelling the order." });
  }
};


exports.rejectRefund = (req, res) => {
  // Extract and parse the refund_request_id from the URL parameters
  const refundRequestId = parseInt(req.params.id, 10);
  
  // Destructure reject_reason from the request body
  const { reject_reason , product_name, refund_date, refund_quantity, refund_price, refund_weight} = req.body;

  // Validate refund_request_id
  if (isNaN(refundRequestId)) {
      return res.status(400).json({ error: 'Invalid refund_request_id' });
  }
  
  // Validate reject_reason
  if (!reject_reason || typeof reject_reason !== 'string' || reject_reason.trim() === '') {
      return res.status(400).json({ error: 'reject_reason is required and must be a non-empty string' });
  }

  // SQL query to update the refund status to 'rejected' and set the reject_reason
  const updateSql = `
      UPDATE RefundRequests
      SET status = 'rejected', reject_reason = ?
      WHERE refund_request_id = ? AND status = 'pending';
  `;

  // Execute the update query
  db.query(updateSql, [reject_reason, refundRequestId], (updateError, updateResult) => {
      if (updateError) {
          console.error('Error updating refund status:', updateError);
          return res.status(500).json({ error: 'Internal server error' });
      }

      // Check if any rows were affected (i.e., the refund request exists and was pending)
      if (updateResult.affectedRows === 0) {
          return res.status(404).json({ error: 'Refund request not found or already processed' });
      }

      // SQL query to fetch user_id, order_id, and reject_reason for the updated refund request
      const selectSql = `
          SELECT user_id, order_id, reject_reason
          FROM RefundRequests
          WHERE refund_request_id = ?;
      `;
      
      // Execute the select query
      db.query(selectSql, [refundRequestId], (selectError, selectResults) => {
          if (selectError) {
              console.error('Error fetching refund request details:', selectError);
              return res.status(500).json({ error: 'Internal server error' });
          }

          // Check if the refund request exists
          if (selectResults.length === 0) {
              return res.status(404).json({ error: 'Refund request not found' });
          }

          const { user_id, order_id, reject_reason: dbRejectReason } = selectResults[0];
          
          // Log the reject_reason retrieved from the database
          console.log(`Refund Request ID ${refundRequestId}: Reject reason in DB: "${dbRejectReason}"`);

          // Optionally, verify that the reject_reason matches the input
          if (dbRejectReason !== reject_reason) {
              console.warn(`Mismatch in reject_reason for Refund Request ID ${refundRequestId}: Input "${reject_reason}" vs DB "${dbRejectReason}"`);
          }

          // Call the function to send a rejection email to the user
          sendRejectEmail(user_id, order_id, reject_reason,  product_name, refund_date, refund_quantity, refund_price, refund_weight)
              .then(() => {
                  // Respond with a success message if the email was sent successfully
                  res.json({ message: 'Refund rejected and email sent successfully' });
              })
              .catch((emailError) => {
                  console.error('Error sending refund email:', emailError);
                  // Optionally, you might want to revert the refund status if the email fails
                  // For simplicity, we'll notify the user that the refund was rejected but the email failed
                  res.status(500).json({ error: 'Refund rejected but failed to send email' });
              });
      });
  });
};


exports.approveRefund = (req, res) => {   
  
  const refundRequestId = parseInt(req.params.id, 10);
  const { product_name, refund_date, refund_quantity, refund_price, refund_weight} = req.body;
  
  // Validate the refund_request_id
  if (isNaN(refundRequestId)) {
      return res.status(400).json({ error: 'Invalid refund_request_id' });
  }
  
  // Step 1: Update the status to 'approved'
  const updateStatusSql = `
      UPDATE RefundRequests
      SET status = 'approved'
      WHERE refund_request_id = ? AND status = 'pending';
  `;

  db.query(updateStatusSql, [refundRequestId], (updateError, updateResult) => {
      if (updateError) {
          console.error('Error updating refund status:', updateError);
          return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (updateResult.affectedRows === 0) {
          // Either the refund_request_id does not exist or it's not in 'pending' status
          return res.status(404).json({ error: 'Refund request not found or already processed' });
      }

      // Step 2: Retrieve user_id, order_id, variant_id, and quantity
      const selectRefundSql = `
          SELECT user_id, order_id, variant_id, quantity
          FROM RefundRequests
          WHERE refund_request_id = ?;
      `;
      
      db.query(selectRefundSql, [refundRequestId], (selectError, selectResults) => {
          if (selectError) {
              console.error('Error fetching refund request details:', selectError);
              return res.status(500).json({ error: 'Internal server error' });
          }

          if (selectResults.length === 0) {
              // This should not happen as we've just updated the record
              return res.status(404).json({ error: 'Refund request not found' });
          }

          const { user_id, order_id, variant_id, quantity } = selectResults[0];
          
          // Function to proceed to send email after all updates
          const sendEmailAndRespond = () => {
              sendRefundEmail(user_id, order_id, product_name, refund_date, refund_quantity, refund_price, refund_weight)
                  .then(() => {
                    
                      res.json({ message: 'Refund approved and email sent successfully' });
                  })
                  .catch((emailError) => {
                    
                      console.error('Error sending refund email:', emailError);
                      res.status(500).json({ error: 'Refund approved but failed to send email' });
                  });
          };

          // Step 3: Update the stock if variant_id is present
          if (variant_id) {
            
              const updateStockSql = `
                  UPDATE Product_Variant
                  SET stock = stock + ?
                  WHERE variant_id = ?;
              `;

              db.query(updateStockSql, [quantity, variant_id], (stockError, stockResult) => {
                  if (stockError) {
                      console.error('Error updating product stock:', stockError);
                      // Refund status is already updated; consider notifying admin
                      return res.status(500).json({ error: 'Refund approved but failed to update stock' });
                  }

                  if (stockResult.affectedRows === 0) {
                      
                      console.error('Product variant not found for variant_id:', variant_id);
                      
                      return res.status(404).json({ error: 'Product variant not found' });
                  }

                  
                  sendEmailAndRespond();
              });
          } else {
              
              sendEmailAndRespond();
          }
      });
  });
};



exports.getRefunds= (req, res) => {
  const sql = `
      SELECT
          rr.refund_request_id,
          rr.status,
          rr.reason,
          rr.reject_reason,
          rr.quantity,
          rr.price_at_purchase,
          rr.request_date,
          pv.weight_grams AS weight,
          p.name AS product_name,
          pi.image_url AS imageUrl,
          u.first_name,
          u.last_name,
          o.created_at
      FROM
          RefundRequests rr
          JOIN Orders o ON rr.order_id = o.order_id
          JOIN Users u ON rr.user_id = u.user_id
          LEFT JOIN Product_Variant pv ON rr.variant_id = pv.variant_id
          LEFT JOIN Products p ON pv.product_id = p.product_id
          LEFT JOIN (
              SELECT variant_id, MIN(image_url) AS image_url
              FROM Product_Images
              GROUP BY variant_id
          ) pi ON pi.variant_id = pv.variant_id
      ORDER BY rr.refund_request_id;
  `;

  db.query(sql, (error, results) => {
      if (error) {
          console.error('Error fetching refund requests:', error);
          return res.status(500).json({ error: 'Internal server error' });
      }

      // Map the results to the desired response structure
      const refundRequests = results.map(row => ({
          refund_request_id: row.refund_request_id.toString(),
          status: row.status,
          reason: row.reason,
          reject_reason : row.reject_reason,
          quantity: row.quantity,
          price_at_purchase: parseFloat(row.price_at_purchase),
          weight: row.weight,
          imageUrl: row.imageUrl,
          product_name: row.product_name,
          request_date: row.request_date ? formatDate(row.request_date) : null,
          first_name: row.first_name,
          last_name: row.last_name,
          created_at: row.created_at ? formatDate(row.created_at) : null
      }));

      res.json({refunds:refundRequests});
  });
};

// Helper function to format dates as YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


exports.createRefund= (req, res) => {
  const { order_id, variant_id, quantity, price_at_purchase, reason } = req.body;
  const user_id = req.user.user_id;

  
  if (!order_id || !quantity || !price_at_purchase || !reason) {
      return res.status(400).json({ error: 'Missing required fields.' });
  }

  

  const sql = `INSERT INTO RefundRequests (order_id, user_id, variant_id, quantity, price_at_purchase, reason) 
               VALUES (?, ?, ?, ?, ?, ?)`;

  const values = [order_id, user_id, variant_id, quantity, price_at_purchase, reason];

  db.query(sql, values, (err, result) => {
      if (err) {
          console.error('Error inserting refund request:', err);
          return res.status(500).json({ error: 'Internal server error.' });
      }

      res.status(201).json({
          message: 'Refund request created successfully.',
          refund_request_id: result.insertId,
          status: 'pending',
      });
  });
};