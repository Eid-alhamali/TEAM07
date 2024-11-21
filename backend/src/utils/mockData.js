// mockData.js
module.exports = {
    generateMockUserId: () => Math.floor(Math.random() * 1000), // Random user ID for uniqueness
    generateMockVariantId: () => Math.floor(Math.random() * 100),
  
    generateMockCartItems: () => [
      {
        product_id: Math.floor(Math.random() * 100),
        name: "Product Name",
        price: 100,
        quantity: 2,
        subtotal: 200,
      },
    ],
  
    generateMockAddress: () => ({
      address_id: 1,
      address_line: "123 Main St",
      city: "Metropolis",
      state: "NY",
      postal_code: "10001",
      country: "USA",
    }),
  
    generateMockOrderItems: (orderId) => [
      {
        order_id: orderId,
        variant_id: Math.floor(Math.random() * 100),
        quantity: 2,
        price: 100,
      },
    ],
  };
  