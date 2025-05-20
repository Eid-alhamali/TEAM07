from locust import HttpUser, task, between
from random import choice, randint

class CompressoUser(HttpUser):
    # Wait between 1 and 5 seconds between tasks
    wait_time = between(1, 5)
    
    def on_start(self):
        """Initialize user data on start"""
        # Login simulation
        self.client.post("/api/auth/login", json={
            "email": f"user{randint(1,1000)}@example.com",
            "password": "testpassword123"
        })
        
        # Store some product IDs for later use
        self.product_ids = list(range(1, 21))  # Assuming 20 products
        self.cart_items = []

    @task(40)
    def browse_products(self):
        """Browse products page - highest frequency task"""
        self.client.get("/api/products")
        
        # Sometimes view product details
        if randint(1, 3) == 1:
            product_id = choice(self.product_ids)
            self.client.get(f"/api/products/{product_id}")

    @task(20)
    def search_products(self):
        """Search for products - medium frequency task"""
        search_terms = ["coffee", "arabica", "espresso", "dark roast", "light"]
        self.client.get(f"/api/products/search?q={choice(search_terms)}")

    @task(15)
    def manage_cart(self):
        """Cart operations - medium frequency task"""
        if len(self.cart_items) < 3 and randint(1, 2) == 1:
            # Add to cart
            product_id = choice(self.product_ids)
            self.client.post("/api/cart", json={
                "productId": product_id,
                "quantity": randint(1, 3)
            })
            self.cart_items.append(product_id)
        elif self.cart_items:
            # View or update cart
            if randint(1, 2) == 1:
                self.client.get("/api/cart")
            else:
                product_id = choice(self.cart_items)
                self.client.put(f"/api/cart/{product_id}", json={
                    "quantity": randint(1, 5)
                })

    @task(10)
    def checkout_flow(self):
        """Checkout process - lower frequency task"""
        if self.cart_items:
            # View cart before checkout
            self.client.get("/api/cart")
            
            # Proceed to checkout
            self.client.post("/api/orders", json={
                "shippingAddress": {
                    "street": "123 Test St",
                    "city": "Test City",
                    "zipCode": "12345"
                },
                "paymentMethod": "credit_card"
            })
            self.cart_items = []  # Clear cart after checkout

    @task(5)
    def view_order_history(self):
        """View order history - lowest frequency task"""
        self.client.get("/api/orders/history") 