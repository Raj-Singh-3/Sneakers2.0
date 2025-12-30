import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, selectedCategory, sortBy]);

    const fetchProducts = async () => {
        try {
            const response = await API.get('/products');
            const productsWithPrices = await Promise.all(
                response.data.map(async (product) => {
                    try {
                        const sellersResponse = await API.get(`/products/${product._id}/sellers`);
                        const sellers = sellersResponse.data;
                        const lowestPrice = sellers.length > 0 
                            ? Math.min(...sellers.map(s => s.price))
                            : null;
                        const highestPrice = sellers.length > 0 
                            ? Math.max(...sellers.map(s => s.price))
                            : null;
                        
                        // Extract unique categories
                        const categories = [...new Set(response.data.map(p => p.category))];
                        setCategories(categories);

                        return {
                            ...product,
                            sellerCount: sellers.length,
                            lowestPrice,
                            highestPrice,
                            sellers
                        };
                    } catch (error) {
                        return {
                            ...product,
                            sellerCount: 0,
                            lowestPrice: null,
                            highestPrice: null,
                            sellers: []
                        };
                    }
                })
            );
            setProducts(productsWithPrices);
            setFilteredProducts(productsWithPrices);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let result = [...products];

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(term) ||
                product.brand.toLowerCase().includes(term) ||
                product.description.toLowerCase().includes(term) ||
                product.tags?.some(tag => tag.toLowerCase().includes(term))
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            result = result.filter(product => product.category === selectedCategory);
        }

        // Sort products
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => (a.lowestPrice || Infinity) - (b.lowestPrice || Infinity));
                break;
            case 'price-high':
                result.sort((a, b) => (b.highestPrice || 0) - (a.highestPrice || 0));
                break;
            case 'sellers':
                result.sort((a, b) => b.sellerCount - a.sellerCount);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                break;
        }

        setFilteredProducts(result);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        filterProducts();
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSortBy('newest');
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                {/* Hero Section */}
                <div style={styles.heroSection}>
                    <h1 style={styles.heroTitle}>🎯 SneakerMarket</h1>
                    <p style={styles.heroSubtitle}>
                        Compare prices from multiple sellers and get the best deals on sneakers!
                    </p>
                    
                    {user && (
                        <div style={styles.welcomeMessage}>
                            <p style={styles.welcomeText}>
                                Welcome back, <strong>{user.name}</strong>! ({user.role})
                            </p>
                            {user.role === 'buyer' && (
                                <p style={styles.welcomeTip}>
                                    👟 Compare prices and choose the best seller
                                </p>
                            )}
                            {user.role === 'seller' && (
                                <p style={styles.welcomeTip}>
                                    🛍️ List your products and reach thousands of buyers
                                </p>
                            )}
                            {user.role === 'both' && (
                                <p style={styles.welcomeTip}>
                                    👥 Switch between buyer and seller modes
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Search and Filters */}
                <div style={styles.filtersContainer}>
                    <form onSubmit={handleSearch} style={styles.searchForm}>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search sneakers, brands, categories..."
                            style={styles.searchInput}
                        />
                        <button type="submit" style={styles.searchButton}>
                            🔍 Search
                        </button>
                        {(searchTerm || selectedCategory !== 'all' || sortBy !== 'newest') && (
                            <button 
                                type="button" 
                                onClick={handleClearFilters}
                                style={styles.clearButton}
                            >
                                Clear Filters
                            </button>
                        )}
                    </form>

                    <div style={styles.filterRow}>
                        {/* Category Filter */}
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Category:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="all">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort Filter */}
                        <div style={styles.filterGroup}>
                            <label style={styles.filterLabel}>Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={styles.filterSelect}
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="sellers">Most Sellers</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div style={styles.statsBar}>
                    <div style={styles.statItem}>
                        <span style={styles.statNumber}>{filteredProducts.length}</span>
                        <span style={styles.statLabel}>Products</span>
                    </div>
                    <div style={styles.statItem}>
                        <span style={styles.statNumber}>
                            {filteredProducts.reduce((sum, p) => sum + p.sellerCount, 0)}
                        </span>
                        <span style={styles.statLabel}>Total Sellers</span>
                    </div>
                    <div style={styles.statItem}>
                        <span style={styles.statNumber}>
                            {categories.length}
                        </span>
                        <span style={styles.statLabel}>Categories</span>
                    </div>
                </div>

                {/* Products Grid */}
                <div style={styles.productsGrid}>
                    {filteredProducts.length === 0 ? (
                        <div style={styles.noProducts}>
                            <h3>No products found</h3>
                            <p>Try adjusting your search or filters</p>
                            <button 
                                onClick={handleClearFilters}
                                style={styles.resetButton}
                            >
                                Show All Products
                            </button>
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <ProductCard key={product._id} product={product} user={user} />
                        ))
                    )}
                </div>

                {/* Quick Actions */}
                <div style={styles.quickActions}>
                    <h2 style={styles.quickActionsTitle}>Quick Actions</h2>
                    <div style={styles.actionButtons}>
                        <Link to="/cart" style={styles.actionButton}>
                            🛒 View Cart
                        </Link>
                        <Link to="/orders" style={styles.actionButton}>
                            📦 My Orders
                        </Link>
                        {user && (user.role === 'seller' || user.role === 'both') && (
                            <>
                                <Link to="/seller/add-product" style={styles.actionButton}>
                                    ➕ Add Product
                                </Link>
                                <Link to="/seller/dashboard" style={styles.actionButton}>
                                    📊 Seller Dashboard
                                </Link>
                            </>
                        )}
                        {(!user || user.role === 'buyer') && (
                            <Link to="/seller/dashboard" style={styles.actionButton}>
                                🛍️ Become a Seller
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Product Card Component
const ProductCard = ({ product, user }) => {
    const [showSellers, setShowSellers] = useState(false);

    return (
        <div style={styles.productCard}>
            {/* Product Image */}
            <div style={styles.imageContainer}>
                {product.images && product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        style={styles.productImage}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/300x200/eee/ccc?text=No+Image';
                        }}
                    />
                ) : (
                    <div style={styles.imagePlaceholder}>
                        No Image
                    </div>
                )}
                {product.sellerCount > 0 && (
                    <div style={styles.sellerBadge}>
                        {product.sellerCount} seller{product.sellerCount !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div style={styles.productInfo}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productBrand}>{product.brand}</p>
                <p style={styles.productCategory}>{product.category}</p>
                
                {/* Price Range */}
                {product.lowestPrice !== null ? (
                    <div style={styles.priceSection}>
                        <div style={styles.priceRange}>
                            <span style={styles.priceFrom}>From </span>
                            <span style={styles.lowestPrice}>₹{product.lowestPrice}</span>
                            {product.highestPrice > product.lowestPrice && (
                                <span style={styles.priceTo}> to ₹{product.highestPrice}</span>
                            )}
                        </div>
                        <p style={styles.sellerInfo}>
                            Compare prices from {product.sellerCount} seller{product.sellerCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                ) : (
                    <div style={styles.noPrice}>
                        <p>No sellers available</p>
                        {user && (user.role === 'seller' || user.role === 'both') && (
                            <Link 
                                to={`/seller/add-product?productId=${product._id}`}
                                style={styles.addToListingButton}
                            >
                                Be the first seller
                            </Link>
                        )}
                    </div>
                )}

                {/* Quick Actions */}
                <div style={styles.productActions}>
                    <Link 
                        to={`/product/${product._id}`}
                        style={styles.viewButton}
                    >
                        {product.sellerCount > 0 ? 'Compare & Buy' : 'View Details'}
                    </Link>
                    
                    {product.sellerCount > 0 && (
                        <button
                            onClick={() => setShowSellers(!showSellers)}
                            style={styles.sellersButton}
                        >
                            {showSellers ? 'Hide Sellers' : 'Show Sellers'}
                        </button>
                    )}
                </div>

                {/* Seller List (Expanded) */}
                {showSellers && product.sellers && product.sellers.length > 0 && (
                    <div style={styles.sellersList}>
                        <h4 style={styles.sellersTitle}>Available Sellers:</h4>
                        {product.sellers.slice(0, 3).map((seller, index) => (
                            <div key={index} style={styles.sellerItem}>
                                <span style={styles.sellerName}>
                                    {seller.sellerId?.shopName || 'Unknown Seller'}
                                </span>
                                <span style={styles.sellerPrice}>₹{seller.price}</span>
                                <span style={styles.sellerStock}>{seller.stock} in stock</span>
                            </div>
                        ))}
                        {product.sellers.length > 3 && (
                            <p style={styles.moreSellers}>
                                +{product.sellers.length - 3} more sellers
                            </p>
                        )}
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
        padding: '20px',
        minHeight: '100vh'
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
    heroSection: {
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },
    heroTitle: {
        fontSize: '48px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '15px'
    },
    heroSubtitle: {
        fontSize: '18px',
        color: '#7f8c8d',
        marginBottom: '25px',
        maxWidth: '600px',
        margin: '0 auto'
    },
    welcomeMessage: {
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        padding: '15px',
        borderRadius: '10px',
        marginTop: '20px',
        display: 'inline-block'
    },
    welcomeText: {
        margin: '0 0 10px 0',
        color: '#2c3e50',
        fontSize: '16px'
    },
    welcomeTip: {
        margin: '0',
        fontSize: '14px',
        color: '#7f8c8d'
    },
    filtersContainer: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
        marginBottom: '30px'
    },
    searchForm: {
        display: 'flex',
        gap: '15px',
        marginBottom: '25px',
        alignItems: 'center'
    },
    searchInput: {
        flex: 1,
        padding: '14px 20px',
        fontSize: '16px',
        border: '2px solid #e0e0e0',
        borderRadius: '30px',
        outline: 'none',
        transition: 'border-color 0.3s'
    },
    searchButton: {
        padding: '14px 30px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        whiteSpace: 'nowrap'
    },
    clearButton: {
        padding: '14px 20px',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        whiteSpace: 'nowrap'
    },
    filterRow: {
        display: 'flex',
        gap: '30px',
        alignItems: 'center'
    },
    filterGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    filterLabel: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2c3e50',
        minWidth: '80px'
    },
    filterSelect: {
        padding: '10px 15px',
        fontSize: '16px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: 'white',
        minWidth: '200px'
    },
    statsBar: {
        display: 'flex',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 2px 15px rgba(0,0,0,0.05)'
    },
    statItem: {
        textAlign: 'center',
        padding: '15px'
    },
    statNumber: {
        display: 'block',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: '5px'
    },
    statLabel: {
        fontSize: '14px',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    productsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
    },
    noProducts: {
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px'
    },
    resetButton: {
        padding: '12px 30px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        marginTop: '20px'
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    },
    productCardHover: {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
    },
    imageContainer: {
        position: 'relative',
        height: '220px',
        overflow: 'hidden'
    },
    productImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.5s'
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '14px'
    },
    sellerBadge: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        backgroundColor: 'rgba(52, 152, 219, 0.9)',
        color: 'white',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backdropFilter: 'blur(5px)'
    },
    productInfo: {
        padding: '25px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    productName: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '8px',
        lineHeight: '1.3'
    },
    productBrand: {
        fontSize: '14px',
        color: '#3498db',
        marginBottom: '5px',
        fontWeight: '500'
    },
    productCategory: {
        fontSize: '12px',
        color: '#95a5a6',
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    priceSection: {
        marginBottom: '25px'
    },
    priceRange: {
        marginBottom: '8px'
    },
    priceFrom: {
        fontSize: '14px',
        color: '#7f8c8d'
    },
    lowestPrice: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2ecc71',
        margin: '0 5px'
    },
    priceTo: {
        fontSize: '16px',
        color: '#7f8c8d'
    },
    sellerInfo: {
        fontSize: '13px',
        color: '#95a5a6',
        margin: '0'
    },
    noPrice: {
        marginBottom: '25px'
    },
    addToListingButton: {
        display: 'inline-block',
        padding: '8px 16px',
        backgroundColor: '#f39c12',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        marginTop: '10px'
    },
    productActions: {
        display: 'flex',
        gap: '10px',
        marginTop: 'auto'
    },
    viewButton: {
        flex: 2,
        padding: '12px',
        backgroundColor: '#3498db',
        color: 'white',
        textDecoration: 'none',
        textAlign: 'center',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600'
    },
    sellersButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#f8f9fa',
        color: '#2c3e50',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    sellersList: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    sellersTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '10px'
    },
    sellerItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #eee'
    },
    sellerName: {
        fontSize: '13px',
        color: '#2c3e50',
        flex: 2
    },
    sellerPrice: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2ecc71',
        flex: 1,
        textAlign: 'center'
    },
    sellerStock: {
        fontSize: '12px',
        color: '#7f8c8d',
        flex: 1,
        textAlign: 'right'
    },
    moreSellers: {
        fontSize: '12px',
        color: '#3498db',
        textAlign: 'center',
        marginTop: '10px',
        cursor: 'pointer'
    },
    quickActions: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    },
    quickActionsTitle: {
        textAlign: 'center',
        fontSize: '24px',
        color: '#2c3e50',
        marginBottom: '25px'
    },
    actionButtons: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '15px'
    },
    actionButton: {
        padding: '15px 30px',
        backgroundColor: '#f8f9fa',
        color: '#2c3e50',
        textDecoration: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '500',
        border: '2px solid transparent',
        transition: 'all 0.3s',
        minWidth: '180px',
        textAlign: 'center'
    },
    actionButtonHover: {
        backgroundColor: '#3498db',
        color: 'white',
        borderColor: '#3498db',
        transform: 'translateY(-2px)'
    }
};

// Add CSS for animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }
    
    .product-image:hover {
        transform: scale(1.05);
    }
    
    .action-button:hover {
        background-color: #3498db;
        color: white;
        border-color: #3498db;
        transform: translateY(-2px);
    }
    
    input:focus, select:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
    
    button:hover, .link-button:hover {
        opacity: 0.9;
    }
`;
document.head.appendChild(styleSheet);

export default Home;