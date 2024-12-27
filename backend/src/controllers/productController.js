const mysql = require("mysql2");

// Database connection
const db = require('../config/db');
const checkoutPool = require("../config/promise/promise_db");

// List all products variants with filtering, sorting, images, and discounts
exports.listProducts = (req, res) => {
    const {
        category_id,
        roast_level,
        bean_type,
        grind_type,
        caffeine_content,
        origin,
        average_rating,
        sort_by = 'price', // Default sorting
        sort_order = 'asc' // Default order
    } = req.query;


    const validSortBy = ['price', 'average_rating', 'stock']; // Allowed fields to sort by
    const validSortOrder = ['asc', 'desc'];

    if (!validSortBy.includes(sort_by)) {
        return res.status(400).json({ error: 'Invalid sort_by parameter.' });
    }

    if (!validSortOrder.includes(sort_order.toLowerCase())) {
        return res.status(400).json({ error: 'Invalid sort_order parameter.' });
    }

    const sortByColumn = {

        price: 'pv.price',
        average_rating: 'p.average_rating',
        stock: 'pv.stock'
    };

    let query = `
        SELECT 
            p.product_id, 
            p.name, 
            p.average_rating,
            p.category_id,
            p.roast_level, 
            p.bean_type, 
            p.grind_type, 
            p.description,
            p.caffeine_content, 
            p.origin, 
            pv.variant_id, 
            pv.weight_grams, 
            pv.price, 
            pv.stock, 
            pv.sku,
            CASE
                WHEN d.discount_id IS NULL OR d.active = 0
                    OR (d.start_date IS NOT NULL AND d.start_date > CURDATE())
                    OR (d.end_date IS NOT NULL AND d.end_date < CURDATE())
                THEN 
                    pv.price
                WHEN d.discount_type = 'percentage'
                    THEN (pv.price * GREATEST(0, 1 - (d.value / 100)))
                WHEN d.discount_type = 'fixed'
                    THEN GREATEST(0, pv.price - d.value)
                ELSE
                    pv.price
            END AS effective_price
        FROM 
            Products p
        JOIN 
            Product_Variant pv ON p.product_id = pv.product_id
        LEFT JOIN Discounts d ON d.variant_id = pv.variant_id
            AND d.active = 1
            AND (d.start_date IS NULL OR d.start_date <= CURDATE())
            AND (d.end_date IS NULL OR d.end_date >= CURDATE())
    `;

    let conditions = [];
    let params = [];

    if (category_id) {
        conditions.push(`p.category_id = ?`);
        params.push(category_id);
    }
    if (roast_level) {
        conditions.push(`p.roast_level = ?`);
        params.push(roast_level);
    }
    if (bean_type) {
        conditions.push(`p.bean_type = ?`);
        params.push(bean_type);
    }
    if (grind_type) {
        conditions.push(`p.grind_type = ?`);
        params.push(grind_type);
    }
    if (caffeine_content) {
        conditions.push(`p.caffeine_content = ?`);
        params.push(caffeine_content);
    }
    if (origin) {
        conditions.push(`p.origin = ?`);
        params.push(origin);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY ${sortByColumn[sort_by]} ${sort_order.toUpperCase()}`;

    db.query(query, params, (error, results) => {
        if (error) {
            console.error('Error retrieving products:', error.message);
            return res.status(500).json({ error: 'Failed to retrieve products.' });
        }
        res.json(results);
    });
};



// Retrieve a single product by ID
exports.getProductById = (req, res) => {
    const productId = req.params.id;

    const query = `
        SELECT 
            p.product_id,
            p.name, 
            p.origin, 
            p.roast_level, 
            p.bean_type, 
            p.grind_type, 
            p.flavor_profile, 
            p.processing_method, 
            p.caffeine_content, 
            p.description, 
            p.warranty_status,
            p.distributor_info,
            pv.weight_grams, 
            pv.price, 
            pv.stock, 
            pv.sku
        FROM Products p 
        JOIN Product_Variant pv ON p.product_id = pv.product_id 
        WHERE p.product_id = ?`;

    db.query(query, [productId], (error, results) => {
        if (error) {
            console.error('Error fetching product:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!results.length) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(results[0]);
    });
};

// List all categories
exports.listCategories = (req, res) => {
    const query = "SELECT category_id, name, description FROM Categories";

    db.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching categories:", error.message);
            return res.status(500).json({ error: "Failed to fetch categories" });
        }
        res.status(200).json(results);
    });
};


// Add a new category
exports.addCategory = (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Category name is required" });
    }

    const query = "INSERT INTO Categories (name, description) VALUES (?, ?)";
    db.query(query, [name, description || null], (error, result) => {
        if (error) {
            console.error("Error adding category:", error.message);
            return res.status(500).json({ error: "Failed to add category" });
        }
        res.status(201).json({ message: "Category added successfully", category_id: result.insertId });
    });
};


// Delete a category
exports.deleteCategory = (req, res) => {
    const categoryId = req.params.id;

    const query = "DELETE FROM Categories WHERE category_id = ?";
    db.query(query, [categoryId], (error, result) => {
        if (error) {
            console.error("Error deleting category:", error.message);
            return res.status(500).json({ error: "Failed to delete category" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json({ message: "Category deleted successfully" });
    });
};

// Update stock for a product
exports.updateStock = (req, res) => {
    const variantId = req.params.variant_id; // Use variant_id instead of product_id
    const { stock } = req.body;

    if (stock < 0) {
        return res.status(400).json({ error: "Stock cannot be negative." });
    }

    const query = "UPDATE Product_Variant SET stock = ? WHERE variant_id = ?";
    db.query(query, [stock, variantId], (error, results) => {
        if (error) {
            console.error("Error updating stock:", error.message);
            return res.status(500).json({ error: "Failed to update stock." });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Variant not found." });
        }
        res.json({ message: "Stock updated successfully." });
    });
};


// Create a new product
// Create a new product
exports.createProduct = async (req, res) => {
    console.log("POST /api/products/create - Request received");
    console.log("Request Body:", req.body);

    const { product, variants, images } = req.body;

    if (!product) {
        console.error("Product data is missing");
        return res.status(400).json({ error: "Product details are missing" });
    }

    const categoryId = product.category_id && Number.isInteger(product.category_id) ? product.category_id : null;

    console.log("Category ID:", categoryId);

    const productQuery = `
        INSERT INTO Products (
            name, origin, roast_level, bean_type, grind_type, flavor_profile, processing_method, 
            caffeine_content, category_id, description, warranty_status, distributor_info, average_rating
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const connection = await checkoutPool.getConnection(); // Use promise-based connection

    try {
        await connection.beginTransaction(); // Start transaction

        // Insert Product
        const [productResult] = await connection.query(productQuery, [
            product.name,
            product.origin,
            product.roast_level,
            product.bean_type,
            product.grind_type,
            product.flavor_profile,
            product.processing_method,
            product.caffeine_content,
            categoryId,
            product.description,
            product.warranty_status ? 1 : 0, // Ensure boolean is stored as integer
            product.distributor_info,
            0.00 // Default average_rating
        ]);

        console.log("Product inserted successfully:", productResult);

        const productId = productResult.insertId;

        // Insert Variants and Images
        if (variants && variants.length > 0) {
            for (const variant of variants) {
                console.log("Inserting Variant:", variant);

                // Insert the variant and get its ID
                const [variantResult] = await connection.query(`
                    INSERT INTO Product_Variant (product_id, weight_grams, price, stock, sku)
                    VALUES (?, ?, ?, ?, ?)
                `, [productId, variant.weight_grams, variant.price, variant.stock, variant.sku]);

                const variantId = variantResult.insertId;

                // Insert Images for the Variant
                if (images && images.length > 0) {
                    for (const image of images) {
                        console.log("Inserting Image for Variant:", image, "Variant ID:", variantId);
                        await connection.query(`
                            INSERT INTO Product_Images (variant_id, image_url, alt_text)
                            VALUES (?, ?, ?)
                        `, [variantId, image.image_url, image.alt_text]);
                    }
                }
            }
        }

        await connection.commit(); // Commit transaction
        console.log("Transaction committed successfully");
        res.status(201).json({ message: "Product added successfully", productId });
    } catch (error) {
        await connection.rollback(); // Rollback transaction on error
        console.error("Error during product creation:", error.message);
        res.status(500).json({ error: "Internal server error", details: error.message });
    } finally {
        connection.release(); // Release connection
    }
};


// Update a product by ID
exports.updateProduct = (req, res) => {
    const productId = req.params.id;
    const updateData = req.body;

    const query = 'UPDATE Products SET ? WHERE product_id = ?';
    db.query(query, [updateData, productId], (error, results) => {
        if (error) {
            console.error('Error updating product:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!results.affectedRows) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product updated successfully.' });
    });
};

// Delete a product by ID
// Delete a product by ID
exports.deleteProduct = (req, res) => {
    const productId = req.params.id;

    const query = 'DELETE FROM Products WHERE product_id = ?';
    db.query(query, [productId], (error, results) => {
        if (error) {
            console.error('Error deleting product:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!results.affectedRows) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully.' });
    });
};

// Delete a specific variant
exports.deleteVariant = (req, res) => {
    const variantId = req.params.variant_id;

    const query = "DELETE FROM Product_Variant WHERE variant_id = ?";
    db.query(query, [variantId], (error, results) => {
        if (error) {
            console.error("Error deleting variant:", error.message);
            return res.status(500).json({ error: "Failed to delete variant." });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Variant not found." });
        }
        res.json({ message: "Variant deleted successfully." });
    });
};


exports.allVariantsOfProductId = (req, res) => {
    const { product_id } = req.params;

    const query = `
        SELECT 
            variant_id, 
            product_id, 
            weight_grams, 
            price, 
            stock, 
            sku
        FROM 
            Product_Variant
        WHERE 
            product_id = ?
    `;

    db.query(query, [product_id], (error, results) => {
        if (error) {
            console.error('Error retrieving variants:', error.message);
            return res.status(500).json({ 
                error: 'Failed to retrieve variants. Please try again later.',
                details: error.message 
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ 
                error: 'No variants found for the specified product.'
            });
        }

        res.json({
            product_id,
            variants: results,
        });
    });
};

exports.getProductDetails = (req, res) => {
    const { product_id } = req.params;

    const query = `
        SELECT p.*, COALESCE(p.average_rating, 0) AS average_rating
        FROM Products p
        WHERE p.product_id = ?
    `;

    db.query(query, [product_id], (err, results) => {
        if (err) {
            console.error("Error fetching product details:", err);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json(results[0]);
    });
};


// Retrieve product details by variant ID
exports.getProductDetailsByVariant = (req, res) => {
    const variantId = req.params.variant_id;

    const productQuery = `
        SELECT 
            p.product_id,
            p.name, 
            p.origin, 
            p.roast_level, 
            p.bean_type, 
            p.grind_type, 
            p.flavor_profile, 
            p.processing_method, 
            p.caffeine_content, 
            p.description, 
            p.warranty_status,
            p.distributor_info,
            pv.variant_id, 
            pv.serial_number,
            pv.weight_grams, 
            pv.price, 
            pv.stock, 
            pv.sku 
        FROM 
            Products p 
        JOIN 
            Product_Variant pv ON p.product_id = pv.product_id 
        WHERE 
            pv.variant_id = ?;
    `;

    const imagesQuery = `
        SELECT image_url, alt_text 
        FROM Product_Images 
        WHERE variant_id = ?;
    `;

    db.query(productQuery, [variantId], (error, results) => {
        if (error) {
            console.error('Error retrieving product details:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const product = results[0];

        db.query(imagesQuery, [variantId], (imgError, imgResults) => {
            if (imgError) {
                console.error('Error retrieving product images:', imgError);
                return res.status(500).json({ error: 'Internal server error' });
            }
            product.images = imgResults.map(img => ({
                url: img.image_url,
                alt: img.alt_text
            }));
            res.json(product);
        });
    });
};


exports.getImagesForVariant = (req, res) => {
    const { variantId } = req.params;

    db.query(
        'SELECT image_id, variant_id, image_url, alt_text FROM Product_Images WHERE variant_id = ?',
        [variantId],
        (error, rows) => {
            if (error) {
                console.error('Error fetching product variant images:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Internal Server Error'
                });
            }

            return res.json({
                success: true,
                data: rows
            });
        }
    );
};


exports.getDiscountForVariant = (req, res) => {
    const { variantId } = req.params;

    // Fetch variant price
    db.query(
        'SELECT price FROM Product_Variant WHERE variant_id = ?',
        [variantId],
        (error, variantRows) => {
            if (error) {
                console.error('Error fetching variant price:', error);
                return res.status(500).json({ success: false, error: 'Internal Server Error' });
            }

            if (variantRows.length === 0) {
                return res.status(404).json({ success: false, error: 'Variant not found' });
            }

            const basePrice = parseFloat(variantRows[0].price);

            // Fetch any active discount for this variant
            db.query(
                `SELECT discount_id, discount_type, value, start_date, end_date, active 
                 FROM Discounts 
                 WHERE variant_id = ? 
                 AND active = TRUE
                 AND (start_date IS NULL OR start_date <= CURDATE())
                 AND (end_date IS NULL OR end_date >= CURDATE())
                 LIMIT 1`,
                [variantId],
                (discountError, discountRows) => {
                    if (discountError) {
                        console.error('Error fetching discount:', discountError);
                        return res.status(500).json({ success: false, error: 'Internal Server Error' });
                    }

                    if (discountRows.length === 0) {
                        // No active discount
                        return res.json({
                            success: true,
                            discount: null,
                            discounted_price: basePrice
                        });
                    }

                    const discount = discountRows[0];
                    let discountedPrice = basePrice;

                    if (discount.discount_type === 'percentage') {
                        discountedPrice = basePrice * (1 - (parseFloat(discount.value) / 100));
                    } else if (discount.discount_type === 'fixed') {
                        discountedPrice = basePrice - parseFloat(discount.value);
                        if (discountedPrice < 0) discountedPrice = 0; // Ensure not negative
                    }

                    return res.json({
                        success: true,
                        discount: {
                            discount_id: discount.discount_id,
                            discount_type: discount.discount_type,
                            value: discount.value,
                            start_date: discount.start_date,
                            end_date: discount.end_date,
                            active: discount.active
                        },
                        base_price: basePrice,
                        discounted_price: discountedPrice
                    });
                }
            );
        }
    );
};