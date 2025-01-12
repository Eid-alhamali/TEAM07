const mysql = require("mysql2");

const db = require('../config/db');




  exports.getItems = (req, res) => {      
    const userId = req.user.user_id; 
  
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
  
    const query = `
      SELECT 
        p.name AS product_name,
        pv.variant_id AS variantId,
        ci.quantity,
        pv.price,
        pv.weight_grams AS weight,
        pi.image_url AS image,
        d.discount_type,
        d.value AS discount_value
      FROM ShoppingCart sc
      JOIN ShoppingCartItems ci ON ci.cart_id = sc.cart_id
      JOIN Product_Variant pv ON pv.variant_id = ci.variant_id
      JOIN Products p ON p.product_id = pv.product_id
      LEFT JOIN Product_Images pi ON pi.variant_id = pv.variant_id
      LEFT JOIN Discounts d ON d.variant_id = pv.variant_id 
        AND d.active = TRUE 
        AND CURRENT_DATE BETWEEN d.start_date AND d.end_date
      WHERE sc.user_id = ? 
        AND pi.image_id = (SELECT MIN(image_id) FROM Product_Images WHERE variant_id = pv.variant_id)
    `;
    
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      // Apply the discount if present
      const updatedResults = results.map(item => {
        if (item.discount_type) {
          if (item.discount_type === 'percentage') {
            item.price = item.price - (item.price * item.discount_value / 100);
          } else if (item.discount_type === 'fixed') {
            item.price = item.price - item.discount_value;
          }
        }
        return item;
      });
  
      res.json(updatedResults);
    });
  };
  


  exports.syncToCart = (req, res) => {
    const userId = req.user.user_id; 
    const items = req.body; 
  
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty items array' });
    }
    // Step 1: Check if the cart exists for the user
    const checkCartQuery = 'SELECT cart_id FROM ShoppingCart WHERE user_id = ?';
    db.query(checkCartQuery, [userId], (err, cartResult) => {
      if (err) {
        console.error('Error checking cart:', err);
        return res.status(500).json({ error: 'Database error while checking cart' });
      }
  
      let cartId;   
      cartId = cartResult[0].cart_id;
      handleItems(cartId);
     
    });
     
    function handleItems(cartId) {
      // Step 2: Iterate through the items and check if they exist in the cart
      const checkItemQuery = 'SELECT variant_id FROM ShoppingCartItems WHERE cart_id = ? AND variant_id = ?';
      const insertItemQuery = 'INSERT INTO ShoppingCartItems (cart_id, variant_id, quantity) VALUES (?, ?, ?)';
      const checkStockQuery = 'SELECT stock FROM Product_Variant WHERE variant_id = ?';
      items.forEach((item) => {
        db.query(checkStockQuery, [item.variantId], (err, stockResult) => {
          if (err) {
            console.error('Error checking stock:', err);
            return res.status(500).json({ error: 'Database error while checking stock' });
          }
  
          if (stockResult.length === 0) {
            return res.status(400).json({ error: `Variant ID ${item.variantId} does not exist` });
          }
  
          const availableStock = stockResult[0].stock;
          const quantityToAdd = Math.min(item.quantity, availableStock);
  
          if (quantityToAdd > 0) {
            db.query(checkItemQuery, [cartId, item.variantId], (err, itemResult) => {
              if (err) {
                console.error('Error checking item:', err);
                return res.status(500).json({ error: 'Database error while checking item' });
              }
  
              if (itemResult.length === 0) {
                // Item does not exist, insert it
                db.query(
                  insertItemQuery,
                  [cartId, item.variantId, quantityToAdd],
                  (err) => {
                    if (err) {
                      console.error('Error adding item to cart:', err);
                      return res.status(500).json({ error: 'Database error while adding item to cart' });
                    }
                  }
                );
              }
            });
          }
        });
      });
  

      res.status(200).json({ message: 'Cart updated successfully' });
    }
  };





  checkStockAndUpdateCart = (variantId, newQuantity, cartId, res) => {
    const stockQuery = 'SELECT stock FROM Product_Variant WHERE variant_id = ?';
    db.query(stockQuery, [variantId], (err, stockResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (stockResults.length === 0) {
        return res.status(404).json({ message: 'Variant not found' });
      }
  
      const stock = stockResults[0].stock;
  
      if (newQuantity > stock) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
  
      // Update quantity in the cart
      const updateQuery = `
        UPDATE ShoppingCartItems 
        SET quantity = ? 
        WHERE cart_id = ? AND variant_id = ?
      `;
  
      db.query(updateQuery, [newQuantity, cartId, variantId], (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to update cart item' });
        }
  
        res.status(200).json({ message: 'Item quantity updated successfully' });
      });
    });
  };



    checkStockAndAddItem = (variantId, cartId, res) => {
    const stockQuery = 'SELECT stock FROM Product_Variant WHERE variant_id = ?';
    db.query(stockQuery, [variantId], (err, stockResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (stockResults.length === 0) {
        return res.status(404).json({ message: 'Variant not found' });
      }
  
      const stock = stockResults[0].stock;
  
      if (stock <= 0) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
  
      // Add the item with quantity 1
      const addItemQuery = `
        INSERT INTO ShoppingCartItems (cart_id, variant_id, quantity) 
        VALUES (?, ?, ?)
      `;
  
      db.query(addItemQuery, [cartId, variantId, 1], (err, addItemResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error adding item to cart' });
        }
  
        res.status(200).json({ message: 'Item added to cart successfully' });
      });
    });
  };




    exports.addToCart = (req, res) => {
    const userId = req.user.user_id; 
    const { variantId } = req.body;
  
    
    const getCartQuery = 'SELECT cart_id FROM ShoppingCart WHERE user_id = ?';
  
    db.query(getCartQuery, [userId], (err, cartResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (cartResults.length === 0) {
        return res.status(404).json({ message: 'Shopping cart not found' });
      }
  
      const cartId = cartResults[0].cart_id;
  
      
      const checkItemInCartQuery = `
        SELECT quantity FROM ShoppingCartItems 
        WHERE cart_id = ? AND variant_id = ?
      `;
      
      db.query(checkItemInCartQuery, [cartId, variantId], (err, itemResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
  
        // If item exists in cart, check stock and increment the quantity
        if (itemResults.length > 0) {
          const currentQuantity = itemResults[0].quantity;
          checkStockAndUpdateCart(variantId, currentQuantity + 1, cartId, res);
        } else {
          // If item does not exist in cart, add it with quantity 1
          checkStockAndAddItem(variantId, cartId, res);
        }
      });
    });
  }



  exports.incrementItem = (variantId, userId, res) => {   
    
    const query = `
      SELECT stock FROM Product_Variant WHERE variant_id = ?
    `;
    
    db.query(query, [variantId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Variant not found' });
      }
  
      const stock = results[0].stock;
  
      // Check if there is enough stock
      const cartQuery = `
        SELECT quantity FROM ShoppingCartItems 
        WHERE cart_id IN (SELECT cart_id FROM ShoppingCart WHERE user_id = ?) 
        AND variant_id = ?
      `;
  
      db.query(cartQuery, [userId, variantId], (err, cartResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }
  
        if (cartResults.length === 0) {
          return res.status(404).json({ message: 'Item not in cart' });
        }
  
        const currentQuantity = cartResults[0].quantity;
        const newQuantity = currentQuantity + 1;
  
        // Check if stock is sufficient
        if (newQuantity > stock) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
  
        // Increment quantity in the cart
        const updateQuery = `
          UPDATE ShoppingCartItems SET quantity = ? 
          WHERE cart_id IN (SELECT cart_id FROM ShoppingCart WHERE user_id = ?) 
          AND variant_id = ?
        `;
  
        db.query(updateQuery, [newQuantity, userId, variantId], (err, updateResult) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to update quantity' });
          }
  
          res.json({ message: 'success' });
        });
      });
    });
  };

  exports.decrementItem = (variantId, userId, res) => {  
    const query = `
      SELECT quantity FROM ShoppingCartItems 
      WHERE cart_id IN (SELECT cart_id FROM ShoppingCart WHERE user_id = ?) 
      AND variant_id = ?
    `;
  
    db.query(query, [userId, variantId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Item not in cart' });
      }
  
      const currentQuantity = results[0].quantity;
  
      
      if (currentQuantity <= 1) {
        return res.status(400).json({ message: 'Quantity cannot be less than 1' });
      }
  
      const newQuantity = currentQuantity - 1;
  
      const updateQuery = `
        UPDATE ShoppingCartItems SET quantity = ? 
        WHERE cart_id IN (SELECT cart_id FROM ShoppingCart WHERE user_id = ?) 
        AND variant_id = ?
      `;
  
      db.query(updateQuery, [newQuantity, userId, variantId], (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Failed to update quantity' });
        }
  
        res.json({ message: 'success' });
      });
    });
  };

  exports.removeItem = (variantId, userId, res) => {   
    const query = `
      DELETE FROM ShoppingCartItems 
      WHERE cart_id IN (SELECT cart_id FROM ShoppingCart WHERE user_id = ?) 
      AND variant_id = ?
    `;
  
    db.query(query, [userId, variantId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
  
      res.json({ message: 'success' });
    });
  };


  exports.getOneItem=(req, res) => {
    const { variantId } = req.params;
    
    const query = `
        SELECT 
            p.name AS product_name, 
            pv.variant_id AS variantId, 
            pv.stock, 
            pv.price, 
            pv.weight_grams AS weight, 
            pi.image_url AS image
        FROM 
            Products p
        JOIN 
            Product_Variant pv 
            ON p.product_id = pv.product_id
        LEFT JOIN 
            Product_Images pi 
            ON pv.variant_id = pi.variant_id
        WHERE 
            pv.variant_id = ? 
        LIMIT 1;
    `;
    
    db.query(query, [variantId], (error, results) => {
        if (error) {
            console.error('Error fetching product variant details:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            
            return res.status(404).json({ message: 'Product variant not found' });
            
        }

        res.status(200).json(results[0]);
    });
};
