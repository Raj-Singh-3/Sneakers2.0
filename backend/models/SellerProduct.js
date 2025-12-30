const mongoose = require('mongoose');

const sellerProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerProfile',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    condition: {
        type: String,
        enum: ['new', 'used', 'refurbished'],
        default: 'new'
    },
    description: String, // Seller's custom description
    images: [String], // Seller's custom images
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for fast lookup
sellerProductSchema.index({ productId: 1, sellerId: 1 }, { unique: true });

module.exports = mongoose.model('SellerProduct', sellerProductSchema);