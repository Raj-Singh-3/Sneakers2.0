import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const SellerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSellerData();
    }, []);

    const fetchSellerData = async () => {
        try {
            const response = await axios.get('/api/orders/seller/orders');
            setOrders(response.data);
            
            // Calculate stats
            const totalOrders = response.data.length;
            const pendingOrders = response.data.filter(o => o.status !== 'delivered').length;
            const totalRevenue = response.data.reduce((sum, order) => {
                return sum + (order.orderId?.totalAmount || 0);
            }, 0);
            
            setStats({ totalOrders, pendingOrders, totalRevenue });
        } catch (error) {
            console.error('Error fetching seller data:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateShipment = async (shipmentId, updates) => {
        try {
            await axios.put(`/api/orders/shipment/${shipmentId}`, updates);
            fetchSellerData();
            alert('Shipment updated successfully!');
        } catch (error) {
            alert('Error updating shipment: ' + error.response?.data?.error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <h1>Seller Dashboard</h1>
                
                {/* Stats Cards */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <h3>Total Orders</h3>
                        <p style={styles.statNumber}>{stats.totalOrders}</p>
                    </div>
                    
                    <div style={styles.statCard}>
                        <h3>Pending Orders</h3>
                        <p style={styles.statNumber}>{stats.pendingOrders}</p>
                    </div>
                    
                    <div style={styles.statCard}>
                        <h3>Total Revenue</h3>
                        <p style={styles.statNumber}>₹{stats.totalRevenue}</p>
                    </div>
                </div>
                
                {/* Orders List */}
                <div style={styles.ordersSection}>
                    <h2>Recent Orders</h2>
                    
                    {orders.length === 0 ? (
                        <p>No orders yet</p>
                    ) : (
                        <div style={styles.ordersTable}>
                            <div style={styles.tableHeader}>
                                <div style={styles.tableCell}>Order ID</div>
                                <div style={styles.tableCell}>Customer</div>
                                <div style={styles.tableCell}>Items</div>
                                <div style={styles.tableCell}>Status</div>
                                <div style={styles.tableCell}>Actions</div>
                            </div>
                            
                            {orders.map(shipment => (
                                <div key={shipment._id} style={styles.tableRow}>
                                    <div style={styles.tableCell}>
                                        {shipment.orderId?.orderId}
                                    </div>
                                    <div style={styles.tableCell}>
                                        {shipment.orderId?.userId?.name}
                                    </div>
                                    <div style={styles.tableCell}>
                                        {shipment.orderId?.items?.length || 0} items
                                    </div>
                                    <div style={styles.tableCell}>
                                        <select
                                            value={shipment.status}
                                            onChange={(e) => updateShipment(shipment._id, { 
                                                status: e.target.value 
                                            })}
                                            style={styles.statusSelect}
                                        >
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="in_transit">In Transit</option>
                                            <option value="out_for_delivery">Out for Delivery</option>
                                            <option value="delivered">Delivered</option>
                                        </select>
                                    </div>
                                    <div style={styles.tableCell}>
                                        <button 
                                            onClick={() => {
                                                const location = prompt('Enter current location:');
                                                if (location) {
                                                    updateShipment(shipment._id, { 
                                                        currentLocation: location,
                                                        description: 'Location updated'
                                                    });
                                                }
                                            }}
                                            style={styles.actionButton}
                                        >
                                            Update Location
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    statCard: {
        padding: '1.5rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        textAlign: 'center'
    },
    statNumber: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#007bff',
        margin: '0.5rem 0'
    },
    ordersSection: {
        marginTop: '2rem'
    },
    ordersTable: {
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
    },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        fontWeight: 'bold',
        borderBottom: '1px solid #ddd'
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
        padding: '1rem',
        borderBottom: '1px solid #ddd',
        alignItems: 'center'
    },
    tableCell: {
        padding: '0.5rem'
    },
    statusSelect: {
        padding: '0.25rem 0.5rem',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    actionButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem'
    }
};

export default SellerDashboard;