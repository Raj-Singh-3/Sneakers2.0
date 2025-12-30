const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    sellerProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellerProduct',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// One review per user per seller product
reviewSchema.index({ sellerProductId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);