const db = require('../config/db');


function formatDate(date) {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
  
    return [
      year,
      month.length < 2 ? '0' + month : month,
      day.length < 2 ? '0' + day : day
    ].join('-');
  }

exports.getSalesData =(req, res) => {
    // Object to hold all metrics per date
    const metrics = {};
  
    // Query 1: Total Orders and Total Revenue (excluding canceled orders and approved refunds)
    const query1 = `
      SELECT 
        DATE(o.created_at) AS date,
        COUNT(DISTINCT o.order_id) AS total_orders,
        SUM(oi_sub.total_price) AS total_revenue
      FROM Orders o
      JOIN (
        SELECT 
          oi.order_item_id,
          oi.order_id,
          oi.variant_id,
          oi.price_at_purchase,
          (oi.quantity - IFNULL(rr_sub.refunded_quantity, 0)) AS net_quantity,
          (oi.price_at_purchase * (oi.quantity - IFNULL(rr_sub.refunded_quantity, 0))) AS total_price
        FROM OrderItems oi
        LEFT JOIN (
          SELECT 
            rr.order_id,
            rr.variant_id,
            SUM(rr.quantity) AS refunded_quantity
          FROM RefundRequests rr
          WHERE rr.status = 'approved'
          GROUP BY rr.order_id, rr.variant_id
        ) rr_sub ON oi.order_id = rr_sub.order_id AND oi.variant_id = rr_sub.variant_id
        WHERE (oi.quantity - IFNULL(rr_sub.refunded_quantity, 0)) > 0
      ) oi_sub ON o.order_id = oi_sub.order_id
      WHERE o.status != 'canceled'
      GROUP BY DATE(o.created_at)
    `;
  
    db.query(query1, (err, results1) => {
      if (err) {
        console.error('Error executing Query 1:', err);
        return res.status(500).json({ error: 'Database query error.' });
      }
  
      results1.forEach(row => {
        const date = formatDate(row.date);
        if (!metrics[date]) {
          metrics[date] = {
            date: date,
            total_orders: 0,
            total_revenue: 0,
            total_profit: 0,
            cancelled_orders: 0,
            cancelled_cost: 0,
            refunded_orders: 0,
            refund_cost: 0
          };
        }
        metrics[date].total_orders = row.total_orders;
        metrics[date].total_revenue = parseFloat(row.total_revenue) || 0;
      });
  
      // Query 2: Total Profit Calculation
      const query2 = `
        SELECT 
          DATE(o.created_at) AS date,
          SUM( (oi_sub.price_at_purchase - (pv.price * 0.5)) * oi_sub.net_quantity ) AS total_profit
        FROM Orders o
        JOIN (
          SELECT 
            oi.order_item_id,
            oi.order_id,
            oi.variant_id,
            oi.price_at_purchase,
            (oi.quantity - IFNULL(rr_sub.refunded_quantity, 0)) AS net_quantity
          FROM OrderItems oi
          LEFT JOIN (
            SELECT 
              rr.order_id,
              rr.variant_id,
              SUM(rr.quantity) AS refunded_quantity
            FROM RefundRequests rr
            WHERE rr.status = 'approved'
            GROUP BY rr.order_id, rr.variant_id
          ) rr_sub ON oi.order_id = rr_sub.order_id AND oi.variant_id = rr_sub.variant_id
          WHERE (oi.quantity - IFNULL(rr_sub.refunded_quantity, 0)) > 0
        ) oi_sub ON o.order_id = oi_sub.order_id
        JOIN Product_Variant pv ON oi_sub.variant_id = pv.variant_id
        WHERE o.status != 'canceled'
        GROUP BY DATE(o.created_at)
      `;
  
      db.query(query2, (err, results2) => {
        if (err) {
          console.error('Error executing Query 2:', err);
          return res.status(500).json({ error: 'Database query error.' });
        }
  
        results2.forEach(row => {
          const date = formatDate(row.date);
          if (!metrics[date]) {
            metrics[date] = {
              date: date,
              total_orders: 0,
              total_revenue: 0,
              total_profit: 0,
              cancelled_orders: 0,
              cancelled_cost: 0,
              refunded_orders: 0,
              refund_cost: 0
            };
          }
          metrics[date].total_profit = parseFloat(row.total_profit) || 0;
        });
  
        // Query 3: Cancelled Orders and Cancelled Cost
        const query3 = `
          SELECT 
            DATE(updated_at) AS date,
            COUNT(*) AS cancelled_orders,
            SUM(total_price) AS cancelled_cost
          FROM Orders
          WHERE status = 'canceled'
          GROUP BY DATE(updated_at)
        `;
  
        db.query(query3, (err, results3) => {
          if (err) {
            console.error('Error executing Query 3:', err);
            return res.status(500).json({ error: 'Database query error.' });
          }
  
          results3.forEach(row => {
            const date = formatDate(row.date);
            if (!metrics[date]) {
              metrics[date] = {
                date: date,
                total_orders: 0,
                total_revenue: 0,
                total_profit: 0,
                cancelled_orders: 0,
                cancelled_cost: 0,
                refunded_orders: 0,
                refund_cost: 0
              };
            }
            metrics[date].cancelled_orders = row.cancelled_orders;
            metrics[date].cancelled_cost = parseFloat(row.cancelled_cost) || 0;
          });
  
          // Query 4: Refunded Orders and Refund Cost
          const query4 = `
            SELECT 
              DATE(rr.request_date) AS date,
              COUNT(DISTINCT rr.order_id) AS refunded_orders,
              SUM(rr.quantity * rr.price_at_purchase) AS refund_cost
            FROM RefundRequests rr
            WHERE rr.status = 'approved'
            GROUP BY DATE(rr.request_date)
          `;
  
          db.query(query4, (err, results4) => {
            if (err) {
              console.error('Error executing Query 4:', err);
              return res.status(500).json({ error: 'Database query error.' });
            }
  
            results4.forEach(row => {
              const date = formatDate(row.date);
              if (!metrics[date]) {
                metrics[date] = {
                  date: date,
                  total_orders: 0,
                  total_revenue: 0,
                  total_profit: 0,
                  cancelled_orders: 0,
                  cancelled_cost: 0,
                  refunded_orders: 0,
                  refund_cost: 0
                };
              }
              metrics[date].refunded_orders = row.refunded_orders;
              metrics[date].refund_cost = parseFloat(row.refund_cost) || 0;
            });
  
            // Convert metrics object to sorted array
            const metricsArray = Object.values(metrics).sort((a, b) => new Date(a.date) - new Date(b.date));
  
            res.json(metricsArray);
          });
        });
      });
    });
  };


exports.getRefundData = (req, res) => {
    const query = `
      SELECT 
        DATE_FORMAT(request_date, '%Y-%m-%d') AS date,
        COUNT(*) AS total_request,
        SUM(quantity * price_at_purchase) AS total_request_cost,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS total_pending,
        SUM(CASE WHEN status = 'pending' THEN quantity * price_at_purchase ELSE 0 END) AS pending_cost,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS total_approved,
        SUM(CASE WHEN status = 'approved' THEN quantity * price_at_purchase ELSE 0 END) AS approved_cost,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS total_rejected,
        SUM(CASE WHEN status = 'rejected' THEN quantity * price_at_purchase ELSE 0 END) AS rejected_cost
      FROM RefundRequests
      GROUP BY DATE_FORMAT(request_date, '%Y-%m-%d')
      ORDER BY date;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Failed to retrieve refund data.' });
        return;
      }
  
      const formattedResults = results.map(row => ({
        date: row.date,
        total_request: row.total_request,
        total_request_cost: Math.round(row.total_request_cost || 0),
        total_pending:Math.round(row.total_pending || 0) ,
        pending_cost: Math.round(row.pending_cost || 0),
        total_approved: Math.round(row.total_approved || 0),
        approved_cost: Math.round(row.approved_cost || 0),
        total_rejected: Math.round(row.total_rejected || 0),
        rejected_cost: Math.round(row.rejected_cost || 0)
      }));
  
      res.json(formattedResults);
    });
  };