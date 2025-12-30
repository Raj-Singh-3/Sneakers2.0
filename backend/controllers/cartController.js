const Cart = require('../models/Cart');
const SellerProduct = require('../models/SellerProduct');

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id })
            .populate({
                path: 'items.sellerProductId',
                populate: [
                    { 
                        path: 'productId',
                        select: 'name brand images category description'
                    },
                    { 
                        path: 'sellerId', 
                        select: 'shopName rating' 
                    }
                ]
            });

        if (!cart) {
            cart = new Cart({ 
                userId: req.user._id, 
                items: [] 
            });
            await cart.save();
        }

        res.json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

// Add item to cart (FIXED VERSION)
exports.addToCart = async (req, res) => {
    try {
        const { sellerProductId, quantity = 1 } = req.body;

        // Check if product exists and is in stock
        const sellerProduct = await SellerProduct.findById(sellerProductId)
            .populate('productId', 'name images')
            .populate('sellerId', 'shopName rating');
        
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

        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = new Cart({ 
                userId: req.user._id, 
                items: [] 
            });
        }

        // Check if item already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.sellerProductId.toString() === sellerProductId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            // Check stock again with new quantity
            if (sellerProduct.stock < newQuantity) {
                return res.status(400).json({ 
                    error: `Cannot add more items. Only ${sellerProduct.stock} available in stock` 
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({ 
                sellerProductId, 
                quantity 
            });
        }

        cart.updatedAt = Date.now();
        await cart.save();

        // Populate the cart items before sending response
        await cart.populate({
            path: 'items.sellerProductId',
            populate: [
                { 
                    path: 'productId',
                    select: 'name brand images category'
                },
                { 
                    path: 'sellerId', 
                    select: 'shopName rating' 
                }
            ]
        });

        res.json({
            message: 'Item added to cart successfully',
            cart: cart
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        // Get seller product to check stock
        const cartItem = cart.items[itemIndex];
        const sellerProduct = await SellerProduct.findById(cartItem.sellerProductId);
        
        if (!sellerProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (quantity <= 0) {
            // Remove item
            cart.items.splice(itemIndex, 1);
        } else {
            // Check stock
            if (sellerProduct.stock < quantity) {
                return res.status(400).json({ 
                    error: `Only ${sellerProduct.stock} items available in stock` 
                });
            }
            
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }

        cart.updatedAt = Date.now();
        await cart.save();

        await cart.populate({
            path: 'items.sellerProductId',
            populate: [
                { path: 'productId' },
                { path: 'sellerId', select: 'shopName rating' }
            ]
        });

        res.json(cart);
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            item => item._id.toString() !== itemId
        );

        cart.updatedAt = Date.now();
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error('Error removing item:', error);
        res.status(500).json({ error: 'Failed to remove item' });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        cart.items = [];
        cart.updatedAt = Date.now();
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};