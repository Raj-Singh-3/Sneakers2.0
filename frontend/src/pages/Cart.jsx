import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingItem, setUpdatingItem] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await API.get('/cart');
            setCart(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching cart:', error);
            setError('Failed to load cart. Please try again.');
            setCart(null);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            setUpdatingItem(itemId);
            await API.put(`/cart/item/${itemId}`, { quantity: newQuantity });
            fetchCart(); // Refresh cart
        } catch (error) {
            alert('Error updating quantity: ' + (error.response?.data?.error || error.message));
        } finally {
            setUpdatingItem(null);
        }
    };

    const removeItem = async (itemId) => {
        if (window.confirm('Are you sure you want to remove this item from cart?')) {
            try {
                await API.delete(`/cart/item/${itemId}`);
                fetchCart(); // Refresh cart
            } catch (error) {
                alert('Error removing item: ' + (error.response?.data?.error || error.message));
            }
        }
    };

    const clearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            try {
                await API.delete('/cart/clear');
                fetchCart(); // Refresh cart
            } catch (error) {
                alert('Error clearing cart: ' + error.message);
            }
        }
    };

    const calculateSubtotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            if (item.sellerProductId && item.sellerProductId.price) {
                return total + (item.sellerProductId.price * item.quantity);
            }
            return total;
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const shipping = 0; // Free shipping for now
        return subtotal + shipping;
    };

    const handleCheckout = () => {
        if (!cart || cart.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Navbar />
                <div style={styles.container}>
                    <div style={styles.errorContainer}>
                        <h3>Error Loading Cart</h3>
                        <p>{error}</p>
                        <button onClick={fetchCart} style={styles.retryButton}>
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    const itemCount = cart?.items?.length || 0;

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <h1 style={styles.title}>Shopping Cart</h1>
                
                {!cart || cart.items.length === 0 ? (
                    <div style={styles.emptyCart}>
                        <div style={styles.emptyCartIcon}>🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Add some products to get started!</p>
                        <Link to="/" style={styles.shopButton}>
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart Summary */}
                        <div style={styles.cartSummary}>
                            <div style={styles.summaryItem}>
                                <span>Items in cart:</span>
                                <span style={styles.summaryValue}>{itemCount}</span>
                            </div>
                            <div style={styles.summaryItem}>
                                <span>Subtotal:</span>
                                <span style={styles.summaryValue}>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={styles.summaryItem}>
                                <span>Shipping:</span>
                                <span style={styles.summaryValue}>Free</span>
                            </div>
                            <div style={styles.summaryItem}>
                                <span>Total:</span>
                                <span style={styles.totalValue}>₹{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div style={styles.cartItems}>
                            {cart.items.map((item) => {
                                const product = item.sellerProductId?.productId;
                                const seller = item.sellerProductId?.sellerId;
                                const price = item.sellerProductId?.price || 0;
                                const itemTotal = price * item.quantity;

                                return (
                                    <div key={item._id} style={styles.cartItem}>
                                        {/* Product Image */}
                                        <div style={styles.itemImage}>
                                            {product?.images?.[0] ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    style={styles.productImage}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div style={styles.imagePlaceholder}>
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div style={styles.itemDetails}>
                                            <h3 style={styles.productName}>
                                                {product?.name || 'Unknown Product'}
                                            </h3>
                                            <p style={styles.sellerInfo}>
                                                Sold by: <strong>{seller?.shopName || 'Unknown Seller'}</strong>
                                            </p>
                                            <p style={styles.priceInfo}>
                                                Price: ₹{price.toFixed(2)}
                                            </p>
                                            <p style={styles.conditionInfo}>
                                                Condition: {item.sellerProductId?.condition || 'New'}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div style={styles.quantitySection}>
                                            <div style={styles.quantityControls}>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || updatingItem === item._id}
                                                    style={styles.quantityButton}
                                                >
                                                    −
                                                </button>
                                                <span style={styles.quantityDisplay}>
                                                    {updatingItem === item._id ? '...' : item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    disabled={updatingItem === item._id}
                                                    style={styles.quantityButton}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <p style={styles.stockInfo}>
                                                Max: {item.sellerProductId?.stock || 0} available
                                            </p>
                                        </div>

                                        {/* Item Total */}
                                        <div style={styles.itemTotal}>
                                            <div style={styles.totalAmount}>
                                                ₹{itemTotal.toFixed(2)}
                                            </div>
                                            <div style={styles.unitPrice}>
                                                ₹{price.toFixed(2)} each
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <div style={styles.removeSection}>
                                            <button
                                                onClick={() => removeItem(item._id)}
                                                style={styles.removeButton}
                                                disabled={updatingItem === item._id}
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cart Actions */}
                        <div style={styles.cartActions}>
                            <div style={styles.leftActions}>
                                <button
                                    onClick={clearCart}
                                    style={styles.clearButton}
                                    disabled={cart.items.length === 0}
                                >
                                    Clear Cart
                                </button>
                                <Link to="/" style={styles.continueShopping}>
                                    ← Continue Shopping
                                </Link>
                            </div>
                            <div style={styles.rightActions}>
                                <div style={styles.finalTotal}>
                                    <span style={styles.finalTotalLabel}>Total:</span>
                                    <span style={styles.finalTotalAmount}>₹{total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    style={styles.checkoutButton}
                                    disabled={cart.items.length === 0}
                                >
                                    Proceed to Checkout ({itemCount} items)
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        minHeight: 'calc(100vh - 80px)'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '30px',
        textAlign: 'center'
    },
    emptyCart: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '15px',
        marginTop: '40px'
    },
    emptyCartIcon: {
        fontSize: '80px',
        marginBottom: '20px',
        opacity: '0.5'
    },
    shopButton: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '15px 30px',
        backgroundColor: '#3498db',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '8px',
        marginTop: '40px'
    },
    retryButton: {
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '20px'
    },
    cartSummary: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        marginBottom: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #eee'
    },
    summaryValue: {
        fontWeight: '600',
        color: '#2c3e50'
    },
    totalValue: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    cartItems: {
        marginBottom: '40px'
    },
    cartItem: {
        display: 'grid',
        gridTemplateColumns: '120px 2fr 1fr 1fr auto',
        gap: '20px',
        alignItems: 'center',
        padding: '25px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        marginBottom: '20px',
        transition: 'transform 0.3s'
    },
    cartItemHover: {
        transform: 'translateY(-5px)',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
    },
    itemImage: {
        width: '120px',
        height: '120px'
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '8px'
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '12px'
    },
    itemDetails: {
        padding: '10px 0'
    },
    productName: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '10px'
    },
    sellerInfo: {
        fontSize: '14px',
        color: '#666',
        marginBottom: '8px'
    },
    priceInfo: {
        fontSize: '16px',
        color: '#2ecc71',
        fontWeight: '600',
        marginBottom: '8px'
    },
    conditionInfo: {
        fontSize: '12px',
        color: '#999',
        backgroundColor: '#f8f9fa',
        padding: '4px 8px',
        borderRadius: '4px',
        display: 'inline-block'
    },
    quantitySection: {
        textAlign: 'center'
    },
    quantityControls: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '10px'
    },
    quantityButton: {
        width: '36px',
        height: '36px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    quantityDisplay: {
        minWidth: '40px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: '600'
    },
    stockInfo: {
        fontSize: '12px',
        color: '#666'
    },
    itemTotal: {
        textAlign: 'center'
    },
    totalAmount: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '5px'
    },
    unitPrice: {
        fontSize: '12px',
        color: '#999'
    },
    removeSection: {
        textAlign: 'center'
    },
    removeButton: {
        padding: '8px 16px',
        backgroundColor: '#f8f9fa',
        color: '#dc3545',
        border: '1px solid #dc3545',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s'
    },
    removeButtonHover: {
        backgroundColor: '#dc3545',
        color: 'white'
    },
    cartActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
    },
    leftActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    clearButton: {
        padding: '12px 24px',
        backgroundColor: '#f8f9fa',
        color: '#dc3545',
        border: '1px solid #dc3545',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600'
    },
    continueShopping: {
        color: '#3498db',
        textDecoration: 'none',
        fontSize: '14px'
    },
    rightActions: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '20px'
    },
    finalTotal: {
        textAlign: 'right'
    },
    finalTotalLabel: {
        fontSize: '16px',
        color: '#666',
        marginRight: '10px'
    },
    finalTotalAmount: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    checkoutButton: {
        padding: '18px 40px',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'transform 0.3s'
    },
    checkoutButtonHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 5px 15px rgba(46, 204, 113, 0.3)'
    }
};

// Add CSS for animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .cart-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }
    
    .remove-button:hover {
        background-color: #dc3545;
        color: white;
    }
    
    .checkout-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
    }
    
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
document.head.appendChild(styleSheet);

export default Cart;