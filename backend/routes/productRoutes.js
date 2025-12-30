const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/:productId/sellers', productController.getProductSellers);

// Protected routes for all users
router.post('/', auth, productController.createProduct);

// Seller-specific routes
router.get('/seller/my-products', auth, productController.getSellerProducts);
router.post('/seller/new', auth, productController.createMasterProduct);
router.post('/seller/add-existing', auth, productController.addExistingProduct);
router.put('/seller/:sellerProductId', auth, productController.updateSellerProduct);
router.delete('/seller/:sellerProductId', auth, productController.deleteSellerProduct);

module.exports = router;