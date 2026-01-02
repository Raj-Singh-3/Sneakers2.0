// const Order = require('../models/Order');
// const Cart = require('../models/Cart');
// const SellerProduct = require('../models/SellerProduct');
// const Shipment = require('../models/Shipment');
// const SellerProfile = require('../models/SellerProfile');



// // Create direct order (Buy Now functionality)
// exports.createDirectOrder = async (req, res) => {
//     try {
//         const { sellerProductId, quantity, shippingAddress, paymentMethod } = req.body;

//         // Validate inputs
//         if (!sellerProductId || !quantity || !shippingAddress) {
//             return res.status(400).json({ 
//                 error: 'Missing required fields: sellerProductId, quantity, shippingAddress' 
//             });
//         }

//         // Get seller product details
//         const sellerProduct = await SellerProduct.findById(sellerProductId)
//             .populate('productId')
//             .populate('sellerId');

//         if (!sellerProduct) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         if (!sellerProduct.isActive) {
//             return res.status(400).json({ error: 'Product is not available' });
//         }

//         if (sellerProduct.stock < quantity) {
//             return res.status(400).json({ 
//                 error: `Only ${sellerProduct.stock} items available in stock` 
//             });
//         }

//         // Calculate total
//         const totalAmount = sellerProduct.price * quantity;

//         // Generate order ID
//         const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

//         // Create order item
//         const orderItem = {
//             sellerProductId: sellerProduct._id,
//             productName: sellerProduct.productId.name,
//             sellerShopName: sellerProduct.sellerId.shopName,
//             quantity: quantity,
//             price: sellerProduct.price,
//             total: totalAmount
//         };

//         // Create order
//         const order = new Order({
//             orderId,
//             userId: req.user._id,
//             items: [orderItem],
//             shippingAddress,
//             totalAmount,
//             paymentMethod: paymentMethod || 'cod',
//             status: 'confirmed' // Direct to confirmed for Buy Now
//         });

//         await order.save();

//         // Update stock
//         sellerProduct.stock -= quantity;
//         await sellerProduct.save();

//         // Create shipment
//         const shipment = new Shipment({
//             orderId: order._id,
//             sellerId: sellerProduct.sellerId._id,
//             orderItemId: order.items[0]._id,
//             trackingNumber: `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`,
//             status: 'processing',
//             currentLocation: 'Warehouse'
//         });

//         await shipment.save();

//         res.status(201).json({
//             message: 'Order placed successfully!',
//             order: order,
//             shipment: shipment
//         });
//     } catch (error) {
//         console.error('Error creating direct order:', error);
//         res.status(500).json({ error: 'Failed to place order' });
//     }
// };

// // ... keep other existing functions ...
// // Create order from cart
// // exports.createOrder = async (req, res) => {
// //     try {
// //         const { shippingAddress, paymentMethod } = req.body;

// //         // Get user's cart
// //         const cart = await Cart.findOne({ userId: req.user._id })
// //             .populate({
// //                 path: 'items.sellerProductId',
// //                 populate: [
// //                     { path: 'productId' },
// //                     { path: 'sellerId' }
// //                 ]
// //             });

// //         if (!cart || cart.items.length === 0) {
// //             return res.status(400).json({ error: 'Cart is empty' });
// //         }

// //         // Check stock and prepare order items
// //         let totalAmount = 0;
// //         const orderItems = [];

// //         for (const item of cart.items) {
// //             const sellerProduct = item.sellerProductId;
            
// //             if (sellerProduct.stock < item.quantity) {
// //                 return res.status(400).json({ 
// //                     error: `Insufficient stock for ${sellerProduct.productId.name}` 
// //                 });
// //             }

// //             const itemTotal = sellerProduct.price * item.quantity;
// //             totalAmount += itemTotal;

// //             orderItems.push({
// //                 sellerProductId: sellerProduct._id,
// //                 productName: sellerProduct.productId.name,
// //                 sellerShopName: sellerProduct.sellerId.shopName,
// //                 quantity: item.quantity,
// //                 price: sellerProduct.price,
// //                 total: itemTotal
// //             });

// //             // Update stock
// //             sellerProduct.stock -= item.quantity;
// //             await sellerProduct.save();
// //         }

// //         // Generate order ID
// //         const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

// //         // Create order
// //         const order = new Order({
// //             orderId,
// //             userId: req.user._id,
// //             items: orderItems,
// //             shippingAddress,
// //             totalAmount,
// //             paymentMethod
// //         });

// //         await order.save();

// //         // Create shipments for each seller
// //         for (const item of order.items) {
// //             const sellerProduct = await SellerProduct.findById(item.sellerProductId)
// //                 .populate('sellerId');
            
// //             const shipment = new Shipment({
// //                 orderId: order._id,
// //                 sellerId: sellerProduct.sellerId._id,
// //                 orderItemId: item._id,
// //                 trackingNumber: `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`
// //             });

// //             await shipment.save();
// //         }

// //         // Clear cart
// //         cart.items = [];
// //         cart.updatedAt = Date.now();
// //         await cart.save();

// //         res.status(201).json(order);
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // };

// // // Get user's orders
// // exports.getUserOrders = async (req, res) => {
// //     try {
// //         const orders = await Order.find({ userId: req.user._id })
// //             .sort({ createdAt: -1 })
// //             .populate({
// //                 path: 'items.sellerProductId',
// //                 populate: [
// //                     { path: 'productId' },
// //                     { path: 'sellerId', select: 'shopName' }
// //                 ]
// //             });

// //         // Get shipments for each order
// //         const ordersWithShipments = await Promise.all(
// //             orders.map(async (order) => {
// //                 const shipments = await Shipment.find({ orderId: order._id });
// //                 return {
// //                     ...order.toObject(),
// //                     shipments
// //                 };
// //             })
// //         );

// //         res.json(ordersWithShipments);
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // };

// // // Get order by ID
// // exports.getOrderById = async (req, res) => {
// //     try {
// //         const order = await Order.findOne({ 
// //             _id: req.params.id,
// //             userId: req.user._id 
// //         }).populate({
// //             path: 'items.sellerProductId',
// //             populate: [
// //                 { path: 'productId' },
// //                 { path: 'sellerId', select: 'shopName rating' }
// //             ]
// //         });

// //         if (!order) {
// //             return res.status(404).json({ error: 'Order not found' });
// //         }

// //         const shipments = await Shipment.find({ orderId: order._id });
        
// //         res.json({
// //             ...order.toObject(),
// //             shipments
// //         });
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // };

// // // Get seller's orders
// // exports.getSellerOrders = async (req, res) => {
// //     try {
// //         const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
// //         if (!sellerProfile) {
// //             return res.status(400).json({ error: 'Seller profile not found' });
// //         }

// //         // Get shipments for this seller
// //         const shipments = await Shipment.find({ sellerId: sellerProfile._id })
// //             .populate({
// //                 path: 'orderId',
// //                 populate: {
// //                     path: 'userId',
// //                     select: 'name email'
// //                 }
// //             })
// //             .sort({ createdAt: -1 });

// //         res.json(shipments);
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // };

// // // Update shipment (for sellers)
// // exports.updateShipment = async (req, res) => {
// //     try {
// //         const { shipmentId } = req.params;
// //         const { status, currentLocation, description } = req.body;

// //         const shipment = await Shipment.findById(shipmentId)
// //             .populate('sellerId');

// //         if (!shipment) {
// //             return res.status(404).json({ error: 'Shipment not found' });
// //         }

// //         // Check if user is the seller
// //         const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
// //         if (sellerProfile._id.toString() !== shipment.sellerId._id.toString()) {
// //             return res.status(403).json({ error: 'Not authorized' });
// //         }

// //         if (status) shipment.status = status;
// //         if (currentLocation) shipment.currentLocation = currentLocation;

// //         // Add update history
// //         shipment.updates.push({
// //             location: currentLocation || shipment.currentLocation,
// //             status: status || shipment.status,
// //             description
// //         });

// //         // Update expected delivery if shipped
// //         if (status === 'shipped') {
// //             shipment.expectedDelivery = new Date(+new Date() + 7 * 24 * 60 * 60 * 1000);
// //         }

// //         await shipment.save();

// //         res.json(shipment);
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // };


// // Create order from cart
// exports.createOrder = async (req, res) => {
//     try {
//         console.log('Creating order for user:', req.user._id);
//         const { shippingAddress, paymentMethod } = req.body;

//         // Get user's cart
//         const cart = await Cart.findOne({ userId: req.user._id })
//             .populate({
//                 path: 'items.sellerProductId',
//                 populate: [
//                     { path: 'productId' },
//                     { path: 'sellerId' }
//                 ]
//             });

//         if (!cart || cart.items.length === 0) {
//             console.log('Cart is empty or not found');
//             return res.status(400).json({ error: 'Cart is empty' });
//         }

//         console.log('Cart found with items:', cart.items.length);

//         // Check stock and prepare order items
//         let totalAmount = 0;
//         const orderItems = [];

//         for (const item of cart.items) {
//             const sellerProduct = item.sellerProductId;
            
//             if (!sellerProduct) {
//                 console.log('Seller product not found for item:', item._id);
//                 return res.status(400).json({ 
//                     error: `Product not available` 
//                 });
//             }

//             console.log('Checking stock for product:', sellerProduct.productId?.name);
//             console.log('Required:', item.quantity, 'Available:', sellerProduct.stock);

//             if (sellerProduct.stock < item.quantity) {
//                 return res.status(400).json({ 
//                     error: `Insufficient stock for ${sellerProduct.productId?.name}` 
//                 });
//             }

//             const itemTotal = sellerProduct.price * item.quantity;
//             totalAmount += itemTotal;

//             orderItems.push({
//                 sellerProductId: sellerProduct._id,
//                 productName: sellerProduct.productId?.name || 'Unknown Product',
//                 sellerShopName: sellerProduct.sellerId?.shopName || 'Unknown Seller',
//                 sellerId: sellerProduct.sellerId?._id,
//                 quantity: item.quantity,
//                 price: sellerProduct.price,
//                 total: itemTotal
//             });

//             // Update stock
//             sellerProduct.stock -= item.quantity;
//             await sellerProduct.save();
//             console.log('Updated stock for product:', sellerProduct.productId?.name);
//         }

//         // Generate order ID
//         const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

//         // Create order
//         const order = new Order({
//             orderId,
//             userId: req.user._id,
//             items: orderItems,
//             shippingAddress,
//             totalAmount,
//             paymentMethod: paymentMethod || 'cod'
//         });

//         await order.save();
//         console.log('Order created:', order._id, 'Order ID:', order.orderId);

//         // Create shipments for each seller
//         console.log('Creating shipments...');
//         for (const item of order.items) {
//             if (!item.sellerId) {
//                 console.log('No sellerId found for item:', item);
//                 continue;
//             }

//             const shipment = new Shipment({
//                 orderId: order._id,
//                 sellerId: item.sellerId,
//                 orderItemId: item._id,
//                 trackingNumber: `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`,
//                 currentLocation: 'Warehouse',
//                 status: 'processing'
//             });

//             await shipment.save();
//             console.log('Shipment created for seller:', item.sellerId);
//         }

//         // Clear cart
//         cart.items = [];
//         cart.updatedAt = Date.now();
//         await cart.save();
//         console.log('Cart cleared');

//         // Populate order for response
//         const populatedOrder = await Order.findById(order._id)
//             .populate({
//                 path: 'items.sellerProductId',
//                 populate: [
//                     { path: 'productId' },
//                     { path: 'sellerId', select: 'shopName' }
//                 ]
//             });

//         res.status(201).json({
//             message: 'Order placed successfully!',
//             order: populatedOrder,
//             orderId: order.orderId
//         });

//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// /// Get seller's orders (FIXED VERSION)
// exports.getSellerOrders = async (req, res) => {
//     try {
//         console.log('Fetching orders for seller user:', req.user._id);
        
//         const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
//         if (!sellerProfile) {
//             console.log('Seller profile not found for user:', req.user._id);
//             return res.status(400).json({ error: 'Seller profile not found' });
//         }

//         console.log('Seller profile found:', sellerProfile._id);

//         // Find shipments for this seller
//         const shipments = await Shipment.find({ sellerId: sellerProfile._id })
//             .populate({
//                 path: 'orderId',
//                 populate: [
//                     {
//                         path: 'userId',
//                         select: 'name email'
//                     },
//                     {
//                         path: 'items.sellerProductId',
//                         populate: [
//                             { path: 'productId', select: 'name images' },
//                             { path: 'sellerId', select: 'shopName' }
//                         ]
//                     }
//                 ]
//             })
//             .sort({ createdAt: -1 });

//         console.log('Found shipments:', shipments.length);

//         // Format response
//         const orders = shipments.map(shipment => {
//             const order = shipment.orderId;
//             if (!order) return null;

//             // Find the specific item in this shipment
//             const orderItem = order.items.find(item => 
//                 item._id.toString() === shipment.orderItemId.toString()
//             );

//             return {
//                 _id: shipment._id,
//                 orderId: order.orderId,
//                 order: order,
//                 shipment: shipment,
//                 item: orderItem,
//                 customer: order.userId,
//                 createdAt: order.createdAt,
//                 status: order.status,
//                 paymentStatus: order.paymentStatus
//             };
//         }).filter(item => item !== null);

//         console.log('Processed orders:', orders.length);
//         res.json(orders);
//     } catch (error) {
//         console.error('Error fetching seller orders:', error);
//         res.status(500).json({ error: error.message });
//     }
// };




const Order = require('../models/Order');
const Cart = require('../models/Cart');
const SellerProduct = require('../models/SellerProduct');
const Shipment = require('../models/Shipment');
const SellerProfile = require('../models/SellerProfile');

// Create order from cart
exports.createOrder = async (req, res) => {
    try {
        console.log('Creating order for user:', req.user._id);
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
            console.log('Cart is empty or not found');
            return res.status(400).json({ error: 'Cart is empty' });
        }

        console.log('Cart found with items:', cart.items.length);

        // Check stock and prepare order items
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const sellerProduct = item.sellerProductId;
            
            if (!sellerProduct) {
                console.log('Seller product not found for item:', item._id);
                return res.status(400).json({ 
                    error: `Product not available` 
                });
            }

            console.log('Checking stock for product:', sellerProduct.productId?.name);
            console.log('Required:', item.quantity, 'Available:', sellerProduct.stock);

            if (sellerProduct.stock < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for ${sellerProduct.productId?.name}` 
                });
            }

            const itemTotal = sellerProduct.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                sellerProductId: sellerProduct._id,
                productName: sellerProduct.productId?.name || 'Unknown Product',
                sellerShopName: sellerProduct.sellerId?.shopName || 'Unknown Seller',
                sellerId: sellerProduct.sellerId?._id,
                quantity: item.quantity,
                price: sellerProduct.price,
                total: itemTotal
            });

            // Update stock
            sellerProduct.stock -= item.quantity;
            await sellerProduct.save();
            console.log('Updated stock for product:', sellerProduct.productId?.name);
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
            paymentMethod: paymentMethod || 'cod'
        });

        await order.save();
        console.log('Order created:', order._id, 'Order ID:', order.orderId);

        // Create shipments for each seller
        console.log('Creating shipments...');
        for (const item of order.items) {
            if (!item.sellerId) {
                console.log('No sellerId found for item:', item);
                continue;
            }

            const shipment = new Shipment({
                orderId: order._id,
                sellerId: item.sellerId,
                orderItemId: item._id,
                trackingNumber: `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`,
                currentLocation: 'Warehouse',
                status: 'processing'
            });

            await shipment.save();
            console.log('Shipment created for seller:', item.sellerId);
        }

        // Clear cart
        cart.items = [];
        cart.updatedAt = Date.now();
        await cart.save();
        console.log('Cart cleared');

        // Populate order for response
        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'items.sellerProductId',
                populate: [
                    { path: 'productId' },
                    { path: 'sellerId', select: 'shopName' }
                ]
            });

        res.status(201).json({
            message: 'Order placed successfully!',
            order: populatedOrder,
            orderId: order.orderId
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
    try {
        console.log('Fetching orders for user:', req.user._id);
        
        const orders = await Order.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'items.sellerProductId',
                populate: [
                    { path: 'productId' },
                    { path: 'sellerId', select: 'shopName' }
                ]
            });

        console.log('Found orders:', orders.length);

        // Get shipments for each order
        const ordersWithShipments = await Promise.all(
            orders.map(async (order) => {
                const shipments = await Shipment.find({ orderId: order._id })
                    .populate('sellerId', 'shopName');
                return {
                    ...order.toObject(),
                    shipments
                };
            })
        );

        res.json(ordersWithShipments);
    } catch (error) {
        console.error('Error fetching orders:', error);
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

// Get seller's orders (FIXED VERSION)
exports.getSellerOrders = async (req, res) => {
    try {
        console.log('Fetching orders for seller user:', req.user._id);
        
        const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
        if (!sellerProfile) {
            console.log('Seller profile not found for user:', req.user._id);
            return res.status(400).json({ error: 'Seller profile not found' });
        }

        console.log('Seller profile found:', sellerProfile._id);

        // Find shipments for this seller
        const shipments = await Shipment.find({ sellerId: sellerProfile._id })
            .populate({
                path: 'orderId',
                populate: [
                    {
                        path: 'userId',
                        select: 'name email'
                    },
                    {
                        path: 'items.sellerProductId',
                        populate: [
                            { path: 'productId', select: 'name images' },
                            { path: 'sellerId', select: 'shopName' }
                        ]
                    }
                ]
            })
            .sort({ createdAt: -1 });

        console.log('Found shipments:', shipments.length);

        // Format response
        const orders = shipments.map(shipment => {
            const order = shipment.orderId;
            if (!order) return null;

            // Find the specific item in this shipment
            const orderItem = order.items.find(item => 
                item._id.toString() === shipment.orderItemId.toString()
            );

            return {
                _id: shipment._id,
                orderId: order.orderId,
                order: order,
                shipment: shipment,
                item: orderItem,
                customer: order.userId,
                createdAt: order.createdAt,
                status: order.status,
                paymentStatus: order.paymentStatus
            };
        }).filter(item => item !== null);

        console.log('Processed orders:', orders.length);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching seller orders:', error);
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
        if (!sellerProfile) {
            return res.status(403).json({ error: 'Seller profile not found' });
        }
        
        if (sellerProfile._id.toString() !== shipment.sellerId._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (status) shipment.status = status;
        if (currentLocation) shipment.currentLocation = currentLocation;

        // Add update history
        shipment.updates.push({
            location: currentLocation || shipment.currentLocation,
            status: status || shipment.status,
            description,
            updatedAt: new Date()
        });

        // Update expected delivery if shipped
        if (status === 'shipped') {
            shipment.expectedDelivery = new Date(+new Date() + 7 * 24 * 60 * 60 * 1000);
        }

        await shipment.save();

        res.json(shipment);
    } catch (error) {
        console.error('Error updating shipment:', error);
        res.status(500).json({ error: error.message });
    }
};

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
            sellerId: sellerProduct.sellerId._id,
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