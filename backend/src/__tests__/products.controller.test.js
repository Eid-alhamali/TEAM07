const ProductsController = require('../controllers/product.controller');
const mysql = require('mysql2');
const config = require('../config/app.config');

// Mock MySQL connection
jest.mock('mysql2');
const mockConnection = {
    query: jest.fn(),
    end: jest.fn(),
};
mysql.createConnection.mockReturnValue(mockConnection);

let productsController;

beforeAll(() => {
    productsController = new ProductsController();
    productsController.con = mockConnection;
});

afterAll(() => {
    productsController.con.end();
});

describe('ProductsController', () => {
    const productId = 1; // Example product ID
    const variantId = 1; // Example variant ID
    const sampleProduct = { name: "Sample Product", price: 100 };
    const sampleVariants = [{ variant_id: 1, weight_grams: 500, price: 50 }];

    test('getAll should retrieve all products in the database', async () => {
        const expectedProducts = [{ product_id: 1, name: "Sample Product", price: 100 }];
        mockConnection.query.mockImplementationOnce((sql, callback) => callback(null, expectedProducts));

        const products = await productsController.getAll();
        expect(products).toEqual(expectedProducts);
    });

    test('getAllWithVariants should retrieve all products with their variants', async () => {
        const expectedProductsWithVariants = [
            { product_id: 1, name: "Sample Product", price: 100, variants: sampleVariants }
        ];
        mockConnection.query.mockImplementationOnce((sql, callback) => callback(null, expectedProductsWithVariants));

        const productsWithVariants = await productsController.getAllWithVariants();
        expect(productsWithVariants).toEqual(expectedProductsWithVariants);
    });

    test('getProductById should retrieve a specific product by ID', async () => {
        const expectedProduct = { product_id: productId, name: "Sample Product", price: 100 };
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [expectedProduct]));

        const product = await productsController.getProductById(productId);
        expect(product).toEqual(expectedProduct);
    });

    test('getProductsByIdList should retrieve products by a list of IDs', async () => {
        const idList = [1, 2];
        const expectedProducts = [
            { product_id: 1, name: "Sample Product", price: 100 },
            { product_id: 2, name: "Another Product", price: 150 }
        ];
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, expectedProducts));

        const products = await productsController.getProductsByIdList(idList);
        expect(products).toEqual(expectedProducts);
    });

    test('checkStock should check the stock level of a specific product variant', async () => {
        const expectedStockInfo = { stock: 10 };
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, [expectedStockInfo]));

        const stockInfo = await productsController.checkStock(productId, variantId);
        expect(stockInfo).toEqual(expectedStockInfo);
    });

    test('updateProductDetails should update product and variant details', async () => {
        mockConnection.query.mockImplementation((sql, params, callback) => callback(null, { affectedRows: 1 }));

        const response = await productsController.updateProductDetails(sampleProduct, sampleVariants, productId);
        expect(response).toBe('Product and variants updated successfully!');
    });

    test('updateProduct should update basic product information', async () => {
        mockConnection.query.mockImplementation((sql, params, callback) => callback(null, { affectedRows: 1 }));

        const response = await productsController.updateProduct(sampleProduct, productId);
        expect(response).toBeUndefined();
    });

    test('updateVariant should update variant information for a specific product', async () => {
        mockConnection.query.mockImplementation((sql, params, callback) => callback(null, { affectedRows: 1 }));

        const response = await productsController.updateVariant(sampleVariants[0], productId);
        expect(response).toBeUndefined();
    });

    test('getPaginatedProducts should retrieve a paginated list of products', async () => {
        const expectedPaginatedProducts = [
            { product_id: 1, name: "Sample Product", price: 100 }
        ];
        mockConnection.query.mockImplementationOnce((sql, params, callback) => callback(null, expectedPaginatedProducts));

        const page = 0;
        const paginatedProducts = await productsController.getPaginatedProducts(page);
        expect(paginatedProducts).toEqual(expectedPaginatedProducts);
    });

    test('getOutOfStockProducts should retrieve products that are out of stock', async () => {
        const expectedOutOfStockProducts = [
            { product_id: 2, name: "Out of Stock Product", price: 150 }
        ];
        mockConnection.query.mockImplementationOnce((sql, callback) => callback(null, expectedOutOfStockProducts));

        const outOfStockProducts = await productsController.getOutOfStockProducts();
        expect(outOfStockProducts).toEqual(expectedOutOfStockProducts);
    });
});
