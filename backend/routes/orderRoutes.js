const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const allorderController = require('../controllers/allOrderController');
const auth = require('../middleware/auth');

router.use(auth);

// Buyer routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
// Add this route
router.post('/direct', auth, orderController.createDirectOrder);

// Seller routes
router.get('/seller/orders', orderController.getSellerOrders);
router.put('/shipment/:shipmentId', orderController.updateShipment);
router.get('/all/orders', allorderController.getAllOrders);


module.exports = router;