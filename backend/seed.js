require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const SellerProfile = require('./models/SellerProfile');
const Product = require('./models/Product');
const SellerProduct = require('./models/SellerProduct');

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce-marketplace');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDB();
        
        console.log('Clearing existing data...');
        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await SellerProfile.deleteMany({});
        await SellerProduct.deleteMany({});

        console.log('Creating users...');
        // Create users
        const buyer = await User.create({
            email: 'buyer@example.com',
            password: await bcrypt.hash('password123', 10),
            name: 'John Buyer',
            mobile: '9876543210',
            role: 'buyer'
        });

        const seller = await User.create({
            email: 'seller@example.com',
            password: await bcrypt.hash('password123', 10),
            name: 'Jane Seller',
            mobile: '9876543211',
            role: 'seller'
        });

        console.log('Creating seller profile...');
        // Create seller profile
        const sellerProfile = await SellerProfile.create({
            userId: seller._id,
            shopName: "Jane's Sneaker Shop",
            description: "Authentic sneakers at best prices"
        });

        console.log('Creating products...');
        // Create master products
        const products = await Product.insertMany([
            {
                name: "Nike Air Force 1",
                brand: "Nike",
                category: "Sneakers",
                description: "Classic Nike Air Force 1 sneakers with leather upper and Air cushioning",
                images: ["https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/7f934137-cc2b-4a57-bd71-915028afd2df/air-force-1-07-shoes-1d092q.png"],
                tags: ["nike", "air force", "casual", "white"],
                specifications: {
                    "Color": "White",
                    "Size": "US 8-12",
                    "Material": "Leather",
                    "Style": "Low-top"
                }
            },
            {
                name: "Adidas Ultraboost 22",
                brand: "Adidas",
                category: "Running Shoes",
                description: "Premium running shoes with boost technology for maximum comfort",
                images: ["https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/2cee1d8b5e2a4a2a8fc4ae8800e6b4df_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg"],
                tags: ["adidas", "running", "boost", "sports"],
                specifications: {
                    "Color": "Black",
                    "Size": "US 7-11",
                    "Material": "Primeknit",
                    "Style": "Running"
                }
            },
            {
                name: "Puma RS-X",
                brand: "Puma",
                category: "Sneakers",
                description: "Bold and chunky sneakers with retro style",
                images: ["https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_1350,h_1350/global/371697/01/sv01/fnd/IND/fmt/png/RS-X-Toys-Sneakers"],
                tags: ["puma", "retro", "chunky", "fashion"],
                specifications: {
                    "Color": "Multi-color",
                    "Size": "US 8-12",
                    "Material": "Synthetic",
                    "Style": "Chunky"
                }
            }
        ]);

        console.log('Creating seller products...');
        // Create seller products
        await SellerProduct.insertMany([
            {
                productId: products[0]._id,
                sellerId: sellerProfile._id,
                price: 7999,
                stock: 10,
                condition: 'new',
                description: 'Brand new, original Nike Air Force 1'
            },
            {
                productId: products[1]._id,
                sellerId: sellerProfile._id,
                price: 12999,
                stock: 5,
                condition: 'new',
                description: 'Latest Adidas Ultraboost 22 model'
            },
            {
                productId: products[2]._id,
                sellerId: sellerProfile._id,
                price: 8999,
                stock: 8,
                condition: 'new',
                description: 'Trendy Puma RS-X sneakers'
            }
        ]);

        // Create another seller
        const seller2 = await User.create({
            email: 'seller2@example.com',
            password: await bcrypt.hash('password123', 10),
            name: 'Mike Trader',
            mobile: '9876543212',
            role: 'seller'
        });

        const sellerProfile2 = await SellerProfile.create({
            userId: seller2._id,
            shopName: "Mike's Sneaker Haven",
            description: "Best deals on premium sneakers"
        });

        // Same products but different prices (for price comparison)
        await SellerProduct.insertMany([
            {
                productId: products[0]._id,
                sellerId: sellerProfile2._id,
                price: 7499, // Lower price for same product
                stock: 7,
                condition: 'new',
                description: 'Nike Air Force 1, slightly cheaper'
            },
            {
                productId: products[1]._id,
                sellerId: sellerProfile2._id,
                price: 12499, // Different price
                stock: 3,
                condition: 'new',
                description: 'Adidas Ultraboost 22, great deal'
            }
        ]);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n=== Test Accounts ===');
        console.log('Buyer:');
        console.log('  Email: buyer@example.com');
        console.log('  Password: password123');
        console.log('\nSeller:');
        console.log('  Email: seller@example.com');
        console.log('  Password: password123');
        console.log('\nSecond Seller:');
        console.log('  Email: seller2@example.com');
        console.log('  Password: password123');
        console.log('\nTotal Products:', products.length);
        console.log('Total Users: 3');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seed
seedDatabase();