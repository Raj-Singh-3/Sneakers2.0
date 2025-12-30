const Order = require('../models/Order');
const Cart = require('../models/Cart');
const SellerProduct = require('../models/SellerProduct');
const Shipment = require('../models/Shipment');
const SellerProfile = require('../models/SellerProfile');



// Create direct order (Buy Now functionality)
exports.createDirectOrder = async (req, res) => {
    try {
        const { sellerProductId, quantity, shippingAddress, paymentMethod } = req.body;

        // Validate inputs
        if (!sellerProductId || !quantity || !shippingAddress) {
            return res.status(400).json({ 
                error: 'Missing required fields: sellerProductId, quantity, shippingAddress' 
            });
        }

        // Get seller product details
        const sellerProduct = await SellerProduct.findById(sellerProductId)
            .populate('productId')
            .populate('sellerId');

        if (!sellerProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (!sellerProduct.isActive) {
            return res.status(400).json({ error: 'Product is not available' });
        }

        if (sellerProduct.stock < quantity) {
            return res.status(400).json({ 
                error: `Only ${sellerProduct.stock} items available in stock` 
            });
        }

        // Calculate total
        const totalAmount = sellerProduct.price * quantity;

        // Generate order ID
        const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Create order item
        const orderItem = {
            sellerProductId: sellerProduct._id,
            productName: sellerProduct.productId.name,
            sellerShopName: sellerProduct.sellerId.shopName,
            quantity: quantity,
            price: sellerProduct.price,
            total: totalAmount
        };

        // Create order
        const order = new Order({
            orderId,
            userId: req.user._id,
            items: [orderItem],
            shippingAddress,
            totalAmount,
            paymentMethod: paymentMethod || 'cod',
            status: 'confirmed' // Direct to confirmed for Buy Now
        });

        await order.save();

        // Update stock
        sellerProduct.stock -= quantity;
        await sellerProduct.save();

        // Create shipment
        const shipment = new Shipment({
            orderId: order._id,
            sellerId: sellerProduct.sellerId._id,
            orderItemId: order.items[0]._id,
            trackingNumber: `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`,
            status: 'processing',
            currentLocation: 'Warehouse'
        });

        await shipment.save();

        res.status(201).json({
            message: 'Order placed successfully!',
            order: order,
            shipment: shipment
        });
    } catch (error) {
        console.error('Error creating direct order:', error);
        res.status(500).json({ error: 'Failed to place order' });
    }
};

// ... keep other existing functions ...
// Create order from cart
exports.createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate({
                path: 'items.sellerProductId',
                populate: [
                    { path: 'productId' },
                    { path: 'sellerId' }
                ]
            });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Check stock and prepare order items
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const sellerProduct = item.sellerProductId;
            
            if (sellerProduct.stock < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for ${sellerProduct.productId.name}` 
                });
            }

            const itemTotal = sellerProduct.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                sellerProductId: sellerProduct._id,
                productName: sellerProduct.productId.name,
                sellerShopName: sellerProduct.sellerId.shopName,
                quantity: item.quantity,
                price: sellerProduct.price,
                total: itemTotal
            });

            // Update stock
            sellerProduct.stock -= item.quantity;
            await sellerProduct.save();
        }

        // Generate order ID
        const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Create order
        const order = new Order({
            orderId,
            userId: req.user._id,
            items: orderItems,
            shippingAddress,
            totalAmount,
            paymentMethod
        });

        await order.save();

        // Create shipments for each seller
        for (const item of order.items) {
            const sellerProduct = await SellerProduct.findById(item.sellerProductId)
                .populate('sellerId');
            
            const shipment = new Shipment({
                orderId: order._id,
                sellerId: sellerProduct.sellerId._id,
                orderItemId: item._id,
                trackingNumber: `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`
            });

            await shipment.save();
        }

        // Clear cart
        cart.items = [];
        cart.updatedAt = Date.now();
        await cart.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.sellerProductId',
                populate: [
                    { path: 'productId' },
                    { path: 'sellerId', select: 'shopName' }
                ]
            });

        // Get shipments for each order
        const ordersWithShipments = await Promise.all(
            orders.map(async (order) => {
                const shipments = await Shipment.find({ orderId: order._id });
                return {
                    ...order.toObject(),
                    shipments
                };
            })
        );

        res.json(ordersWithShipments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id,
            userId: req.user._id 
        }).populate({
            path: 'items.sellerProductId',
            populate: [
                { path: 'productId' },
                { path: 'sellerId', select: 'shopName rating' }
            ]
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const shipments = await Shipment.find({ orderId: order._id });
        
        res.json({
            ...order.toObject(),
            shipments
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get seller's orders
exports.getSellerOrders = async (req, res) => {
    try {
        const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
        if (!sellerProfile) {
            return res.status(400).json({ error: 'Seller profile not found' });
        }

        // Get shipments for this seller
        const shipments = await Shipment.find({ sellerId: sellerProfile._id })
            .populate({
                path: 'orderId',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });

        res.json(shipments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update shipment (for sellers)
exports.updateShipment = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        const { status, currentLocation, description } = req.body;

        const shipment = await Shipment.findById(shipmentId)
            .populate('sellerId');

        if (!shipment) {
            return res.status(404).json({ error: 'Shipment not found' });
        }

        // Check if user is the seller
        const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
        if (sellerProfile._id.toString() !== shipment.sellerId._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (status) shipment.status = status;
        if (currentLocation) shipment.currentLocation = currentLocation;

        // Add update history
        shipment.updates.push({
            location: currentLocation || shipment.currentLocation,
            status: status || shipment.status,
            description
        });

        // Update expected delivery if shipped
        if (status === 'shipped') {
            shipment.expectedDelivery = new Date(+new Date() + 7 * 24 * 60 * 60 * 1000);
        }

        await shipment.save();

        res.json(shipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};