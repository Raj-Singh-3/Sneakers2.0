import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const SellerProducts = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        price: '',
        stock: '',
        condition: 'new',
        description: ''
    });

    useEffect(() => {
        fetchSellerProducts();
    }, []);

    const fetchSellerProducts = async () => {
        try {
            const response = await API.get('/products/seller/my-products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching seller products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product._id);
        setEditForm({
            price: product.price,
            stock: product.stock,
            condition: product.condition,
            description: product.description || ''
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProduct = async (productId) => {
        try {
            await API.put(`/products/seller/${productId}`, editForm);
            setEditingProduct(null);
            fetchSellerProducts(); // Refresh list
            alert('Product updated successfully!');
        } catch (error) {
            alert('Error updating product: ' + error.response?.data?.error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to remove this product from your inventory?')) {
            try {
                await API.delete(`/products/seller/${productId}`);
                fetchSellerProducts(); // Refresh list
                alert('Product removed from inventory!');
            } catch (error) {
                alert('Error deleting product: ' + error.response?.data?.error);
            }
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div style={styles.loadingContainer}>
                    <div>Loading your products...</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1>My Products</h1>
                    <Link to="/seller/add-product" style={styles.addButton}>
                        + Add New Product
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div style={styles.emptyState}>
                        <h3>No products in your inventory</h3>
                        <p>Start by adding products to sell</p>
                        <Link to="/seller/add-product" style={styles.primaryButton}>
                            Add Your First Product
                        </Link>
                    </div>
                ) : (
                    <div style={styles.productsGrid}>
                        {products.map(product => (
                            <div key={product._id} style={styles.productCard}>
                                {product.productId?.images?.[0] && (
                                    <img
                                        src={product.productId.images[0]}
                                        alt={product.productId?.name}
                                        style={styles.productImage}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }}
                                    />
                                )}
                                
                                <div style={styles.productInfo}>
                                    <h3 style={styles.productName}>
                                        {product.productId?.name || 'Unknown Product'}
                                    </h3>
                                    <p style={styles.productBrand}>
                                        Brand: {product.productId?.brand || 'N/A'}
                                    </p>
                                    <p style={styles.productCategory}>
                                        Category: {product.productId?.category || 'N/A'}
                                    </p>

                                    {editingProduct === product._id ? (
                                        <div style={styles.editForm}>
                                            <div style={styles.formGroup}>
                                                <label>Price (₹)</label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={editForm.price}
                                                    onChange={handleEditChange}
                                                    style={styles.editInput}
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label>Stock</label>
                                                <input
                                                    type="number"
                                                    name="stock"
                                                    value={editForm.stock}
                                                    onChange={handleEditChange}
                                                    style={styles.editInput}
                                                    min="0"
                                                />
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label>Condition</label>
                                                <select
                                                    name="condition"
                                                    value={editForm.condition}
                                                    onChange={handleEditChange}
                                                    style={styles.editSelect}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="used">Used</option>
                                                    <option value="refurbished">Refurbished</option>
                                                </select>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label>Description</label>
                                                <textarea
                                                    name="description"
                                                    value={editForm.description}
                                                    onChange={handleEditChange}
                                                    style={styles.editTextarea}
                                                    rows="2"
                                                />
                                            </div>
                                            <div style={styles.editActions}>
                                                <button
                                                    onClick={() => handleUpdateProduct(product._id)}
                                                    style={styles.saveButton}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingProduct(null)}
                                                    style={styles.cancelButton}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={styles.productDetails}>
                                                <p style={styles.price}>₹{product.price}</p>
                                                <p>Stock: {product.stock}</p>
                                                <p>Condition: {product.condition}</p>
                                                <p>Status: {product.isActive ? 'Active' : 'Inactive'}</p>
                                                {product.description && (
                                                    <p style={styles.description}>
                                                        {product.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div style={styles.productActions}>
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    style={styles.editButton}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    style={styles.deleteButton}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={styles.stats}>
                    <div style={styles.statCard}>
                        <h3>Total Products</h3>
                        <p style={styles.statNumber}>{products.length}</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>Active Products</h3>
                        <p style={styles.statNumber}>
                            {products.filter(p => p.isActive).length}
                        </p>
                    </div>
                    <div style={styles.statCard}>
                        <h3>Total Stock</h3>
                        <p style={styles.statNumber}>
                            {products.reduce((sum, p) => sum + p.stock, 0)}
                        </p>
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
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    addButton: {
        padding: '12px 24px',
        backgroundColor: '#28a745',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '600'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
    },
    emptyState: {
        textAlign: 'center',
        padding: '50px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '30px'
    },
    primaryButton: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '12px 30px',
        backgroundColor: '#3498db',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: '600'
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '25px',
        marginBottom: '40px'
    },
    productCard: {
        backgroundColor: 'white',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    productImage: {
        width: '100%',
        height: '200px',
        objectFit: 'cover'
    },
    productInfo: {
        padding: '20px'
    },
    productName: {
        fontSize: '18px',
        marginBottom: '10px',
        color: '#333'
    },
    productBrand: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '5px'
    },
    productCategory: {
        color: '#888',
        fontSize: '12px',
        marginBottom: '15px'
    },
    productDetails: {
        marginBottom: '15px'
    },
    price: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#28a745',
        marginBottom: '10px'
    },
    description: {
        fontSize: '14px',
        color: '#666',
        marginTop: '10px',
        fontStyle: 'italic'
    },
    productActions: {
        display: 'flex',
        gap: '10px'
    },
    editButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    deleteButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    editForm: {
        marginTop: '15px'
    },
    formGroup: {
        marginBottom: '10px'
    },
    editInput: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    editSelect: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: 'white'
    },
    editTextarea: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        resize: 'vertical',
        fontFamily: 'inherit'
    },
    editActions: {
        display: 'flex',
        gap: '10px',
        marginTop: '15px'
    },
    saveButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    cancelButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    },
    stats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '30px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    statNumber: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#3498db',
        marginTop: '10px'
    }
};

export default SellerProducts;