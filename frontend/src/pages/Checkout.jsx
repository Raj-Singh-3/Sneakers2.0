import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await API.get('/cart');
            setCart(response.data);
            
            if (!response.data || response.data.items.length === 0) {
                navigate('/cart');
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            if (item.sellerProductId && item.sellerProductId.price) {
                return total + (item.sellerProductId.price * item.quantity);
            }
            return total;
        }, 0);
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        
        // Validate address
        if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
            alert('Please fill in all shipping address fields');
            return;
        }

        setPlacingOrder(true);
        try {
            const orderData = {
                shippingAddress,
                paymentMethod
            };

            const response = await API.post('/orders', orderData);
            
            alert(`Order placed successfully! Order ID: ${response.data.orderId}`);
            
            // Clear cart and navigate to orders
            await API.delete('/cart/clear');
            navigate('/orders');
            
        } catch (error) {
            alert('Error placing order: ' + (error.response?.data?.error || error.message));
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div style={styles.loadingContainer}>
                    <div>Loading checkout...</div>
                </div>
            </div>
        );
    }

    const total = calculateTotal();
    const itemCount = cart?.items?.length || 0;

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <h1 style={styles.title}>Checkout</h1>
                
                <div style={styles.checkoutGrid}>
                    {/* Left Column - Shipping & Payment */}
                    <div style={styles.leftColumn}>
                        {/* Shipping Address */}
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Shipping Address</h2>
                            <form>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Street Address *</label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={shippingAddress.street}
                                        onChange={handleAddressChange}
                                        required
                                        style={styles.input}
                                        placeholder="House no., Building, Street"
                                    />
                                </div>
                                
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleAddressChange}
                                            required
                                            style={styles.input}
                                            placeholder="City"
                                        />
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>State *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleAddressChange}
                                            required
                                            style={styles.input}
                                            placeholder="State"
                                        />
                                    </div>
                                </div>
                                
                                <div style={styles.formRow}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>ZIP Code *</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={shippingAddress.zipCode}
                                            onChange={handleAddressChange}
                                            required
                                            style={styles.input}
                                            placeholder="PIN Code"
                                        />
                                    </div>
                                    
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Country</label>
                                        <input
                                            type="text"
                                            value="India"
                                            readOnly
                                            style={styles.input}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div style={styles.section}>
                            <h2 style={styles.sectionTitle}>Payment Method</h2>
                            <div style={styles.paymentMethods}>
                                <label style={styles.paymentMethod}>
                                    <input
                                        type="radio"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={styles.radio}
                                    />
                                    <span style={styles.paymentLabel}>
                                        Cash on Delivery (COD)
                                    </span>
                                    <span style={styles.paymentDescription}>
                                        Pay when you receive the product
                                    </span>
                                </label>
                                
                                <label style={styles.paymentMethod}>
                                    <input
                                        type="radio"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={styles.radio}
                                    />
                                    <span style={styles.paymentLabel}>
                                        Credit/Debit Card
                                    </span>
                                    <span style={styles.paymentDescription}>
                                        Coming soon
                                    </span>
                                </label>
                                
                                <label style={styles.paymentMethod}>
                                    <input
                                        type="radio"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={styles.radio}
                                    />
                                    <span style={styles.paymentLabel}>
                                        UPI
                                    </span>
                                    <span style={styles.paymentDescription}>
                                        Coming soon
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div style={styles.rightColumn}>
                        <div style={styles.orderSummary}>
                            <h2 style={styles.summaryTitle}>Order Summary</h2>
                            
                            {/* Order Items */}
                            <div style={styles.orderItems}>
                                {cart?.items?.map((item, index) => {
                                    const product = item.sellerProductId?.productId;
                                    const seller = item.sellerProductId?.sellerId;
                                    const price = item.sellerProductId?.price || 0;
                                    const itemTotal = price * item.quantity;

                                    return (
                                        <div key={index} style={styles.orderItem}>
                                            <div style={styles.orderItemImage}>
                                                {product?.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        style={styles.itemImage}
                                                    />
                                                ) : (
                                                    <div style={styles.itemImagePlaceholder}>
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div style={styles.orderItemDetails}>
                                                <h4 style={styles.orderItemName}>
                                                    {product?.name || 'Unknown Product'}
                                                </h4>
                                                <p style={styles.orderItemSeller}>
                                                    Sold by: {seller?.shopName || 'Unknown Seller'}
                                                </p>
                                                <p style={styles.orderItemQuantity}>
                                                    Qty: {item.quantity} × ₹{price.toFixed(2)}
                                                </p>
                                            </div>
                                            <div style={styles.orderItemTotal}>
                                                ₹{itemTotal.toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Price Breakdown */}
                            <div style={styles.priceBreakdown}>
                                <div style={styles.priceRow}>
                                    <span>Subtotal ({itemCount} items):</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                                <div style={styles.priceRow}>
                                    <span>Shipping:</span>
                                    <span style={styles.freeShipping}>Free</span>
                                </div>
                                <div style={styles.priceRow}>
                                    <span>Tax:</span>
                                    <span>₹0.00</span>
                                </div>
                                <div style={styles.totalRow}>
                                    <span>Total:</span>
                                    <span style={styles.totalAmount}>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={placingOrder || !cart?.items?.length}
                                style={styles.placeOrderButton}
                            >
                                {placingOrder ? 'Placing Order...' : 'Place Order'}
                            </button>

                            <p style={styles.secureNote}>
                                🔒 Your order is secure and encrypted
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '30px',
        textAlign: 'center'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
    },
    checkoutGrid: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '40px'
    },
    leftColumn: {},
    section: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        marginBottom: '30px'
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '25px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#555'
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        boxSizing: 'border-box'
    },
    paymentMethods: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    paymentMethod: {
        padding: '20px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'border-color 0.3s'
    },
    paymentMethodSelected: {
        borderColor: '#3498db',
        backgroundColor: '#f0f8ff'
    },
    radio: {
        marginRight: '15px',
        transform: 'scale(1.2)'
    },
    paymentLabel: {
        display: 'block',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '5px'
    },
    paymentDescription: {
        display: 'block',
        fontSize: '14px',
        color: '#666'
    },
    rightColumn: {},
    orderSummary: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: '20px'
    },
    summaryTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '25px'
    },
    orderItems: {
        maxHeight: '400px',
        overflowY: 'auto',
        marginBottom: '25px'
    },
    orderItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px 0',
        borderBottom: '1px solid #eee'
    },
    orderItemImage: {
        width: '60px',
        height: '60px',
        marginRight: '15px'
    },
    itemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '6px'
    },
    itemImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: '#999'
    },
    orderItemDetails: {
        flex: 1
    },
    orderItemName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '5px'
    },
    orderItemSeller: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '5px'
    },
    orderItemQuantity: {
        fontSize: '12px',
        color: '#999'
    },
    orderItemTotal: {
        fontWeight: '600',
        color: '#2c3e50'
    },
    priceBreakdown: {
        marginBottom: '30px'
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: '1px solid #eee',
        fontSize: '14px',
        color: '#666'
    },
    freeShipping: {
        color: '#2ecc71',
        fontWeight: '600'
    },
    totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '15px 0',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    totalAmount: {
        color: '#2ecc71',
        fontSize: '24px'
    },
    placeOrderButton: {
        width: '100%',
        padding: '18px',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'transform 0.3s',
        marginBottom: '15px'
    },
    secureNote: {
        textAlign: 'center',
        fontSize: '12px',
        color: '#666',
        marginTop: '15px'
    }
};

export default Checkout;