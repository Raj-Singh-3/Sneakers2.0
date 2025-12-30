const Product = require('../models/Product');
const SellerProduct = require('../models/SellerProduct');
const SellerProfile = require('../models/SellerProfile');

// Get all master products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create master product (for sellers)
exports.createProduct = async (req, res) => {
    try {
        const { name, brand, category, description, specifications, images, tags } = req.body;

        const product = new Product({
            name,
            brand,
            category,
            description,
            specifications,
            images,
            tags
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all sellers for a specific product (PRICE COMPARISON)
exports.getProductSellers = async (req, res) => {
    try {
        const sellerProducts = await SellerProduct.find({ 
            productId: req.params.productId,
            isActive: true,
            stock: { $gt: 0 }
        })
        .populate('sellerId', 'shopName rating')
        .sort({ price: 1 });

        res.json(sellerProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add product as seller (either create new or use existing)
exports.addSellerProduct = async (req, res) => {
    try {
        const { productId, price, stock, condition, description, images } = req.body;
        
        // Get seller profile
        const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
        if (!sellerProfile) {
            return res.status(400).json({ error: 'Seller profile not found' });
        }

        // Check if seller already has this product
        let sellerProduct = await SellerProduct.findOne({
            productId,
            sellerId: sellerProfile._id
        });

        if (sellerProduct) {
            // Update existing
            sellerProduct.price = price;
            sellerProduct.stock = stock;
            sellerProduct.condition = condition;
            sellerProduct.description = description;
            sellerProduct.images = images || sellerProduct.images;
        } else {
            // Create new
            sellerProduct = new SellerProduct({
                productId,
                sellerId: sellerProfile._id,
                price,
                stock,
                condition,
                description,
                images
            });
        }

        await sellerProduct.save();
        
        // Populate product details
        await sellerProduct.populate('productId');
        await sellerProduct.populate('sellerId', 'shopName');

        res.status(201).json(sellerProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Search products
exports.searchProducts = async (req, res) => {
    try {
        const { q, brand, category, minPrice, maxPrice } = req.query;
        
        let query = {};
        
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ];
        }
        
        if (brand) query.brand = brand;
        if (category) query.category = category;

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get seller's products (products they are selling)
exports.getSellerProducts = async (req, res) => {
    try {
        // Get seller profile
        const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
        if (!sellerProfile) {
            return res.status(400).json({ error: 'Seller profile not found' });
        }

        // Get all products this seller is selling
        const sellerProducts = await SellerProduct.find({ sellerId: sellerProfile._id })
            .populate('productId')
            .populate('sellerId', 'shopName')
            .sort({ createdAt: -1 });

        res.json(sellerProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new master product (seller uploads new product)
exports.createMasterProduct = async (req, res) => {
    try {
        const { name, brand, category, description, specifications, images, tags } = req.body;

        // Check if product already exists
        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            brand: { $regex: new RegExp(`^${brand}$`, 'i') }
        });

        if (existingProduct) {
            return res.status(400).json({ 
                error: 'Product already exists', 
                existingProduct 
            });
        }

        // Create new master product
        const product = new Product({
            name,
            brand,
            category,
            description,
            specifications,
            images,
            tags,
            createdBy: req.user._id,
            isMaster: true
        });

        await product.save();
        
        // Automatically create seller product listing
        const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
        if (sellerProfile) {
            const sellerProduct = new SellerProduct({
                productId: product._id,
                sellerId: sellerProfile._id,
                price: req.body.price || 0,
                stock: req.body.stock || 0,
                condition: req.body.condition || 'new'
            });
            await sellerProduct.save();
        }

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Seller adds existing product to their inventory
exports.addExistingProduct = async (req, res) => {
    try {
        const { productId, price, stock, condition, description } = req.body;
        
        // Get seller profile
        const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
        if (!sellerProfile) {
            return res.status(400).json({ error: 'Seller profile not found' });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if seller already has this product
        const existingSellerProduct = await SellerProduct.findOne({
            productId,
            sellerId: sellerProfile._id
        });

        if (existingSellerProduct) {
            return res.status(400).json({ 
                error: 'You already have this product in your inventory',
                sellerProduct: existingSellerProduct 
            });
        }

        // Create seller product listing
        const sellerProduct = new SellerProduct({
            productId,
            sellerId: sellerProfile._id,
            price,
            stock,
            condition,
            description
        });

        await sellerProduct.save();
        
        // Populate details for response
        await sellerProduct.populate('productId');
        await sellerProduct.populate('sellerId', 'shopName');

        res.status(201).json(sellerProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update seller's product listing
exports.updateSellerProduct = async (req, res) => {
    try {
        const { sellerProductId } = req.params;
        const { price, stock, condition, description, isActive } = req.body;

        // Find seller product
        const sellerProduct = await SellerProduct.findById(sellerProductId)
            .populate('sellerId');

        if (!sellerProduct) {
            return res.status(404).json({ error: 'Product listing not found' });
        }

        // Verify seller owns this product
        const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
        if (!sellerProfile || sellerProduct.sellerId._id.toString() !== sellerProfile._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this product' });
        }

        // Update fields
        if (price !== undefined) sellerProduct.price = price;
        if (stock !== undefined) sellerProduct.stock = stock;
        if (condition !== undefined) sellerProduct.condition = condition;
        if (description !== undefined) sellerProduct.description = description;
        if (isActive !== undefined) sellerProduct.isActive = isActive;

        await sellerProduct.save();

        res.json(sellerProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete seller's product listing
exports.deleteSellerProduct = async (req, res) => {
    try {
        const { sellerProductId } = req.params;

        // Find seller product
        const sellerProduct = await SellerProduct.findById(sellerProductId)
            .populate('sellerId');

        if (!sellerProduct) {
            return res.status(404).json({ error: 'Product listing not found' });
        }

        // Verify seller owns this product
        const sellerProfile = await SellerProfile.findOne({ userId: req.user._id });
        if (!sellerProfile || sellerProduct.sellerId._id.toString() !== sellerProfile._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this product' });
        }

        await sellerProduct.deleteOne();

        res.json({ message: 'Product listing deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};