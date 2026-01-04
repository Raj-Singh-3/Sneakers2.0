<img width="1895" height="878" alt="image" src="https://github.com/user-attachments/assets/1f3a5cff-f273-443d-9948-982195f64b8c" /># 🚀 SneakerMarket - Multi-Seller E-commerce Platform

![SneakerMarket Banner](https://img.shields.io/badge/MERN-Full%20Stack-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

A complete **multi-seller e-commerce marketplace** where multiple sellers can list the same products with different prices, and buyers can compare prices from different sellers before making a purchase.

## ✨ Features

### 🛍️ For Buyers

- **Price Comparison**: View same product from multiple sellers with different prices
- **Smart Search**: Search products by name, brand, category
- **Shopping Cart**: Add items from different sellers
- **Order Tracking**: Real-time shipment tracking with location updates
- **Reviews & Ratings**: Rate products and sellers

### 🏪 For Sellers

- **Product Management**: Add new products or list existing ones
- **Inventory Control**: Manage stock and pricing
- **Order Management**: View and process orders
- **Shipment Tracking**: Update shipment status and location
- **Seller Dashboard**: Analytics and insights

### 🔧 Technical Features

- **User Authentication**: JWT-based auth with role-based access
- **Real-time Updates**: Shipment tracking updates
- **RESTful API**: Complete backend with MongoDB
- **Responsive Design**: Mobile-friendly interface
- **Secure Payments**: Ready for payment gateway integration

## 📸 Screenshots

### Home Page

![Home Page](https://via.placeholder.com/800x400/3498db/ffffff?text=Product+Listing+with+Price+Comparison)

### Product Comparison

![Product Comparison](https://via.placeholder.com/800x400/2ecc71/ffffff?text=Multiple+Sellers+Price+Comparison)

### Seller Dashboard

![Seller Dashboard](https://via.placeholder.com/800x400/e74c3c/ffffff?text=Seller+Product+Management)

## 🏗️ Architecture

```
📁 sneaker-marketplace/
├── 📂 backend/           # Node.js + Express + MongoDB
│   ├── 📂 config/       # Database configuration
│   ├── 📂 controllers/  # API controllers
│   ├── 📂 models/       # MongoDB schemas
│   ├── 📂 routes/       # API routes
│   └── server.js       # Express server
│
├── 📂 frontend/         # React.js Application
│   ├── 📂 components/   # Reusable components
│   ├── 📂 context/      # React Context API
│   ├── 📂 pages/        # Page components
│   ├── 📂 utils/        # Utility functions
│   └── App.js          # Main React app
│
└── 📜 README.md        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/sneaker-marketplace.git
cd sneaker-marketplace
```

2. **Set up Backend**

```bash
cd backend
npm install
```

3. **Configure Environment Variables**

```bash
cp .env.example .env
```

Edit `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sneaker-marketplace
JWT_SECRET=your_super_secret_jwt_key_change_this
```

4. **Set up Frontend**

```bash
cd ../frontend
npm install
```

5. **Seed Database (Optional)**

```bash
cd ../backend
node seed.js
```

### Running the Application

1. **Start MongoDB**

```bash
mongod
# Or if using MongoDB service
sudo service mongod start
```

2. **Start Backend Server**

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

3. **Start Frontend Development Server**

```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

## 📊 Database Schema

### Core Models

- **Users**: Single table for buyers/sellers
- **Products**: Master product catalog
- **SellerProducts**: Seller-specific product listings
- **Cart**: User shopping cart
- **Orders**: Purchase orders
- **Shipments**: Delivery tracking
- **Reviews**: Product ratings

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/:id/sellers` - Get sellers for a product
- `POST /api/products` - Create product (seller)

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/item/:id` - Update cart item
- `DELETE /api/cart/item/:id` - Remove cart item

### Orders

- `POST /api/orders` - Create order from cart
- `POST /api/orders/direct` - Direct order (Buy Now)
- `GET /api/orders` - Get user orders
- `GET /api/orders/seller/orders` - Get seller orders

## 👥 User Roles

### 1. **Buyer** (`role: 'buyer'`)

- Browse and search products
- Compare prices from different sellers
- Add to cart and checkout
- Track orders
- Write reviews

### 2. **Seller** (`role: 'seller'`)

- Add/update products
- Set prices and stock
- Manage orders
- Update shipment status
- View sales analytics

### 3. **Both** (`role: 'both'`)

- All buyer and seller features
- Switch between roles

## 🎯 Default Test Accounts

### Buyer Account

- **Email**: `buyer@example.com`
- **Password**: `password123`

### Seller Accounts

1. **Seller 1**

   - **Email**: `seller@example.com`
   - **Password**: `password123`
   - **Shop**: "Jane's Sneaker Shop"
2. **Seller 2**

   - **Email**: `seller2@example.com`
   - **Password**: `password123`
   - **Shop**: "Mike's Sneaker Haven"

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt.js for password security
- **Input Validation**: Server-side validation
- **CORS Protection**: Configured for specific origins
- **Role-Based Access**: Protected routes by user role

## 📱 Frontend Technologies

- **React**: UI library
- **React Router**: Navigation
- **Context API**: State management
- **Axios**: HTTP client
- **CSS-in-JS**: Inline styling

## 🗄️ Backend Technologies

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **bcrypt.js**: Password hashing

## 📁 Project Structure Details

### Backend Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── productController.js  # Product CRUD operations
│   ├── cartController.js     # Shopping cart operations
│   └── orderController.js    # Order processing
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User schema
│   ├── Product.js           # Product schema
│   ├── SellerProduct.js     # Seller-product relationship
│   ├── Cart.js              # Cart schema
│   ├── Order.js             # Order schema
│   └── Shipment.js          # Shipment schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── productRoutes.js     # Product endpoints
│   ├── cartRoutes.js        # Cart endpoints
│   └── orderRoutes.js       # Order endpoints
├── utils/
│   └── seed.js             # Database seeder
├── .env                    # Environment variables
└── server.js              # Main server file
```

### Frontend Structure

```
frontend/
├── public/
│   └── index.html          # Main HTML file
├── src/
│   ├── components/
│   │   ├── Navbar.js       # Navigation component
│   │   └── PrivateRoute.js # Protected route component
│   ├── context/
│   │   └── AuthContext.js  # Authentication context
│   ├── pages/
│   │   ├── Login.js        # Login page
│   │   ├── Register.js     # Registration page
│   │   ├── Home.js         # Home/Product listing
│   │   ├── ProductDetail.js # Product comparison
│   │   ├── Cart.js         # Shopping cart
│   │   ├── Checkout.js     # Checkout page
│   │   ├── Orders.js       # Order history
│   │   ├── SellerDashboard.js # Seller dashboard
│   │   ├── SellerProducts.js  # Seller product management
│   │   └── SellerAddProduct.js # Add product page
│   ├── utils/
│   │   └── api.js          # API configuration
│   ├── App.js              # Main App component
│   └── index.js           # React entry point
└── package.json           # Dependencies
```

## 🧪 Testing

### Manual Testing

1. **User Registration**: Create buyer/seller accounts
2. **Product Listing**: Add products as seller
3. **Price Comparison**: View same product from multiple sellers
4. **Shopping Cart**: Add/remove items
5. **Order Placement**: Complete purchase flow
6. **Shipment Tracking**: Update and track deliveries

### API Testing

```bash
# Test API endpoints using curl or Postman
curl http://localhost:5000/api/products
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"buyer@example.com","password":"password123"}'
```

## 🔧 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sneaker-marketplace
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

## 🚀 Deployment

### Backend Deployment (Heroku/ Render)

```bash
# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGO_URI=your_mongodb_uri

# Deploy
git push heroku main
```


## 📈 Future Enhancements

### Planned Features

- [ ] **Payment Gateway**: Stripe/Razorpay integration
- [ ] **Real-time Chat**: Buyer-seller communication
- [ ] **Email Notifications**: Order updates
- [ ] **Advanced Search**: Filters and sorting
- [ ] **Admin Panel**: Full admin control
- [ ] **Product Recommendations**: AI-based suggestions
- [ ] **Mobile App**: React Native version
- [ ] **Social Login**: Google/Facebook login
- [ ] **Wishlist**: Save products for later
- [ ] **Coupons & Discounts**: Promotional offers

### Technical Improvements

- [ ] **Unit Tests**: Jest for backend/frontend
- [ ] **E2E Testing**: Cypress integration
- [ ] **Docker**: Containerization
- [ ] **CI/CD**: Automated deployment
- [ ] **Redis**: Caching layer
- [ ] **WebSocket**: Real-time updates
- [ ] **GraphQL**: Alternative to REST
- [ ] **Microservices**: Scalable architecture

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   ```bash
   # Start MongoDB service
   sudo service mongod start
   # Or
   mongod --dbpath /path/to/data/db
   ```
2. **Port Already in Use**

   ```bash
   # Kill process on port 5000
   sudo lsof -ti:5000 | xargs kill -9
   ```
3. **CORS Errors**

   - Check backend CORS configuration
   - Ensure frontend URL is in allowed origins
4. **JWT Authentication Failed**

   - Check token in localStorage
   - Verify JWT_SECRET matches
   - Check token expiration
5. **React App Not Starting**

   ```bash
   # Clear npm cache
   npm cache clean --force
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Tips

1. **Check Console Logs**: Browser console for frontend errors
2. **Server Logs**: Backend terminal for API errors
3. **Network Tab**: Check API requests/responses
4. **Database**: Verify MongoDB is running and collections exist

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation
- Write tests for new features
- Ensure backward compatibility

## 📚 Learning Resources

### MERN Stack

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Node.js Documentation](https://nodejs.org/en/docs/)

### Related Concepts

- [JWT Authentication](https://jwt.io/introduction/)
- [REST API Design](https://restfulapi.net/)
- [Mongoose ODM](https://mongoosejs.com/docs/guide.html)
- [React Context API](https://reactjs.org/docs/context.html)

## 👨‍💻 Authors

- Raj & Aishwarya - *Initial work* 

See also the list of [contributors](https://github.com/yourusername/sneaker-marketplace/contributors) who participated in this project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by multi-vendor marketplaces like Amazon, eBay
- Thanks to the MERN stack community
- All contributors and testers

## ⭐ Show your support

Give a ⭐️ if this project helped you!

## 📞 Contact

For queries and support:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/sneaker-marketplace/issues)
- **Email**: singhraj5604@gmail.com
- **LinkedIn**: [Your Profile](https://linkedin.com/in/yourprofile)

---

**Made with ❤️ by Raj and Aishwarya**

---

*Note: This is a demonstration project for learning purposes. Not intended for production use without proper security audits and improvements.*
