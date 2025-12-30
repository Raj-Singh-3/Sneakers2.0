const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    sellerProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerProduct',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for better performance
cartSchema.index({ userId: 1 });

module.exports = mongoose.model('Cart', cartSchema);