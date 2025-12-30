const mongoose = require('mongoose');

const shipmentUpdateSchema = new mongoose.Schema({
    location: String,
    status: String,
    description: String,
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const shipmentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerProfile',
        required: true
    },
    orderItemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    expectedDelivery: {
        type: Date,
        default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    currentLocation: {
        type: String,
        default: 'Warehouse'
    },
    status: {
        type: String,
        enum: ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'],
        default: 'processing'
    },
    trackingNumber: String,
    updates: [shipmentUpdateSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Shipment', shipmentSchema);