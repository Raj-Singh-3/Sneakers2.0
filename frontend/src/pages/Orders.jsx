// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Navbar from '../components/Navbar';

// const Orders = () => {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchOrders();
//     }, []);

//     const fetchOrders = async () => {
//         try {
//             const response = await axios.get('/api/orders');
//             setOrders(response.data);
//         } catch (error) {
//             console.error('Error fetching orders:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'delivered': return '#28a745';
//             case 'shipped': return '#17a2b8';
//             case 'processing': return '#ffc107';
//             case 'pending': return '#6c757d';
//             case 'cancelled': return '#dc3545';
//             default: return '#6c757d';
//         }
//     };

//     if (loading) return <div>Loading...</div>;

//     return (
//         <div>
//             <Navbar />
//             <div style={styles.container}>
//                 <h1>My Orders</h1>
                
//                 {orders.length === 0 ? (
//                     <div style={styles.emptyOrders}>
//                         <p>No orders yet</p>
//                     </div>
//                 ) : (
//                     <div style={styles.ordersList}>
//                         {orders.map(order => (
//                             <div key={order._id} style={styles.orderCard}>
//                                 <div style={styles.orderHeader}>
//                                     <div>
//                                         <h3>Order #{order.orderId}</h3>
//                                         <p style={styles.orderDate}>
//                                             {new Date(order.createdAt).toLocaleDateString()}
//                                         </p>
//                                     </div>
//                                     <div style={styles.orderStatus}>
//                                         <span style={{
//                                             ...styles.statusBadge,
//                                             backgroundColor: getStatusColor(order.status)
//                                         }}>
//                                             {order.status.toUpperCase()}
//                                         </span>
//                                         <p style={styles.orderTotal}>₹{order.totalAmount}</p>
//                                     </div>
//                                 </div>
                                
//                                 <div style={styles.orderItems}>
//                                     {order.items.map((item, index) => (
//                                         <div key={index} style={styles.orderItem}>
//                                             <div style={styles.itemInfo}>
//                                                 <h4>{item.productName}</h4>
//                                                 <p>Seller: {item.sellerShopName}</p>
//                                                 <p>Quantity: {item.quantity} × ₹{item.price}</p>
//                                             </div>
//                                             <div style={styles.itemTotal}>
//                                                 ₹{item.total}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
                                
//                                 {/* Shipment Tracking */}
//                                 {order.shipments && order.shipments.length > 0 && (
//                                     <div style={styles.shipmentSection}>
//                                         <h4>Shipment Tracking</h4>
//                                         {order.shipments.map((shipment, index) => (
//                                             <div key={shipment._id} style={styles.shipment}>
//                                                 <div style={styles.shipmentInfo}>
//                                                     <p>
//                                                         <strong>Status:</strong> 
//                                                         <span style={{
//                                                             color: getStatusColor(shipment.status)
//                                                         }}>
//                                                             {' ' + shipment.status}
//                                                         </span>
//                                                     </p>
//                                                     <p><strong>Current Location:</strong> {shipment.currentLocation}</p>
//                                                     <p><strong>Expected Delivery:</strong> 
//                                                         {' ' + new Date(shipment.expectedDelivery).toLocaleDateString()}
//                                                     </p>
//                                                     <p><strong>Tracking Number:</strong> {shipment.trackingNumber}</p>
//                                                 </div>
                                                
//                                                 {shipment.updates && shipment.updates.length > 0 && (
//                                                     <div style={styles.shipmentUpdates}>
//                                                         <h5>Updates</h5>
//                                                         {shipment.updates.map((update, updateIndex) => (
//                                                             <div key={updateIndex} style={styles.update}>
//                                                                 <p style={styles.updateDate}>
//                                                                     {new Date(update.updatedAt).toLocaleString()}
//                                                                 </p>
//                                                                 <p>{update.location} - {update.status}</p>
//                                                                 {update.description && (
//                                                                     <p><em>{update.description}</em></p>
//                                                                 )}
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
                                
//                                 <div style={styles.orderFooter}>
//                                     <p><strong>Shipping Address:</strong> {Object.values(order.shippingAddress).join(', ')}</p>
//                                     <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</p>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// const styles = {
//     container: {
//         maxWidth: '1200px',
//         margin: '0 auto',
//         padding: '2rem 1rem'
//     },
//     emptyOrders: {
//         textAlign: 'center',
//         padding: '3rem'
//     },
//     ordersList: {
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '1.5rem'
//     },
//     orderCard: {
//         border: '1px solid #ddd',
//         borderRadius: '8px',
//         padding: '1.5rem'
//     },
//     orderHeader: {
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         marginBottom: '1rem',
//         paddingBottom: '1rem',
//         borderBottom: '1px solid #eee'
//     },
//     orderDate: {
//         color: '#666',
//         fontSize: '0.9rem'
//     },
//     orderStatus: {
//         textAlign: 'right'
//     },
//     statusBadge: {
//         display: 'inline-block',
//         padding: '0.25rem 0.5rem',
//         borderRadius: '4px',
//         color: 'white',
//         fontSize: '0.8rem',
//         marginBottom: '0.5rem'
//     },
//     orderTotal: {
//         fontSize: '1.2rem',
//         fontWeight: 'bold',
//         color: '#28a745'
//     },
//     orderItems: {
//         margin: '1rem 0'
//     },
//     orderItem: {
//         display: 'flex',
//         justifyContent: 'space-between',
//         padding: '0.5rem 0',
//         borderBottom: '1px solid #f0f0f0'
//     },
//     itemInfo: {
//         flex: 1
//     },
//     itemTotal: {
//         fontWeight: 'bold'
//     },
//     shipmentSection: {
//         marginTop: '1rem',
//         paddingTop: '1rem',
//         borderTop: '1px solid #eee'
//     },
//     shipment: {
//         margin: '0.5rem 0',
//         padding: '0.5rem',
//         backgroundColor: '#f8f9fa',
//         borderRadius: '4px'
//     },
//     shipmentInfo: {
//         marginBottom: '0.5rem'
//     },
//     shipmentUpdates: {
//         marginTop: '0.5rem',
//         padding: '0.5rem',
//         backgroundColor: 'white',
//         borderRadius: '4px',
//         border: '1px solid #ddd'
//     },
//     update: {
//         padding: '0.25rem 0',
//         borderBottom: '1px solid #f0f0f0'
//     },
//     updateDate: {
//         fontSize: '0.8rem',
//         color: '#666'
//     },
//     orderFooter: {
//         marginTop: '1rem',
//         paddingTop: '1rem',
//         borderTop: '1px solid #eee',
//         fontSize: '0.9rem',
//         color: '#666'
//     }
// };

// export default Orders;



import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'processing', 'delivered'

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching orders...');
            
            const response = await API.get('/orders');
            console.log('Orders response:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                console.error('Invalid orders data:', response.data);
                setOrders([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again.');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return '#28a745';
            case 'shipped': return '#17a2b8';
            case 'processing': return '#ffc107';
            case 'confirmed': return '#007bff';
            case 'pending': return '#6c757d';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'processing': return 'Processing';
            case 'confirmed': return 'Confirmed';
            case 'shipped': return 'Shipped';
            case 'in_transit': return 'In Transit';
            case 'out_for_delivery': return 'Out for Delivery';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return 'Pending';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        return order.status === activeTab;
    });

    if (loading) {
        return (
            <div>
                <Navbar />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <h1 style={styles.title}>My Orders</h1>
                
                {error && (
                    <div style={styles.errorContainer}>
                        <p>{error}</p>
                        <button onClick={fetchOrders} style={styles.retryButton}>
                            Retry
                        </button>
                    </div>
                )}

                {/* Order Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'all' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('all')}
                    >
                        All Orders ({orders.length})
                    </button>
                    <button
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'processing' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('processing')}
                    >
                        Processing
                    </button>
                    <button
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'delivered' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('delivered')}
                    >
                        Delivered
                    </button>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div style={styles.noOrders}>
                        <div style={styles.noOrdersIcon}>📦</div>
                        <h3>No orders found</h3>
                        <p>
                            {activeTab === 'all' 
                                ? "You haven't placed any orders yet."
                                : `You don't have any ${activeTab} orders.`
                            }
                        </p>
                        <button onClick={fetchOrders} style={styles.refreshButton}>
                            Refresh Orders
                        </button>
                        <p style={styles.helpText}>
                            If you just placed an order, it may take a moment to appear.
                        </p>
                    </div>
                ) : (
                    <div style={styles.ordersList}>
                        {filteredOrders.map(order => (
                            <OrderCard 
                                key={order._id} 
                                order={order} 
                                getStatusColor={getStatusColor}
                                getStatusText={getStatusText}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Order Card Component
const OrderCard = ({ order, getStatusColor, getStatusText, formatDate }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div style={styles.orderCard}>
            {/* Order Header */}
            <div style={styles.orderHeader}>
                <div style={styles.orderInfo}>
                    <div style={styles.orderIdRow}>
                        <h3 style={styles.orderId}>Order #{order.orderId}</h3>
                        <span style={styles.orderDate}>
                            {formatDate(order.createdAt)}
                        </span>
                    </div>
                    <div style={styles.orderMeta}>
                        <span style={styles.itemCount}>
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </span>
                        <span style={styles.totalAmount}>
                            ₹{order.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                    </div>
                </div>
                <div style={styles.orderStatus}>
                    <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(order.status)
                    }}>
                        {getStatusText(order.status)}
                    </span>
                </div>
            </div>

            {/* Order Items */}
            <div style={styles.orderItems}>
                {order.items?.slice(0, 2).map((item, index) => (
                    <div key={index} style={styles.orderItem}>
                        {item.sellerProductId?.productId?.images?.[0] ? (
                            <img
                                src={item.sellerProductId.productId.images[0]}
                                alt={item.productName}
                                style={styles.itemImage}
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                                }}
                            />
                        ) : (
                            <div style={styles.itemImagePlaceholder}>
                                No Image
                            </div>
                        )}
                        <div style={styles.itemInfo}>
                            <h4 style={styles.itemName}>
                                {item.productName || 'Unknown Product'}
                            </h4>
                            <p style={styles.itemSeller}>
                                Seller: {item.sellerShopName || 'Unknown Seller'}
                            </p>
                            <p style={styles.itemDetails}>
                                Qty: {item.quantity} × ₹{item.price?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <div style={styles.itemTotal}>
                            ₹{item.total?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                ))}
                
                {order.items && order.items.length > 2 && (
                    <div style={styles.moreItems}>
                        +{order.items.length - 2} more items
                    </div>
                )}
            </div>

            {/* Shipment Tracking */}
            {order.shipments && order.shipments.length > 0 && (
                <div style={styles.shipmentSection}>
                    <h4 style={styles.shipmentTitle}>Shipment Tracking</h4>
                    {order.shipments.map((shipment, index) => (
                        <div key={shipment._id || index} style={styles.shipment}>
                            <div style={styles.shipmentHeader}>
                                <span style={styles.shipmentSeller}>
                                    Seller: {shipment.sellerId?.shopName || 'Unknown'}
                                </span>
                                <span style={{
                                    ...styles.shipmentStatus,
                                    color: getStatusColor(shipment.status)
                                }}>
                                    {getStatusText(shipment.status)}
                                </span>
                            </div>
                            <div style={styles.shipmentDetails}>
                                <p style={styles.shipmentLocation}>
                                    📍 Current Location: {shipment.currentLocation || 'Not updated'}
                                </p>
                                {shipment.trackingNumber && (
                                    <p style={styles.trackingNumber}>
                                        Tracking #: {shipment.trackingNumber}
                                    </p>
                                )}
                                {shipment.expectedDelivery && (
                                    <p style={styles.expectedDelivery}>
                                        Expected Delivery: {formatDate(shipment.expectedDelivery)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Actions */}
            <div style={styles.orderActions}>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    style={styles.detailsButton}
                >
                    {showDetails ? 'Hide Details' : 'View Details'}
                </button>
            </div>

            {/* Detailed View */}
            {showDetails && (
                <div style={styles.detailsPanel}>
                    {/* Shipping Address */}
                    <div style={styles.detailSection}>
                        <h5>Shipping Address</h5>
                        <p style={styles.addressText}>
                            {order.shippingAddress?.street && `${order.shippingAddress.street}, `}
                            {order.shippingAddress?.city && `${order.shippingAddress.city}, `}
                            {order.shippingAddress?.state && `${order.shippingAddress.state} - `}
                            {order.shippingAddress?.zipCode && `${order.shippingAddress.zipCode}`}
                            {order.shippingAddress?.country && `, ${order.shippingAddress.country}`}
                        </p>
                    </div>

                    {/* Payment Info */}
                    <div style={styles.detailSection}>
                        <h5>Payment Information</h5>
                        <p>
                            Method: <strong>{order.paymentMethod?.toUpperCase() || 'COD'}</strong>
                        </p>
                        <p>
                            Status: <strong>{order.paymentStatus || 'Pending'}</strong>
                        </p>
                    </div>

                    {/* All Items */}
                    {order.items && order.items.length > 0 && (
                        <div style={styles.detailSection}>
                            <h5>All Items ({order.items.length})</h5>
                            {order.items.map((item, index) => (
                                <div key={index} style={styles.detailItem}>
                                    <span style={styles.detailItemName}>
                                        {item.productName}
                                    </span>
                                    <span style={styles.detailItemQty}>
                                        Qty: {item.quantity}
                                    </span>
                                    <span style={styles.detailItemPrice}>
                                        ₹{item.total?.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
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
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '30px',
        textAlign: 'center'
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
    errorContainer: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
    },
    retryButton: {
        padding: '8px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '10px'
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        overflowX: 'auto',
        paddingBottom: '10px'
    },
    tabButton: {
        padding: '12px 24px',
        backgroundColor: '#f8f9fa',
        color: '#495057',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        whiteSpace: 'nowrap'
    },
    activeTab: {
        backgroundColor: '#3498db',
        color: 'white',
        borderColor: '#3498db'
    },
    noOrders: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginTop: '20px'
    },
    noOrdersIcon: {
        fontSize: '60px',
        marginBottom: '20px',
        opacity: '0.5'
    },
    refreshButton: {
        padding: '12px 24px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '20px'
    },
    helpText: {
        fontSize: '14px',
        color: '#666',
        marginTop: '15px',
        fontStyle: 'italic'
    },
    ordersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '25px'
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s'
    },
    orderHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
    },
    orderInfo: {
        flex: 1
    },
    orderIdRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '10px'
    },
    orderId: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        margin: 0
    },
    orderDate: {
        fontSize: '14px',
        color: '#666'
    },
    orderMeta: {
        display: 'flex',
        gap: '20px',
        fontSize: '14px',
        color: '#666'
    },
    itemCount: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        padding: '4px 12px',
        borderRadius: '12px'
    },
    totalAmount: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2ecc71'
    },
    orderStatus: {
        textAlign: 'right'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '6px 16px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    orderItems: {
        marginBottom: '20px'
    },
    orderItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px 0',
        borderBottom: '1px solid #f5f5f5'
    },
    itemImage: {
        width: '60px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '8px',
        marginRight: '15px'
    },
    itemImagePlaceholder: {
        width: '60px',
        height: '60px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        color: '#999',
        marginRight: '15px'
    },
    itemInfo: {
        flex: 1
    },
    itemName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2c3e50',
        margin: '0 0 5px 0'
    },
    itemSeller: {
        fontSize: '12px',
        color: '#666',
        margin: '0 0 5px 0'
    },
    itemDetails: {
        fontSize: '12px',
        color: '#999',
        margin: 0
    },
    itemTotal: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2c3e50',
        minWidth: '80px',
        textAlign: 'right'
    },
    moreItems: {
        textAlign: 'center',
        padding: '10px',
        color: '#3498db',
        fontSize: '14px',
        cursor: 'pointer'
    },
    shipmentSection: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    shipmentTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '15px'
    },
    shipment: {
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e9ecef'
    },
    shipmentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px'
    },
    shipmentSeller: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    shipmentStatus: {
        fontSize: '12px',
        fontWeight: '600',
        padding: '4px 10px',
        borderRadius: '12px',
        backgroundColor: 'rgba(0,0,0,0.05)'
    },
    shipmentDetails: {
        fontSize: '13px',
        color: '#666'
    },
    shipmentLocation: {
        margin: '0 0 5px 0'
    },
    trackingNumber: {
        margin: '0 0 5px 0',
        fontFamily: 'monospace'
    },
    expectedDelivery: {
        margin: 0
    },
    orderActions: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #eee'
    },
    detailsButton: {
        padding: '10px 24px',
        backgroundColor: '#f8f9fa',
        color: '#3498db',
        border: '1px solid #3498db',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600'
    },
    detailsPanel: {
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        animation: 'fadeIn 0.3s ease-in'
    },
    detailSection: {
        marginBottom: '20px'
    },
    addressText: {
        margin: '10px 0 0 0',
        lineHeight: '1.6',
        color: '#333'
    },
    detailItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #eee'
    },
    detailItemName: {
        flex: 2,
        fontSize: '14px'
    },
    detailItemQty: {
        flex: 1,
        fontSize: '14px',
        textAlign: 'center',
        color: '#666'
    },
    detailItemPrice: {
        flex: 1,
        fontSize: '14px',
        textAlign: 'right',
        fontWeight: '600'
    }
};

// Add CSS for animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .order-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.12);
    }
`;
document.head.appendChild(styleSheet);

export default Orders;