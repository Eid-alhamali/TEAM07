CREATE DATABASE ECOMMERCE
USE ECOMMERCE


CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    tax_id VARCHAR(20),
    password_hash VARBINARY(256) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Managers (
    manager_id INT AUTO_INCREMENT PRIMARY KEY,
	first_name VARCHAR(100) NOT NULL,
	last_name  VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARBINARY(256) NOT NULL,
    role ENUM('sales_manager', 'product_manager') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
  
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('processing', 'in-transit', 'delivered') DEFAULT 'processing',
    delivery_option_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_option_id) REFERENCES DeliveryOptions(delivery_option_id) ON DELETE SET NULL
);

CREATE TABLE OrderItems (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE SET NULL
);

CREATE TABLE Invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    user_id INT,
    invoice_pdf BLOB,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE  NOT NULL ,
    description TEXT
);


CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
	roast_level ENUM('Light', 'Medium', 'Dark', 'French', 'Espresso') NOT NULL,
	bean_type ENUM('Arabica', 'Robusta', 'Liberica', 'Blend') NOT NULL,
	grind_type ENUM('Whole Bean', 'Ground', 'Pods', 'Other') DEFAULT 'Whole Bean',
	flavor_profile VARCHAR(255),
	processing_method ENUM('Washed', 'Natural', 'Honey-processed', 'Other') DEFAULT 'Other',
    caffeine_content ENUM('High', 'Decaf', 'Half-Caf') DEFAULT 'High',
    category_id INT,
    serial_number VARCHAR(50) AUTO_INCREMENT UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    warranty_status BOOLEAN DEFAULT FALSE,    
    distributor_info TEXT,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE
);

CREATE TABLE Product_Variant (
    variant_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    weight_grams INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    sku VARCHAR(50) UNIQUE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE CASCADE
);

CREATE TABLE product_images (
    image_id INT PRIMARY KEY,
    product_id INT,
    image_url VARCHAR(500),
    alt_text VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE discounts (
    discount_id INT PRIMARY KEY,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    value DECIMAL(10, 2) NOT NULL,  
    start_date DATE,                
    end_date DATE,                 
    product_id INT,                 
    category_id INT,                
    active BOOLEAN DEFAULT TRUE,  
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);


CREATE TABLE Wishlist (
    wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

CREATE TABLE WishlistItems (
    wishlist_item_id INT AUTO_INCREMENT PRIMARY KEY,
    wishlist_id INT NOT NULL,
    product_id INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wishlist_id) REFERENCES Wishlist(wishlist_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);

CREATE TABLE Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL,
    card_holder_name VARCHAR(100) NOT NULL,
    card_number VARBINARY(256) NOT NULL,  -- Store encrypted card number
    card_expiration DATE NOT NULL,
    cvv VARBINARY(256) NOT NULL,          -- Store encrypted CVV
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE DeliveryOptions (
    delivery_option_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    description TEXT
);

CREATE TABLE RefundRequests (
    refund_request_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',  -- Status of the refund request
    notes TEXT,  -- Optional notes, e.g., reason for rejection or additional details
    
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE ReturnItems (
    return_item_id INT AUTO_INCREMENT PRIMARY KEY,
    refund_request_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,  -- Price paid at purchase, including any discounts
    reason TEXT,  -- Reason provided by customer for the return
    
    FOREIGN KEY (refund_request_id) REFERENCES RefundRequests(refund_request_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE SET NULL
);


CREATE TABLE ShoppingCart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,  -- Nullable to support guests
    session_id VARCHAR(255),  -- Unique session identifier for guest users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

CREATE TABLE ShoppingCartItems (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cart_id) REFERENCES ShoppingCart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
);







