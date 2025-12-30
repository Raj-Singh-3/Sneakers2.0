import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return '#28a745';
            case 'shipped': return '#17a2b8';
            case 'processing': return '#ffc107';
            case 'pending': return '#6c757d';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <h1>My Orders</h1>
                
                {orders.length === 0 ? (
                    <div style={styles.emptyOrders}>
                        <p>No orders yet</p>
                    </div>
                ) : (
                    <div style={styles.ordersList}>
                        {orders.map(order => (
                            <div key={order._id} style={styles.orderCard}>
                                <div style={styles.orderHeader}>
                                    <div>
                                        <h3>Order #{order.orderId}</h3>
                                        <p style={styles.orderDate}>
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div style={styles.orderStatus}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: getStatusColor(order.status)
                                        }}>
                                            {order.status.toUpperCase()}
                                        </span>
                                        <p style={styles.orderTotal}>₹{order.totalAmount}</p>
                                    </div>
                                </div>
                                
                                <div style={styles.orderItems}>
                                    {order.items.map((item, index) => (
                                        <div key={index} style={styles.orderItem}>
                                            <div style={styles.itemInfo}>
                                                <h4>{item.productName}</h4>
                                                <p>Seller: {item.sellerShopName}</p>
                                                <p>Quantity: {item.quantity} × ₹{item.price}</p>
                                            </div>
                                            <div style={styles.itemTotal}>
                                                ₹{item.total}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Shipment Tracking */}
                                {order.shipments && order.shipments.length > 0 && (
                                    <div style={styles.shipmentSection}>
                                        <h4>Shipment Tracking</h4>
                                        {order.shipments.map((shipment, index) => (
                                            <div key={shipment._id} style={styles.shipment}>
                                                <div style={styles.shipmentInfo}>
                                                    <p>
                                                        <strong>Status:</strong> 
                                                        <span style={{
                                                            color: getStatusColor(shipment.status)
                                                        }}>
                                                            {' ' + shipment.status}
                                                        </span>
                                                    </p>
                                                    <p><strong>Current Location:</strong> {shipment.currentLocation}</p>
                                                    <p><strong>Expected Delivery:</strong> 
                                                        {' ' + new Date(shipment.expectedDelivery).toLocaleDateString()}
                                                    </p>
                                                    <p><strong>Tracking Number:</strong> {shipment.trackingNumber}</p>
                                                </div>
                                                
                                                {shipment.updates && shipment.updates.length > 0 && (
                                                    <div style={styles.shipmentUpdates}>
                                                        <h5>Updates</h5>
                                                        {shipment.updates.map((update, updateIndex) => (
                                                            <div key={updateIndex} style={styles.update}>
                                                                <p style={styles.updateDate}>
                                                                    {new Date(update.updatedAt).toLocaleString()}
                                                                </p>
                                                                <p>{update.location} - {update.status}</p>
                                                                {update.description && (
                                                                    <p><em>{update.description}</em></p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div style={styles.orderFooter}>
                                    <p><strong>Shipping Address:</strong> {Object.values(order.shippingAddress).join(', ')}</p>
                                    <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
    },
    emptyOrders: {
        textAlign: 'center',
        padding: '3rem'
    },
    ordersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
    },
    orderCard: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem'
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #eee'
    },
    orderDate: {
        color: '#666',
        fontSize: '0.9rem'
    },
    orderStatus: {
        textAlign: 'right'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        color: 'white',
        fontSize: '0.8rem',
        marginBottom: '0.5rem'
    },
    orderTotal: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#28a745'
    },
    orderItems: {
        margin: '1rem 0'
    },
    orderItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.5rem 0',
        borderBottom: '1px solid #f0f0f0'
    },
    itemInfo: {
        flex: 1
    },
    itemTotal: {
        fontWeight: 'bold'
    },
    shipmentSection: {
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #eee'
    },
    shipment: {
        margin: '0.5rem 0',
        padding: '0.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
    },
    shipmentInfo: {
        marginBottom: '0.5rem'
    },
    shipmentUpdates: {
        marginTop: '0.5rem',
        padding: '0.5rem',
        backgroundColor: 'white',
        borderRadius: '4px',
        border: '1px solid #ddd'
    },
    update: {
        padding: '0.25rem 0',
        borderBottom: '1px solid #f0f0f0'
    },
    updateDate: {
        fontSize: '0.8rem',
        color: '#666'
    },
    orderFooter: {
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid #eee',
        fontSize: '0.9rem',
        color: '#666'
    }
};

export default Orders;