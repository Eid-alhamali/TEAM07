const productController = require('../controllers/productController');
const db = require('../config/db');

jest.mock('../config/db', () => ({
    query: jest.fn()
}));

describe('productController', () => {
    let req, res;

    beforeEach(() => {
        req = { query: {} };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('listProducts', () => {
        test('should return 400 if invalid sort_by parameter is given', () => {
            req.query = { sort_by: 'invalid', sort_order: 'asc' };
            productController.listProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid sort_by parameter.' });
        });

        test('should return 400 if invalid sort_order parameter is given', () => {
            req.query = { sort_by: 'price', sort_order: 'invalid' };
            productController.listProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid sort_order parameter.' });
        });

        test('should return products array on success', () => {
            req.query = { sort_by: 'price', sort_order: 'asc', roast_level: 'Medium' };
            const mockResults = [
                { product_id: 1, name: 'Medium Roast Coffee', price: 10.0 }
            ];

            db.query.mockImplementation((sql, params, callback) => {
                expect(params).toContain('Medium');
                callback(null, mockResults);
            });

            productController.listProducts(req, res);
            expect(res.json).toHaveBeenCalledWith(mockResults);
        });

        test('should return empty array if no products found', () => {
            req.query = { sort_by: 'price', sort_order: 'asc' };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, []); 
            });
            productController.listProducts(req, res);
            expect(res.json).toHaveBeenCalledWith([]);
        });

        test('should return 500 if database error occurs', () => {
            req.query = { sort_by: 'price', sort_order: 'asc' };
            db.query.mockImplementation((sql, params, callback) => {
                callback(new Error('DB Error'), null);
            });
            productController.listProducts(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to retrieve products.' });
        });
    });

    describe('getProductById', () => {
        test('should return a product if found', () => {
            req.params = { id: 1 };
            const mockProduct = { product_id: 1, name: 'Espresso Beans' };

            db.query.mockImplementation((sql, params, callback) => {
                expect(params).toEqual([1]);
                callback(null, [mockProduct]);
            });

            productController.getProductById(req, res);
            expect(res.json).toHaveBeenCalledWith(mockProduct);
        });

        test('should return 404 if product not found', () => {
            req.params = { id: 999 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, []);
            });

            productController.getProductById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        test('should return 500 if database error occurs', () => {
            req.params = { id: 1 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(new Error('DB Error'), null);
            });

            productController.getProductById(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('createProduct', () => {
        test('should create a product and return 201 with productId', () => {
            req.body = { name: 'New Coffee', roast_level: 'Medium', bean_type: 'Arabica' };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, { insertId: 123 });
            });

            productController.createProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product created', productId: 123 });
        });

        test('should return 500 if database error occurs during create', () => {
            req.body = { name: 'Error Coffee' };
            db.query.mockImplementation((sql, params, callback) => {
                callback(new Error('DB Error'), null);
            });

            productController.createProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('updateProduct', () => {
        test('should update product and return 200 if found', () => {
            req.params = { id: 1 };
            req.body = { name: 'Updated Coffee' };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, { affectedRows: 1 });
            });

            productController.updateProduct(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product updated' });
        });

        test('should return 404 if product not found', () => {
            req.params = { id: 999 };
            req.body = { name: 'Non-existent Coffee' };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, { affectedRows: 0 });
            });

            productController.updateProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        test('should return 500 if database error occurs during update', () => {
            req.params = { id: 1 };
            req.body = { name: 'Error Coffee' };
            db.query.mockImplementation((sql, params, callback) => {
                callback(new Error('DB Error'), null);
            });

            productController.updateProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('deleteProduct', () => {
        test('should delete product and return 200 if found', () => {
            req.params = { id: 1 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, { affectedRows: 1 });
            });

            productController.deleteProduct(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Product deleted' });
        });

        test('should return 404 if product not found', () => {
            req.params = { id: 999 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, { affectedRows: 0 });
            });

            productController.deleteProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        test('should return 500 if database error occurs during delete', () => {
            req.params = { id: 1 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(new Error('DB Error'), null);
            });

            productController.deleteProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('allVariantsOfProductId', () => {
        test('should return variants if found', () => {
            req.params = { product_id: 1 };
            const mockVariants = [
                { variant_id: 1, product_id: 1, price: 10.0 },
                { variant_id: 2, product_id: 1, price: 15.0 }
            ];
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, mockVariants);
            });

            productController.allVariantsOfProductId(req, res);
            expect(res.json).toHaveBeenCalledWith({ product_id: 1, variants: mockVariants });
        });

        test('should return 404 if no variants found', () => {
            req.params = { product_id: 999 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, []);
            });

            productController.allVariantsOfProductId(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'No variants found for the specified product.' });
        });

        test('should return 500 if database error occurs', () => {
            req.params = { product_id: 1 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(new Error('DB Error'), null);
            });

            productController.allVariantsOfProductId(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to retrieve variants. Please try again later.',
                details: 'DB Error'
            });
        });
    });

    describe('getProductDetails', () => {
        test('should return product details if found', () => {
            req.params = { product_id: 1 };
            const mockProduct = { product_id: 1, name: 'Special Blend', average_rating: 4.5 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, [mockProduct]);
            });

            productController.getProductDetails(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockProduct);
        });

        test('should return 404 if product not found', () => {
            req.params = { product_id: 999 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(null, []);
            });

            productController.getProductDetails(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        test('should return 500 if database error occurs', () => {
            req.params = { product_id: 1 };
            db.query.mockImplementation((sql, params, callback) => {
                callback(new Error('DB Error'), null);
            });

            productController.getProductDetails(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('getProductByVariantId', () => {

        test('should return 404 if product not found', () => {
            req.params = { variant_id: 999 };
            db.query.mockImplementationOnce((sql, params, callback) => {
                callback(null, []);
            });

            productController.getProductByVariantId(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
        });

        test('should return 500 if database error occurs while getting product', () => {
            req.params = { variant_id: 10 };
            db.query.mockImplementationOnce((sql, params, callback) => {
                callback(new Error('DB Error'), null);
            });

            productController.getProductByVariantId(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });

        test('should return 500 if database error occurs while getting images', () => {
            req.params = { variant_id: 10 };
            const mockProduct = { product_id: 5, name: 'Latte', variant_id: 10 };

            db.query
                .mockImplementationOnce((sql, params, callback) => {
                    callback(null, [mockProduct]);
                })
                .mockImplementationOnce((sql, params, callback) => {
                    callback(new Error('DB Error'), null);
                });

            productController.getProductByVariantId(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
});
