USE ecommerce_db;

-- Note: Passwords are all "password"
INSERT INTO Users (user_id, first_name, last_name, email, phone_number, tax_id, password_hash)
VALUES
(1, "Arya", "Hassibi", "arya@user.com", "+905301234567", "12345678901", SHA2("password", 256)),
(2, "Beste", "Bayhan", "beste@user.com", "+905302345678", "23456789012", SHA2("password", 256)),
(3, "Mustafa", "Topcu", "mustafa@user.com", "+905303456789", "34567890123", SHA2("password", 256)),
(4, "Orhun Ege", "Ozpay", "orhun@user.com", "+905304567890", "45678901234", SHA2("password", 256)),
(5, "Eid", "Alhamali", "eid@user.com", "+905305678901", "56789012345", SHA2("password", 256)),
(6, "Ecem", "Akın", "ecem@user.com", "+905306789012", "67890123456", SHA2("password", 256)),
(7, "Zeynep", "Işık", "zeynep.isik@user.com", "+905307890123", "78901234567", SHA2("password", 256)),
(8, "Cemal", "Yılmaz", "cemal.yilmaz@user.com", "+905308901234", "89012345678", SHA2("password", 256)),
(9, "Test", "User", "test@user.com", "+905309012345", "90123456789", SHA2("password", 256));

-- Note: Passwords are all "password"
INSERT INTO Managers (manager_id, first_name, last_name, email, password_hash, role)
VALUES
(1, "Arya", "Hassibi", "arya@manager.com", SHA2("admin12345", 256), "sales_manager"),
(2, "Beste", "Bayhan", "beste@manager.com", SHA2("admin12345", 256), "product_manager"),
(3, "Mustafa", "Topcu", "mustafa@manager.com", SHA2("admin12345", 256), "sales_manager"),
(4, "Orhun", "Ege Ozpay", "orhun@manager.com", SHA2("admin12345", 256), "product_manager"),
(5, "Eid", "Alhamali", "eid@manager.com", SHA2("admin12345", 256), "sales_manager"),
(6, "Ecem", "Akın", "ecem@manager.com", SHA2("admin12345", 256), "product_manager"),
(7, "Zeynep", "Işık", "zeynep@manager.com", SHA2("admin12345", 256), "product_manager"),
(8, "Cemal", "Yılmaz", "cemal@manager.com", SHA2("admin12345", 256), "product_manager"),
(9, "Sales", "Manager", "sales@manager.com", SHA2("admin12345", 256), "sales_manager"),
(10, "Product", "Manager", "product@manager.com", SHA2("admin12345", 256), "product_manager")
ON DUPLICATE KEY UPDATE 
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    email = VALUES(email),
    password_hash = VALUES(password_hash),
    role = VALUES(role);

INSERT INTO Categories (category_id, name, description)
VALUES
(1, "Blend Masterpieces", "Expertly curated mixes of beans for balanced and complex flavors."),
(2, "Seasonal Favorites", "Limited-time blends inspired by the seasons."),
(3, "Award-Winning Coffees", "Recognized and celebrated beans for their exceptional quality."),
(4, "Experimental Roasts", "Innovative roasting techniques for adventurous coffee lovers."),
(5, "Decade Favorites", "Timeless classics loved by our customers over the years.");

INSERT INTO DeliveryOptions (delivery_option_id, name, cost, description)
VALUES
(1, "Standard Shipping", 29.99, "Delivery in 5-7 business days."),
(2, "Express Shipping", 59.99, "Delivery in 2-3 business days."),
(3, "Overnight Shipping", 119.99, "Next business day delivery.");

INSERT INTO Products (product_id, name, origin, roast_level, bean_type, grind_type, flavor_profile, processing_method, caffeine_content, category_id, description, warranty_status, distributor_info, average_rating)
VALUES
(1, "Sunrise Over the Serengeti", "Tanzania", "Light", "Arabica", "Whole Bean", "Citrus and floral whispers", "Washed", "High", 1, 
    "Like the first light kissing the vast plains of the Serengeti, this coffee feels alive. Notes of citrus and delicate florals bloom with every sip, reminding you of new beginnings and untamed beauty.", 
    FALSE, "Tanzanian Treasures Ltd.", 4.7),

(2, "Bolivian Echoes", "Bolivia", "Medium", "Blend", "Ground", "Nutty with a whisper of cocoa", "Honey-processed", "Half-Caf", 2, 
    "A quiet symphony that lingers in the soul like the echoes of Andean pan flutes. Its nutty richness and subtle cocoa notes evoke mountain trails and misty mornings.", 
    TRUE, "Bolivia Bean Collective", 4.5),

(3, "The Midnight Drifter", "Ethiopia", "Espresso", "Arabica", "Ground", "Dark chocolate and blackberry", "Natural", "High", 3, 
    "A bold companion for sleepless nights and untold stories. Its intense dark chocolate depth and blackberry intrigue feel like wandering under a canopy of stars.", 
    FALSE, "Ethiopian Coffee Routes", 4.8),

(4, "Costa Rican Summer", "Costa Rica", "Light", "Arabica", "Ground", "Citrus and honeydew", "Washed", "High", 3, 
    "The brightness of citrus and a soft hint of honeydew carry you to endless beaches and golden sunsets. A sip is a reminder of warmth and carefree days.", 
    TRUE, "Costa Rica Coffee & Co.", 4.6),

(5, "Guatemalan Volcano Heart", "Guatemala", "Dark", "Blend", "Whole Bean", "Caramel and red wine", "Natural", "High", 5, 
    "Forged in the heart of volcanic soil, this coffee ignites the senses with rich caramel sweetness and a red wine finish. A tribute to the land's fiery soul.", 
    FALSE, "Guatemala Coffee Legends", 4.7),

(6, "Cuban Memory Lane", "Cuba", "Espresso", "Robusta", "Whole Bean", "Cocoa and brown sugar", "Washed", "High", 4, 
    "A rich, nostalgic blend that whispers of Havana's cobbled streets and sunlit afternoons. Hints of cocoa and brown sugar evoke the rhythm of a simpler time.", 
    TRUE, "Havana Coffee Roasters", 4.5),

(7, "Indonesian Silk", "Indonesia", "Medium", "Arabica", "Whole Bean", "Velvety with soft spice", "Honey-processed", "Half-Caf", 4, 
    "Soft and smooth, like the flowing silk of ancient Java. Subtle spices weave through each sip, leaving an impression as graceful as it is unforgettable.", 
    FALSE, "Indo Luxe Beans", 4.6),

(8, "Misty Hills of Rwanda", "Rwanda", "Light", "Blend", "Ground", "Blackberry and jasmine", "Washed", "Decaf", 3, 
    "Ethereal and serene, this blend transports you to rolling mist-covered hills. Its delicate blackberry and jasmine notes whisper peace and stillness.", 
    TRUE, "Rwanda Bean Collective", 4.8),

(9, "Santiago at Dusk", "Chile", "Dark", "Liberica", "Whole Bean", "Earthy with a molasses finish", "Natural", "High", 1, 
    "Deep and grounding, like the fading light on Santiago's streets. Its earthy warmth and molasses undertone linger, wrapping you in twilight's embrace.", 
    FALSE, "Chilean Coffee Routes", 4.3),

(10, "Panama Geisha Dream", "Panama", "Light", "Arabica", "Whole Bean", "Jasmine and tropical fruit", "Washed", "High", 3, 
    "An ethereal experience. Jasmine notes entwined with tropical fruit sweetness make this a coffee to savor slowly, like a daydream slipping into reality.", 
    TRUE, "Panama Coffee Treasures", 4.9),

(11, "Mexican Firewood", "Mexico", "French", "Blend", "Ground", "Smoke and spiced chocolate", "Other", "Half-Caf", 1, 
    "A robust brew that feels like sitting by a crackling fire in the Mexican highlands. Smoke and spiced chocolate warmth make this a grounding companion.", 
    FALSE, "Mexican Coffee Collective", 4.4),

(12, "Peruvian Secret Garden", "Peru", "Medium", "Arabica", "Whole Bean", "Floral and honey", "Washed", "Decaf", 2, 
    "Soft as the petals of an unseen bloom, this coffee whispers of a hidden garden. Its floral and honey notes unfold gently, like secrets in the air.", 
    TRUE, "Peruvian Heritage Beans", 4.7),

(13, "Yemen Desert Mirage", "Yemen", "Dark", "Blend", "Whole Bean", "Chocolate and fig", "Natural", "High", 5, 
    "Like a rare vision in the shifting sands, this coffee is a treasure of chocolate richness and fig sweetness. A mirage worth chasing.", 
    FALSE, "Yemeni Coffee Routes", 4.8),

(14, "Vietnamese Bold Horizon", "Vietnam", "French", "Robusta", "Ground", "Bold with caramel undertones", "Washed", "High", 1, 
    "A daring blend that pushes boundaries. Its boldness and caramel undertones embody the resilience and spirit of Vietnam.", 
    FALSE, "Vietnam Coffee Collective", 4.3),

(15, "Kenyan Red Sunset", "Kenya", "Dark", "Arabica", "Ground", "Berry and wine", "Natural", "High", 5, 
    "Rich as a Kenyan sunset fading to red, this coffee's berry and wine notes evoke a boldness that commands attention.", 
    FALSE, "Kenyan Bean Collective", 4.7),

(16, "Honduran Stargazer", "Honduras", "Medium", "Arabica", "Whole Bean", 
    "Sweet and herbal", "Washed", "Decaf", 4, 
    "A coffee for quiet nights under infinite skies. Sweetness and herbal notes blend in harmony, like constellations above.", 
    TRUE, "Honduran Coffee Routes", 4.4),

(17, "Laos Whispering Rain", "Laos", "Medium", "Blend", "Whole Bean", "Nutty with soft spice", "Natural", "Half-Caf", 4, 
    "Gentle as rain on lush green fields, this coffee offers nutty warmth with a touch of spice. It feels like a quiet conversation with nature.", 
    TRUE, "Laos Coffee Collective", 4.5),

(18, "Turkish Caravan Tale", "Turkey", "French", "Blend", "Ground", "Cardamom and dark chocolate", "Other", "High", 2, 
    "Rich, spiced, and complex as the tales of caravans crossing ancient lands. Cardamom and dark chocolate transport you to a world of wonder.", 
    FALSE, "Turkish Coffee Routes", 4.8),

(19, "Colombian Daybreak", "Colombia", "Light", "Arabica", "Ground", "Bright and citrusy", "Washed", "High", 2, 
    "Fresh as dawn breaking over Colombian hills, this coffee's brightness awakens the senses and inspires hope for the day ahead.", 
    TRUE, "Colombian Coffee Legends", 4.6),

(20, "Ecuadorian High Spirits", "Ecuador", "Medium", "Blend", "Whole Bean", "Cocoa and citrus", "Natural", "High", 4, 
    "Uplifting and bright, this coffee's cocoa depth and citrus zing feel like a celebration in a cup. A tribute to life's vibrant highs.", 
    TRUE, "Ecuadorian Coffee Routes", 4.7);

INSERT INTO Product_Variant (variant_id, product_id, weight_grams, price, stock, sku)
VALUES
-- Product 1 Variants
(1, 1, 250, 500.00, 100, "ETH-YIR-250"),
(2, 1, 500, 950.00, 1, "ETH-YIR-500"),          -- Only 1 left in stock
(3, 1, 1000, 1800.00, 4, "ETH-YIR-1000"),       -- Only 1 left in stock

-- Product 2 Variants
(4, 2, 250, 450.00, 200, "COL-SUP-250"),
(5, 2, 500, 850.00, 80, "COL-SUP-500"),

-- Product 3 Variants
(6, 3, 250, 600.00, 150, "BRA-SAN-250"),

-- Product 4 Variants
(7, 4, 250, 550.00, 0, "KEN-AA-250"),           -- Out of stock
(8, 4, 500, 1050.00, 60, "KEN-AA-500"),

-- Product 5 Variants
(9, 5, 250, 580.00, 90, "SUM-MAN-250"),
(10, 5, 500, 1100.00, 0, "SUM-MAN-500"),        -- Out of stock
(11, 5, 1000, 2100.00, 1, "SUM-MAN-1000"),      -- Out of stock

-- Product 6 Variants
(12, 6, 250, 520.00, 130, "GUA-ANT-250"),
(13, 6, 500, 1000.00, 70, "GUA-ANT-500"),

-- Product 7 Variants
(14, 7, 250, 480.00, 160, "COS-TAR-250"),

-- Product 8 Variants
(15, 8, 250, 530.00, 110, "NIC-SEG-250"),
(16, 8, 500, 1020.00, 55, "NIC-SEG-500"),

-- Product 9 Variants
(17, 9, 250, 400.00, 200, "MEX-ALT-250"),

-- Product 10 Variants
(18, 10, 250, 510.00, 0, "HON-MAR-250"),        -- Out of stock
(19, 10, 500, 1000.00, 1, "HON-MAR-500"),       -- Only 1 left in stock

-- Product 11 Variants
(20, 11, 250, 495.00, 130, "PER-SIG-250"),

-- Product 12 Variants
(21, 12, 250, 575.00, 90, "TAN-PEA-250"),
(22, 12, 500, 1150.00, 1, "TAN-PEA-500"),       -- Only 1 left in stock
(23, 12, 1000, 2200.00, 20, "TAN-PEA-1000"),

-- Product 13 Variants
(24, 13, 250, 610.00, 80, "PNG-SIG-250"),

-- Product 14 Variants
(25, 14, 250, 540.00, 100, "RWA-BUR-250"),
(26, 14, 500, 1080.00, 50, "RWA-BUR-500"),

-- Product 15 Variants
(27, 15, 250, 505.00, 120, "ELS-PAC-250"),

-- Product 16 Variants
(28, 16, 250, 700.00, 60, "PAN-GEI-250"),
(29, 16, 500, 1350.00, 0, "PAN-GEI-500"),       -- Out of stock
(30, 16, 1000, 2600.00, 15, "PAN-GEI-1000"),

-- Product 17 Variants
(31, 17, 250, 380.00, 200, "VIE-ROB-250"),

-- Product 18 Variants
(32, 18, 250, 550.00, 100, "IND-MON-250"),

-- Product 19 Variants
(33, 19, 250, 620.00, 70, "YEM-MOH-250"),
(34, 19, 500, 1200.00, 1, "YEM-MOH-500"),       -- Only 1 left in stock

-- Product 20 Variants
(35, 20, 250, 500.00, 0, "LAO-BOL-250"),
(36, 20, 500, 980.00, 40, "LAO-BOL-500");       -- Out of stock

INSERT INTO Product_Images (image_id, variant_id, image_url, alt_text)
VALUES
(1, 1, "/assets/images/products/product1.png", "Sunrise Over the Serengeti 250g"),
(2, 2, "/assets/images/products/product1.png", "Sunrise Over the Serengeti 500g"),
(3, 3, "/assets/images/products/product1.png", "Sunrise Over the Serengeti 1000g"),


(4, 4, "/assets/images/products/product2.png", "Bolivian Echoes 250g"),
(5, 5, "/assets/images/products/product2.png", "Bolivian Echoes 500g"),

(6, 6, "/assets/images/products/product3.png", "The Midnight Drifter 250g"),

(7, 7, "/assets/images/products/product4.png", "Costa Rican Summer 250g"),
(8, 8, "/assets/images/products/product4.png", "Costa Rican Summer 500g"),

(9, 9, "/assets/images/products/product5.png", "Guatemalan Volcano Heart 250g"),
(10, 10, "/assets/images/products/product5.png", "Guatemalan Volcano Heart 500g"),
(11, 11, "/assets/images/products/product5.png", "Guatemalan Volcano Heart 1000g"),

(12, 12, "/assets/images/products/product6.png", "Cuban Memory Lane 250g"),
(13, 13, "/assets/images/products/product6.png", "Cuban Memory Lane 500g"),

(14, 14, "/assets/images/products/product7.png", "Indonesian Silk 250g"),

(15, 15, "/assets/images/products/product8.png", "Misty Hills of Rwanda 250g"),
(16, 16, "/assets/images/products/product8.png", "Misty Hills of Rwanda 500g"),

(17, 17, "/assets/images/products/product9.png", "Santiago at Dusk 250g"),

(18, 18, "/assets/images/products/product10.png", "Panama Geisha Dream 250g"),
(19, 19, "/assets/images/products/product10.png", "Panama Geisha Dream 500g"),

(20, 20, "/assets/images/products/product11.png", "Mexican Firewood 250g"),

(21, 21, "/assets/images/products/product12.png", "Peruvian Secret Garden 250g"),
(22, 22, "/assets/images/products/product12.png", "Peruvian Secret Garden 500g"),
(23, 23, "/assets/images/products/product12.png", "Peruvian Secret Garden 1000g"),

(24, 24, "/assets/images/products/product13.png", "Yemen Desert Mirage 250g"),

(25, 25, "/assets/images/products/product14.png", "Vietnamese Bold Horizon 250g"),
(26, 26, "/assets/images/products/product14.png", "Vietnamese Bold Horizon 500g"),

(27, 27, "/assets/images/products/product15.png", "Kenyan Red Sunset 250g"),

(28, 28, "/assets/images/products/product16.png", "Honduran Stargazer 250g"),
(29, 29, "/assets/images/products/product16.png", "Honduran Stargazer 500g"),
(30, 30, "/assets/images/products/product16.png", "Honduran Stargazer 1000g"),

(31, 31, "/assets/images/products/product17.png", "Laos Whispering Rain 250g"),

(32, 32, "/assets/images/products/product18.png", "Turkish Caravan Tale 250g"),

(33, 33, "/assets/images/products/product19.png", "Colombian Daybreak 250g"),
(34, 34, "/assets/images/products/product19.png", "Colombian Daybreak 500g"),

(35, 35, "/assets/images/products/product20.png", "Ecuadorian High Spirits 250g"),
(36, 36, "/assets/images/products/product20.png", "Ecuadorian High Spirits 500g");


INSERT INTO Address (address_id, user_id, address_line, city, state, postal_code, country)
VALUES
(1, 1, "İstiklal Cad. No:1", "İstanbul", "İstanbul", "34433", "Turkey"),
(2, 2, "Atatürk Bulvarı No:45", "Ankara", "Ankara", "06690", "Turkey"),
(3, 3, "Çankaya Sok. No:12", "İzmir", "İzmir", "35210", "Turkey"),
(4, 4, "Fatih Mah. No:7", "Bursa", "Bursa", "16010", "Turkey"),
(5, 5, "Merkez Cad. No:5", "Antalya", "Antalya", "07020", "Turkey"),
(6, 6, "Bağdat Cad. No:8", "İstanbul", "İstanbul", "34726", "Turkey"),
(7, 7, "Kızılay Meydanı No:3", "Ankara", "Ankara", "06420", "Turkey"),
(8, 8, "Konak Cad. No:10", "İzmir", "İzmir", "35220", "Turkey");

-- Insert into ShoppingCart for Registered Users
INSERT INTO ShoppingCart (cart_id, user_id, session_id, created_at, updated_at)
VALUES
    (1, 1, NULL, "2024-12-01 10:00:00", "2024-12-01 10:00:00"),
    (2, 2, NULL, "2024-12-02 11:00:00", "2024-12-02 11:00:00"),
    (3, 3, NULL, "2024-12-03 12:00:00", "2024-12-03 12:00:00"),
    (4, 4, NULL, "2024-12-04 13:00:00", "2024-12-04 13:00:00"),
    (5, 5, NULL, "2024-12-05 14:00:00", "2024-12-05 14:00:00"),
    (6, 6, NULL, "2024-12-06 15:00:00", "2024-12-06 15:00:00"),
    (7, 7, NULL, "2024-12-07 16:00:00", "2024-12-07 16:00:00"),
    (8, 8, NULL, "2024-12-08 17:00:00", "2024-12-08 17:00:00");

-- Insert into ShoppingCart for Guest Users
INSERT INTO ShoppingCart (cart_id, user_id, session_id, created_at, updated_at)
VALUES
    (9, NULL, "session_ABC123", "2024-12-09 18:00:00", "2024-12-09 18:00:00"),
    (10, NULL, "session_DEF456", "2024-12-10 19:00:00", "2024-12-10 19:00:00"),
    (11, NULL, "session_GHI789", "2024-12-11 20:00:00", "2024-12-11 20:00:00"),
    (12, NULL, "session_JKL012", "2024-12-12 21:00:00", "2024-12-12 21:00:00");

-- Insert into ShoppingCartItems for Registered Users
INSERT INTO ShoppingCartItems (cart_item_id, cart_id, variant_id, quantity, added_at)
VALUES
    (1, 1, 1, 2, "2024-12-01 10:05:00"),
    (2, 1, 4, 1, "2024-12-01 10:10:00"),
    (3, 2, 6, 3, "2024-12-02 11:05:00"),
    (4, 3, 7, 1, "2024-12-03 12:15:00"),
    (5, 4, 9, 2, "2024-12-04 13:20:00"),
    (6, 5, 12, 1, "2024-12-05 14:25:00"),
    (7, 6, 14, 4, "2024-12-06 15:30:00"),
    (8, 7, 17, 1, "2024-12-07 16:35:00"),
    (9, 8, 20, 2, "2024-12-08 17:40:00");

-- Insert into ShoppingCartItems for Guest Users
INSERT INTO ShoppingCartItems (cart_item_id, cart_id, variant_id, quantity, added_at)
VALUES
    (10, 9, 2, 1, "2024-12-09 18:05:00"),
    (11, 10, 5, 2, "2024-12-10 19:10:00"),
    (12, 11, 10, 1, "2024-12-11 20:15:00"),
    (13, 12, 15, 3, "2024-12-12 21:20:00");

INSERT INTO Comments (comment_id, product_id, user_id, rating, content, approved, created_at)
VALUES
(1, 1, 1, 5, "Absolutely love the floral notes!", TRUE, "2024-11-02 10:30:00"),
(2, 2, 2, 4, "Great balance and smooth taste.", TRUE, "2024-11-16 13:45:00"),
(3, 3, 3, 3, "Too strong for my liking.", FALSE, "2024-12-02 09:15:00"),
(4, 4, 4, 5, "Bright and fruity, perfect for mornings!", TRUE, "2024-12-03 11:00:00"),
(5, 5, 5, 4, "Rich and complex flavors.", TRUE, "2024-11-21 16:20:00"),
(6, 6, 6, 2, "Not as sweet as I expected.", FALSE, "2024-10-26 17:50:00"),
(7, 7, 7, 5, "Delightful and aromatic.", TRUE, "2024-12-07 18:30:00"),
(8, 8, 8, 4, "Good quality coffee.", TRUE, "2024-12-08 19:45:00");

INSERT INTO Orders (order_id, user_id, total_price, status, delivery_option_id, created_at, updated_at)
VALUES
-- Orders for User 1
(1, 1, 1500.00, "delivered", 1, "2024-11-01 10:00:00", "2024-11-05 15:00:00"),
(2, 1, 800.00, "delivered", 2, "2024-11-15 12:30:00", "2024-11-17 18:00:00"),
(3, 1, 300.00, "delivered", 1, "2024-12-01 09:45:00", "2024-12-06 14:30:00"),

-- Orders for User 2
(4, 2, 500.00, "in-transit", 1, "2024-12-05 11:20:00", "2024-12-05 11:20:00"),

-- Orders for User 3
(5, 3, 2500.00, "processing", 3, "2024-12-07 08:15:00", "2024-12-07 08:15:00"),

-- Orders for User 5
(6, 5, 750.00, "delivered", 2, "2024-11-20 14:50:00", "2024-11-23 16:00:00"),

-- Orders for User 6
(7, 6, 1200.00, "delivered", 1, "2024-10-25 16:30:00", "2024-10-30 10:00:00"),
(8, 6, 600.00, "in-transit", 2, "2024-12-02 13:40:00", "2024-12-02 13:40:00"),

-- Orders for User 8
(9, 8, 900.00, "processing", 3, "2024-12-06 17:25:00", "2024-12-06 17:25:00");


INSERT INTO Payments (payment_id, order_id, user_id, payment_date, amount, card_holder_name, card_number, card_expiration, cvv)
VALUES
(1, 1, 1, "2024-11-01 10:05:00", 1500.00, "Arya Hassibi", AES_ENCRYPT("4111111111111111", "encryption_key"), "2026-05-01", AES_ENCRYPT("123", "encryption_key")),
(2, 2, 1, "2024-11-15 12:35:00", 800.00, "Arya Hassibi", AES_ENCRYPT("4111111111111111", "encryption_key"), "2026-05-01", AES_ENCRYPT("123", "encryption_key")),
(3, 3, 1, "2024-12-01 09:50:00", 300.00, "Arya Hassibi", AES_ENCRYPT("4111111111111111", "encryption_key"), "2026-05-01", AES_ENCRYPT("123", "encryption_key")),
(4, 4, 2, "2024-12-05 11:25:00", 500.00, "Beste Bayhan", AES_ENCRYPT("4222222222222222", "encryption_key"), "2025-06-01", AES_ENCRYPT("456", "encryption_key")),
(5, 5, 3, "2024-12-07 08:20:00", 2500.00, "Mustafa Topcu", AES_ENCRYPT("4333333333333333", "encryption_key"), "2027-07-01", AES_ENCRYPT("789", "encryption_key")),
(6, 6, 5, "2024-11-20 14:55:00", 750.00, "Eid Alhamali", AES_ENCRYPT("4444444444444444", "encryption_key"), "2025-08-01", AES_ENCRYPT("012", "encryption_key")),
(7, 7, 6, "2024-10-25 16:35:00", 1200.00, "Ecem Akın", AES_ENCRYPT("4555555555555555", "encryption_key"), "2024-09-01", AES_ENCRYPT("345", "encryption_key")),
(8, 8, 6, "2024-12-02 13:45:00", 600.00, "Ecem Akın", AES_ENCRYPT("4555555555555555", "encryption_key"), "2024-09-01", AES_ENCRYPT("345", "encryption_key")),
(9, 9, 8, "2024-12-06 17:30:00", 900.00, "Cemal Yılmaz", AES_ENCRYPT("4666666666666666", "encryption_key"), "2026-10-01", AES_ENCRYPT("678", "encryption_key"));

INSERT INTO RefundRequests (refund_request_id, order_id, user_id, request_date, status, notes)
VALUES
(1, 2, 1, "2024-11-20 10:00:00", "approved", "Product arrived damaged."),
(2, 4, 2, "2024-12-10 12:00:00", "pending", "Wrong product delivered."),
(3, 7, 6, "2024-10-30 09:30:00", "rejected", "No reason provided.");


INSERT INTO ReturnItems (return_item_id, refund_request_id, product_id, quantity, price_at_purchase, reason)
VALUES
(1, 1, 3, 1, 600.00, "Damaged packaging."),
(2, 2, 6, 2, 520.00, "Incorrect variant received."),
(3, 3, 12, 1, 575.00, "Did not like the taste.");

INSERT INTO Invoices (invoice_id, order_id, user_id, invoice_pdf, created_at)
VALUES
(1, 1, 1, NULL, "2024-11-05 15:05:00"),
(2, 2, 1, NULL, "2024-11-17 18:05:00"),
(3, 3, 1, NULL, "2024-12-06 14:35:00"),
(4, 4, 2, NULL, "2024-12-05 11:25:00"),
(5, 5, 3, NULL, "2024-12-07 08:25:00"),
(6, 6, 5, NULL, "2024-11-23 16:05:00"),
(7, 7, 6, NULL, "2024-10-30 10:05:00"),
(8, 8, 6, NULL, "2024-12-02 13:45:00"),
(9, 9, 8, NULL, "2024-12-06 17:30:00");

INSERT INTO Discounts (discount_id, discount_type, value, start_date, end_date, variant_id, active)
VALUES
(1, "percentage", 10.00, "2024-12-01", "2024-12-31", 1, TRUE),
(2, "fixed", 50.00, "2024-11-15", "2024-11-30", 5, TRUE),
(3, "percentage", 15.00, "2024-10-01", "2024-10-31", 9, FALSE),
(4, "fixed", 100.00, "2024-12-05", "2024-12-20", 28, TRUE),
(5, "percentage", 5.00, "2024-12-10", "2024-12-25", 16, TRUE);

INSERT INTO Wishlist (wishlist_id, user_id, created_at)
VALUES
(1, 1, "2024-12-01 10:00:00"),
(2, 2, "2024-12-03 09:30:00"),
(3, 4, "2024-12-05 15:45:00"),
(4, 5, "2024-12-02 18:20:00"),
(5, 6, "2024-12-07 11:10:00"),
(6, 8, "2024-12-04 13:50:00");

INSERT INTO WishlistItems (wishlist_item_id, wishlist_id, variant_id, added_at)
VALUES
-- User 1"s Wishlist
(1, 1, 3, "2024-12-01 10:15:00"),
(2, 1, 7, "2024-12-01 10:25:00"),

-- User 2"s Wishlist
(3, 2, 5, "2024-12-03 09:35:00"),
(4, 2, 14, "2024-12-03 09:50:00"),

-- User 4"s Wishlist
(5, 3, 8, "2024-12-05 15:50:00"),
(6, 3, 20, "2024-12-05 16:10:00"),
(7, 3, 25, "2024-12-05 16:20:00"),

-- User 5"s Wishlist
(8, 4, 2, "2024-12-02 18:25:00"),

-- User 6"s Wishlist
(9, 5, 11, "2024-12-07 11:15:00"),
(10, 5, 13, "2024-12-07 11:25:00"),

-- User 8"s Wishlist
(11, 6, 18, "2024-12-04 13:55:00"),
(12, 6, 28, "2024-12-04 14:05:00"),
(13, 6, 30, "2024-12-04 14:20:00");
