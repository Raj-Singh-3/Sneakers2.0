import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './context/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import SellerAddProduct from './pages/SellerAddProduct';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                        <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                        <Route path="/seller/dashboard" element={<PrivateRoute><SellerDashboard /></PrivateRoute>} />
                        <Route path="/seller/products" element={<PrivateRoute><SellerProducts /></PrivateRoute>} />
                        <Route path="/seller/add-product" element={<PrivateRoute><SellerAddProduct /></PrivateRoute>} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                        <Route path="/product/:id" element={
    <PrivateRoute>
        <ProductDetail />
    </PrivateRoute>
} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;