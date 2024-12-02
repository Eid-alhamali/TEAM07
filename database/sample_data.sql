USE ecommerce_db;

-- Insert sample data into Users
INSERT INTO Users (user_id, first_name, last_name, email, phone_number, tax_id, password_hash)
VALUES
(1, 'John', 'Doe', 'johndoe@example.com', '+1234567890', '123456789', UNHEX(SHA2('password',256))),
(2, 'Jane', 'Smith', 'janesmith@example.com', '+0987654321', '987654321', UNHEX(SHA2('password',256))),
(3, 'Alice', 'Johnson', 'alicej@example.com', '+1122334455', '555555555', UNHEX(SHA2('password',256)));

-- Insert sample data into Managers
INSERT INTO Managers (manager_id, first_name, last_name, email, password_hash, role)
VALUES
(1, 'Michael', 'Brown', 'michaelb@example.com', UNHEX(SHA2('password',256)), 'sales_manager'),
(2, 'Laura', 'Wilson', 'lauraw@example.com', UNHEX(SHA2('password',256)), 'product_manager');

-- Insert sample data into Categories
INSERT INTO Categories (category_id, name, description)
VALUES
(1, 'Espresso Blends', 'Rich and full-bodied espresso blends.'),
(2, 'Single Origin', 'Unique flavors from specific regions.'),
(3, 'Decaf', 'Delicious coffee without the caffeine.'),
(4, 'Organic', 'Coffee produced without synthetic pesticides or fertilizers.');

-- Insert sample data into DeliveryOptions
INSERT INTO DeliveryOptions (delivery_option_id, name, cost, description)
VALUES
(1, 'Standard Shipping', 5.99, 'Delivery in 5-7 business days.'),
(2, 'Express Shipping', 9.99, 'Delivery in 2-3 business days.'),
(3, 'Overnight Shipping', 19.99, 'Next business day delivery.');

-- Insert sample data into Products
INSERT INTO Products (product_id, name, origin, roast_level, bean_type, grind_type, flavor_profile, processing_method, caffeine_content, category_id, description, warranty_status, distributor_info)
VALUES
(1, 'Colombian Single Origin', 'Colombia', 'Medium', 'Arabica', 'Whole Bean', 'Notes of chocolate and caramel', 'Washed', 'High', 2, 'A smooth and balanced coffee from Colombia.', FALSE, 'Distributed by CoffeeCorp'),
(2, 'Italian Espresso Blend', 'Multiple Origins', 'Espresso', 'Blend', 'Ground', 'Rich and bold with a dark chocolate finish', 'Natural', 'High', 1, 'A traditional Italian espresso blend.', FALSE, 'Imported by Espresso Imports'),
(3, 'Ethiopian Decaf', 'Ethiopia', 'Light', 'Arabica', 'Whole Bean', 'Floral and citrus notes', 'Honey-processed', 'Decaf', 3, 'A delightful decaf coffee with vibrant flavors.', FALSE, 'Organic Coffee Ltd.');

-- Insert sample data into Product_Variant
INSERT INTO Product_Variant (variant_id, product_id, weight_grams, price, stock, sku)
VALUES
(1, 1, 250, 14.99, 100, 'COL-SO-250'),
(2, 1, 500, 24.99, 50, 'COL-SO-500'),
(3, 2, 250, 12.99, 120, 'ITA-ESP-250'),
(4, 2, 500, 22.99, 80, 'ITA-ESP-500'),
(5, 3, 250, 15.99, 70, 'ETH-DEC-250');

-- Insert sample data into Product_Images
INSERT INTO Product_Images (image_id, product_id, image_url, alt_text)
VALUES
(1, 1, '/assets/images/products/product1.png', '250g package of Colombian Single Origin'),
(2, 1, '/assets/images/products/product1.png', '500g package of Colombian Single Origin'),
(3, 2, '/assets/images/products/product2.png', 'Italian Espresso Blend package'),
(4, 3, '/assets/images/products/product3.png', 'Ethiopian Decaf package');

-- Insert sample data into Address
INSERT INTO Address (address_id, user_id, address_line, city, state, postal_code, country)
VALUES
(1, 1, '123 Main Street', 'Anytown', 'Anystate', '12345', 'USA'),
(2, 2, '456 Elm Street', 'Othertown', 'Otherstate', '67890', 'USA'),
(3, 3, '789 Oak Avenue', 'Sometown', 'Somestate', '11223', 'USA');

-- Insert sample data into ShoppingCart
INSERT INTO ShoppingCart (cart_id, user_id, session_id)
VALUES
(1, 1, 'session_abc123'),
(2, 2, 'session_def456'),
(3, NULL, 'session_guest789'); -- Guest user

-- Insert sample data into ShoppingCartItems
INSERT INTO ShoppingCartItems (cart_item_id, cart_id, variant_id, quantity)
VALUES
(1, 1, 1, 2), -- John has 2x 250g Colombian
(2, 1, 3, 1), -- John has 1x 250g Espresso
(3, 2, 5, 3), -- Jane has 3x 250g Ethiopian Decaf
(4, 3, 2, 4); -- Guest has 4x 500g Colombians

-- Insert sample data into Comments
INSERT INTO Comments (comment_id, product_id, user_id, rating, content, approved)
VALUES
(1, 1, 1, 5, 'Absolutely love this coffee! Smooth and flavorful.', TRUE),
(2, 2, 2, 4, 'Great espresso blend, rich and bold.', TRUE),
(3, 3, 3, 3, 'Decent decaf coffee, but a bit too light for my taste.', TRUE);

-- Insert sample data into Orders
INSERT INTO Orders (order_id, user_id, total_price, status, delivery_option_id)
VALUES
(1, 1, 29.98, 'processing', 1),
(2, 2, 12.99, 'in-transit', 2),
(3, 3, 15.99, 'delivered', 1);

-- Insert sample data into OrderItems
INSERT INTO OrderItems (order_item_id, order_id, product_id, quantity, price_at_purchase)
VALUES
(1, 1, 1, 2, 14.99),
(2, 2, 2, 1, 12.99),
(3, 3, 3, 1, 15.99);

-- Insert sample data into Payments
INSERT INTO Payments (payment_id, order_id, user_id, amount, card_holder_name, card_number, card_expiration, cvv)
VALUES
(1, 1, 1, 29.98, 'John Doe', AES_ENCRYPT('4111111111111111', 'secretkey'), '2025-12-31', AES_ENCRYPT('123', 'secretkey')),
(2, 2, 2, 12.99, 'Jane Smith', AES_ENCRYPT('5555555555554444', 'secretkey'), '2024-10-31', AES_ENCRYPT('456', 'secretkey')),
(3, 3, 3, 15.99, 'Alice Johnson', AES_ENCRYPT('378282246310005', 'secretkey'), '2026-06-30', AES_ENCRYPT('789', 'secretkey'));

-- Insert sample data into RefundRequests
INSERT INTO RefundRequests (refund_request_id, order_id, user_id, status, notes)
VALUES
(1, 2, 2, 'pending', 'Product did not meet expectations.');

-- Insert sample data into ReturnItems
INSERT INTO ReturnItems (return_item_id, refund_request_id, product_id, quantity, price_at_purchase, reason)
VALUES
(1, 1, 2, 1, 12.99, 'Did not like the taste.');

-- Insert sample data into Invoices
INSERT INTO Invoices (invoice_id, order_id, user_id, invoice_pdf)
VALUES
(1, 1, 1, NULL),
(2, 2, 2, NULL),
(3, 3, 3, NULL);

-- Insert sample data into Discounts
INSERT INTO Discounts (discount_id, discount_type, value, start_date, end_date, category_id, active)
VALUES
(1, 'percentage', 10.00, '2023-01-01', '2023-12-31', 2, TRUE),
(2, 'fixed', 2.00, '2023-06-01', '2023-12-31', 3, TRUE);

-- Insert sample data into Wishlist
INSERT INTO Wishlist (wishlist_id, user_id, product_id)
VALUES
(1, 1, 3),
(2, 2, 1),
(3, 2, 2),
(4, 3, 1);

-- If the WishlistItems table is needed, insert sample data (assuming the schema is correct)
INSERT INTO WishlistItems (wishlist_item_id, wishlist_id, product_id)
VALUES
(1, 1, 3),
(2, 2, 1),
(3, 3, 2),
(4, 4, 1);