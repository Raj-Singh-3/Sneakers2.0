import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [product, setProduct] = useState(null);
    const [sellers, setSellers] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('sellers'); // 'sellers', 'details', 'reviews'
    const [sortBy, setSortBy] = useState('price-low'); // 'price-low', 'price-high', 'rating', 'stock'

    useEffect(() => {
        if (id) {
            fetchProductDetails();
        }
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            
            // Fetch product details
            const productRes = await API.get(`/products/${id}`);
            setProduct(productRes.data);
            
            // Fetch sellers for this product
            const sellersRes = await API.get(`/products/${id}/sellers`);
            let sortedSellers = sellersRes.data;
            
            // Sort sellers
            switch (sortBy) {
                case 'price-low':
                    sortedSellers.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    sortedSellers.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    sortedSellers.sort((a, b) => (b.sellerId?.rating || 0) - (a.sellerId?.rating || 0));
                    break;
                case 'stock':
                    sortedSellers.sort((a, b) => b.stock - a.stock);
                    break;
                default:
                    break;
            }
            
            setSellers(sortedSellers);
            
            // Select first seller by default
            if (sortedSellers.length > 0 && !selectedSeller) {
                setSelectedSeller(sortedSellers[0]);
            }
            
            // TODO: Fetch reviews
            // const reviewsRes = await API.get(`/reviews/product/${id}`);
            // setReviews(reviewsRes.data);
            
        } catch (error) {
            console.error('Error fetching product details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sellers.length > 0 && sortBy) {
            const sorted = [...sellers];
            switch (sortBy) {
                case 'price-low':
                    sorted.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    sorted.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    sorted.sort((a, b) => (b.sellerId?.rating || 0) - (a.sellerId?.rating || 0));
                    break;
                case 'stock':
                    sorted.sort((a, b) => b.stock - a.stock);
                    break;
                default:
                    break;
            }
            setSellers(sorted);
        }
    }, [sortBy]);

    const handleAddToCart = async () => {
        if (!selectedSeller) return;
        
        if (quantity > selectedSeller.stock) {
            alert(`Only ${selectedSeller.stock} items available in stock`);
            return;
        }

        setAddingToCart(true);
        try {
            await API.post('/cart/add', {
                sellerProductId: selectedSeller._id,
                quantity: quantity
            });
            alert(`Added ${quantity} item(s) to cart from ${selectedSeller.sellerId?.shopName || 'seller'}!`);
            navigate('/cart');
        } catch (error) {
            alert('Error adding to cart: ' + (error.response?.data?.error || error.message));
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
    if (!selectedSeller) return;
    
    if (quantity > selectedSeller.stock) {
        alert(`Only ${selectedSeller.stock} items available in stock`);
        return;
    }

    setAddingToCart(true);
    try {
        // For Buy Now, create direct order
        const shippingAddress = {
            street: 'Temporary Address',
            city: 'City',
            state: 'State',
            zipCode: '123456',
            country: 'India'
        };

        const orderData = {
            sellerProductId: selectedSeller._id,
            quantity: quantity,
            shippingAddress: shippingAddress,
            paymentMethod: 'cod' // Cash on Delivery for now
        };

        const response = await API.post('/orders/direct', orderData);
        
        alert('Order placed successfully! Order ID: ' + response.data.order.orderId);
        
        // Navigate to orders page
        navigate('/orders');
        
    } catch (error) {
        alert('Error placing order: ' + (error.response?.data?.error || error.message));
    } finally {
        setAddingToCart(false);
    }
};

    const calculateSavings = () => {
        if (sellers.length < 2) return 0;
        
        const prices = sellers.map(s => s.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        
        return maxPrice - minPrice;
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div>
                <Navbar />
                <div style={styles.container}>
                    <div style={styles.errorContainer}>
                        <h2>Product Not Found</h2>
                        <p>The product you're looking for doesn't exist.</p>
                        <Link to="/" style={styles.backButton}>
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const savings = calculateSavings();

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                {/* Breadcrumb */}
                <div style={styles.breadcrumb}>
                    <Link to="/" style={styles.breadcrumbLink}>Home</Link>
                    <span style={styles.breadcrumbSeparator}> / </span>
                    <Link to="/" style={styles.breadcrumbLink}>Products</Link>
                    <span style={styles.breadcrumbSeparator}> / </span>
                    <span style={styles.breadcrumbCurrent}>{product.name}</span>
                </div>

                {/* Product Header */}
                <div style={styles.productHeader}>
                    {/* Product Images */}
                    <div style={styles.imageGallery}>
                        {product.images && product.images.length > 0 ? (
                            <>
                                <div style={styles.mainImage}>
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        style={styles.productMainImage}
                                    />
                                </div>
                                <div style={styles.thumbnailContainer}>
                                    {product.images.slice(0, 4).map((img, index) => (
                                        <div key={index} style={styles.thumbnail}>
                                            <img
                                                src={img}
                                                alt={`${product.name} ${index + 1}`}
                                                style={styles.thumbnailImage}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={styles.noImage}>
                                <div style={styles.noImagePlaceholder}>
                                    No Image Available
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Summary */}
                    <div style={styles.productSummary}>
                        <h1 style={styles.productTitle}>{product.name}</h1>
                        <div style={styles.brandCategory}>
                            <span style={styles.brand}>{product.brand}</span>
                            <span style={styles.category}>{product.category}</span>
                        </div>
                        
                        {/* Price Summary */}
                        <div style={styles.priceSummary}>
                            {sellers.length > 0 ? (
                                <>
                                    <div style={styles.priceRange}>
                                        <span style={styles.priceFrom}>Price Range: </span>
                                        <span style={styles.lowestPrice}>
                                            ₹{Math.min(...sellers.map(s => s.price))}
                                        </span>
                                        <span style={styles.priceTo}> - ₹{Math.max(...sellers.map(s => s.price))}</span>
                                    </div>
                                    {savings > 0 && (
                                        <div style={styles.savingsBadge}>
                                            Save up to ₹{savings} by comparing sellers!
                                        </div>
                                    )}
                                    <div style={styles.sellerCount}>
                                        Available from {sellers.length} seller{sellers.length !== 1 ? 's' : ''}
                                    </div>
                                </>
                            ) : (
                                <div style={styles.noSellers}>
                                    <p>No sellers available for this product</p>
                                    {user && (user.role === 'seller' || user.role === 'both') && (
                                        <Link 
                                            to={`/seller/add-product?productId=${product._id}`}
                                            style={styles.beFirstSeller}
                                        >
                                            Be the first to sell this product
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Seller Info */}
                        {selectedSeller && (
                            <div style={styles.selectedSellerInfo}>
                                <h3 style={styles.selectedSellerTitle}>Selected Seller:</h3>
                                <div style={styles.sellerCard}>
                                    <div style={styles.sellerHeader}>
                                        <span style={styles.sellerName}>
                                            {selectedSeller.sellerId?.shopName || 'Unknown Seller'}
                                        </span>
                                        <div style={styles.sellerRating}>
                                            ⭐ {selectedSeller.sellerId?.rating || 'No ratings'}
                                        </div>
                                    </div>
                                    <div style={styles.sellerDetails}>
                                        <div style={styles.sellerPrice}>
                                            <span style={styles.priceLabel}>Price: </span>
                                            <span style={styles.priceValue}>₹{selectedSeller.price}</span>
                                        </div>
                                        <div style={styles.sellerStock}>
                                            <span style={styles.stockLabel}>In Stock: </span>
                                            <span style={styles.stockValue}>{selectedSeller.stock} units</span>
                                        </div>
                                        <div style={styles.sellerCondition}>
                                            <span style={styles.conditionLabel}>Condition: </span>
                                            <span style={styles.conditionValue}>{selectedSeller.condition}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity and Actions */}
                        {selectedSeller && (
                            <div style={styles.actionSection}>
                                <div style={styles.quantitySelector}>
                                    <label style={styles.quantityLabel}>Quantity:</label>
                                    <div style={styles.quantityControls}>
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={styles.quantityButton}
                                            disabled={quantity <= 1}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value > 0 && value <= selectedSeller.stock) {
                                                    setQuantity(value);
                                                }
                                            }}
                                            min="1"
                                            max={selectedSeller.stock}
                                            style={styles.quantityInput}
                                        />
                                        <button
                                            onClick={() => setQuantity(Math.min(selectedSeller.stock, quantity + 1))}
                                            style={styles.quantityButton}
                                            disabled={quantity >= selectedSeller.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div style={styles.stockInfo}>
                                        Max: {selectedSeller.stock} units available
                                    </div>
                                </div>

                                <div style={styles.totalPrice}>
                                    <span>Total: </span>
                                    <span style={styles.totalAmount}>
                                        ₹{selectedSeller.price * quantity}
                                    </span>
                                </div>

                                <div style={styles.actionButtons}>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart || selectedSeller.stock === 0}
                                        style={styles.addToCartButton}
                                    >
                                        {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={addingToCart || selectedSeller.stock === 0}
                                        style={styles.buyNowButton}
                                    >
                                        {addingToCart ? 'Processing...' : '⚡ Buy Now'}
                                    </button>
                                </div>

                                {selectedSeller.stock === 0 && (
                                    <div style={styles.outOfStock}>
                                        ⚠️ This seller is currently out of stock
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabsContainer}>
                    <div style={styles.tabs}>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'sellers' ? styles.activeTab : {})
                            }}
                            onClick={() => setActiveTab('sellers')}
                        >
                            Compare Sellers ({sellers.length})
                        </button>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'details' ? styles.activeTab : {})
                            }}
                            onClick={() => setActiveTab('details')}
                        >
                            Product Details
                        </button>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'reviews' ? styles.activeTab : {})
                            }}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({reviews.length})
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div style={styles.tabContent}>
                    {/* Sellers Comparison Tab */}
                    {activeTab === 'sellers' && (
                        <div style={styles.sellersTab}>
                            <div style={styles.sellersHeader}>
                                <h2>Available Sellers - Price Comparison</h2>
                                <div style={styles.sortControls}>
                                    <label style={styles.sortLabel}>Sort by:</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={styles.sortSelect}
                                    >
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                        <option value="rating">Seller Rating</option>
                                        <option value="stock">Stock Available</option>
                                    </select>
                                </div>
                            </div>

                            {sellers.length === 0 ? (
                                <div style={styles.noSellersMessage}>
                                    <p>No sellers are currently offering this product.</p>
                                    {user && (user.role === 'seller' || user.role === 'both') && (
                                        <Link 
                                            to={`/seller/add-product?productId=${product._id}`}
                                            style={styles.addProductButton}
                                        >
                                            + Add this product to your inventory
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div style={styles.sellersGrid}>
                                    {sellers.map((seller, index) => (
                                        <div
                                            key={seller._id}
                                            style={{
                                                ...styles.sellerCardGrid,
                                                borderColor: selectedSeller?._id === seller._id ? '#3498db' : '#e0e0e0',
                                                backgroundColor: selectedSeller?._id === seller._id ? '#f0f8ff' : 'white'
                                            }}
                                            onClick={() => setSelectedSeller(seller)}
                                        >
                                            <div style={styles.sellerCardHeader}>
                                                <div style={styles.sellerRank}>
                                                    #{index + 1}
                                                </div>
                                                <div style={styles.sellerNameGrid}>
                                                    <h4 style={styles.sellerShopName}>
                                                        {seller.sellerId?.shopName || 'Unknown Seller'}
                                                    </h4>
                                                    <div style={styles.sellerRatingGrid}>
                                                        ⭐ {seller.sellerId?.rating || 'No ratings'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={styles.sellerCardDetails}>
                                                <div style={styles.sellerPriceGrid}>
                                                    <span style={styles.priceLabelGrid}>Price:</span>
                                                    <span style={styles.priceValueGrid}>
                                                        ₹{seller.price}
                                                    </span>
                                                </div>
                                                <div style={styles.sellerStockGrid}>
                                                    <span style={styles.stockLabelGrid}>Stock:</span>
                                                    <span style={styles.stockValueGrid}>
                                                        {seller.stock} units
                                                    </span>
                                                </div>
                                                <div style={styles.sellerConditionGrid}>
                                                    <span style={styles.conditionLabelGrid}>Condition:</span>
                                                    <span style={styles.conditionValueGrid}>
                                                        {seller.condition}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={styles.sellerCardActions}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedSeller(seller);
                                                    }}
                                                    style={styles.selectButton}
                                                >
                                                    {selectedSeller?._id === seller._id ? '✓ Selected' : 'Select Seller'}
                                                </button>
                                                {seller.description && (
                                                    <div style={styles.sellerDescription}>
                                                        {seller.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Product Details Tab */}
                    {activeTab === 'details' && (
                        <div style={styles.detailsTab}>
                            <h2>Product Details</h2>
                            <div style={styles.descriptionSection}>
                                <h3>Description</h3>
                                <p style={styles.descriptionText}>{product.description}</p>
                            </div>

                            {product.specifications && Object.keys(product.specifications).length > 0 && (
                                <div style={styles.specificationsSection}>
                                    <h3>Specifications</h3>
                                    <div style={styles.specificationsGrid}>
                                        {Object.entries(product.specifications).map(([key, value]) => (
                                            <div key={key} style={styles.specItem}>
                                                <span style={styles.specKey}>{key}:</span>
                                                <span style={styles.specValue}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.tags && product.tags.length > 0 && (
                                <div style={styles.tagsSection}>
                                    <h3>Tags</h3>
                                    <div style={styles.tagsContainer}>
                                        {product.tags.map(tag => (
                                            <span key={tag} style={styles.tag}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div style={styles.reviewsTab}>
                            <h2>Customer Reviews</h2>
                            {reviews.length === 0 ? (
                                <div style={styles.noReviews}>
                                    <p>No reviews yet. Be the first to review this product!</p>
                                    <button style={styles.writeReviewButton}>
                                        Write a Review
                                    </button>
                                </div>
                            ) : (
                                <div style={styles.reviewsList}>
                                    {reviews.map(review => (
                                        <div key={review._id} style={styles.reviewItem}>
                                            <div style={styles.reviewHeader}>
                                                <div style={styles.reviewRating}>
                                                    {'⭐'.repeat(review.rating)}
                                                </div>
                                                <div style={styles.reviewAuthor}>
                                                    {review.userId?.name || 'Anonymous'}
                                                </div>
                                                <div style={styles.reviewDate}>
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <p style={styles.reviewComment}>{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Related Products or Back Button */}
                <div style={styles.footerActions}>
                    <Link to="/" style={styles.backButton}>
                        ← Back to All Products
                    </Link>
                    <Link to="/cart" style={styles.viewCartButton}>
                        View Cart →
                    </Link>
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
        textAlign: 'center',
        padding: '60px 20px'
    },
    breadcrumb: {
        marginBottom: '30px',
        fontSize: '14px',
        color: '#666'
    },
    breadcrumbLink: {
        color: '#3498db',
        textDecoration: 'none'
    },
    breadcrumbSeparator: {
        margin: '0 10px',
        color: '#999'
    },
    breadcrumbCurrent: {
        color: '#666',
        fontWeight: '600'
    },
    productHeader: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '40px'
    },
    imageGallery: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    mainImage: {
        marginBottom: '20px'
    },
    productMainImage: {
        width: '100%',
        height: '400px',
        objectFit: 'contain',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
    },
    thumbnailContainer: {
        display: 'flex',
        gap: '10px'
    },
    thumbnail: {
        flex: 1,
        cursor: 'pointer'
    },
    thumbnailImage: {
        width: '100%',
        height: '80px',
        objectFit: 'cover',
        borderRadius: '6px',
        border: '2px solid #e0e0e0'
    },
    noImage: {
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    noImagePlaceholder: {
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        color: '#999',
        fontSize: '16px'
    },
    productSummary: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    productTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '15px'
    },
    brandCategory: {
        display: 'flex',
        gap: '20px',
        marginBottom: '25px'
    },
    brand: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        padding: '5px 15px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600'
    },
    category: {
        backgroundColor: '#f3e5f5',
        color: '#7b1fa2',
        padding: '5px 15px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600'
    },
    priceSummary: {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
    },
    priceRange: {
        fontSize: '18px',
        marginBottom: '10px'
    },
    priceFrom: {
        color: '#666'
    },
    lowestPrice: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2ecc71',
        margin: '0 5px'
    },
    priceTo: {
        color: '#666'
    },
    savingsBadge: {
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '8px 15px',
        borderRadius: '20px',
        display: 'inline-block',
        fontSize: '14px',
        marginBottom: '10px'
    },
    sellerCount: {
        color: '#666',
        fontSize: '14px'
    },
    noSellers: {
        textAlign: 'center',
        padding: '20px'
    },
    beFirstSeller: {
        display: 'inline-block',
        marginTop: '10px',
        padding: '10px 20px',
        backgroundColor: '#f39c12',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px'
    },
    selectedSellerInfo: {
        marginBottom: '30px'
    },
    selectedSellerTitle: {
        fontSize: '18px',
        marginBottom: '15px',
        color: '#2c3e50'
    },
    sellerCard: {
        border: '2px solid #3498db',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f0f8ff'
    },
    sellerHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    sellerName: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    sellerRating: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '14px'
    },
    sellerDetails: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px'
    },
    sellerPrice: {
        textAlign: 'center'
    },
    priceLabel: {
        display: 'block',
        fontSize: '12px',
        color: '#666',
        marginBottom: '5px'
    },
    priceValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    sellerStock: {
        textAlign: 'center'
    },
    stockLabel: {
        display: 'block',
        fontSize: '12px',
        color: '#666',
        marginBottom: '5px'
    },
    stockValue: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#3498db'
    },
    sellerCondition: {
        textAlign: 'center'
    },
    conditionLabel: {
        display: 'block',
        fontSize: '12px',
        color: '#666',
        marginBottom: '5px'
    },
    conditionValue: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#7f8c8d',
        textTransform: 'capitalize'
    },
    actionSection: {
        marginTop: '30px'
    },
    quantitySelector: {
        marginBottom: '20px'
    },
    quantityLabel: {
        display: 'block',
        marginBottom: '10px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    quantityControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '5px'
    },
    quantityButton: {
        width: '40px',
        height: '40px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    quantityInput: {
        width: '80px',
        height: '40px',
        textAlign: 'center',
        fontSize: '18px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    stockInfo: {
        fontSize: '12px',
        color: '#666',
        marginTop: '5px'
    },
    totalPrice: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '20px',
        textAlign: 'right'
    },
    totalAmount: {
        color: '#2ecc71',
        fontSize: '28px'
    },
    actionButtons: {
        display: 'flex',
        gap: '15px'
    },
    addToCartButton: {
        flex: 2,
        padding: '15px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    buyNowButton: {
        flex: 1,
        padding: '15px',
        backgroundColor: '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    outOfStock: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '6px',
        textAlign: 'center'
    },
    tabsContainer: {
        marginBottom: '30px'
    },
    tabs: {
        display: 'flex',
        borderBottom: '2px solid #e0e0e0'
    },
    tab: {
        padding: '15px 30px',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: '3px solid transparent',
        fontSize: '16px',
        fontWeight: '600',
        color: '#666',
        cursor: 'pointer',
        transition: 'all 0.3s'
    },
    activeTab: {
        color: '#3498db',
        borderBottomColor: '#3498db',
        backgroundColor: '#f8f9fa'
    },
    tabContent: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minHeight: '400px'
    },
    sellersTab: {},
    sellersHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
    },
    sortControls: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    sortLabel: {
        fontSize: '14px',
        color: '#666'
    },
    sortSelect: {
        padding: '8px 15px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        backgroundColor: 'white'
    },
    noSellersMessage: {
        textAlign: 'center',
        padding: '60px 20px'
    },
    addProductButton: {
        display: 'inline-block',
        marginTop: '20px',
        padding: '12px 24px',
        backgroundColor: '#f39c12',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '600'
    },
    sellersGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    sellerCardGrid: {
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s'
    },
    sellerCardHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
    },
    sellerRank: {
        backgroundColor: '#3498db',
        color: 'white',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '18px',
        marginRight: '15px'
    },
    sellerNameGrid: {
        flex: 1
    },
    sellerShopName: {
        margin: '0 0 5px 0',
        fontSize: '16px',
        color: '#2c3e50'
    },
    sellerRatingGrid: {
        fontSize: '14px',
        color: '#f39c12'
    },
    sellerCardDetails: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '15px'
    },
    sellerPriceGrid: {
        textAlign: 'center'
    },
    priceLabelGrid: {
        display: 'block',
        fontSize: '12px',
        color: '#666',
        marginBottom: '5px'
    },
    priceValueGrid: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2ecc71'
    },
    sellerStockGrid: {
        textAlign: 'center'
    },
    stockLabelGrid: {
        display: 'block',
        fontSize: '12px',
        color: '#666',
        marginBottom: '5px'
    },
    stockValueGrid: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#3498db'
    },
    sellerConditionGrid: {
        textAlign: 'center'
    },
    conditionLabelGrid: {
        display: 'block',
        fontSize: '12px',
        color: '#666',
        marginBottom: '5px'
    },
    conditionValueGrid: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#7f8c8d',
        textTransform: 'capitalize'
    },
    sellerCardActions: {},
    selectButton: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '10px'
    },
    sellerDescription: {
        fontSize: '12px',
        color: '#666',
        fontStyle: 'italic'
    },
    detailsTab: {},
    descriptionSection: {
        marginBottom: '30px'
    },
    descriptionText: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#333'
    },
    specificationsSection: {
        marginBottom: '30px'
    },
    specificationsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '15px'
    },
    specItem: {
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px'
    },
    specKey: {
        display: 'block',
        fontSize: '12px',
        color: '#666',
        marginBottom: '5px'
    },
    specValue: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2c3e50'
    },
    tagsSection: {},
    tagsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px'
    },
    tag: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        padding: '5px 15px',
        borderRadius: '20px',
        fontSize: '14px'
    },
    reviewsTab: {},
    noReviews: {
        textAlign: 'center',
        padding: '60px 20px'
    },
    writeReviewButton: {
        padding: '12px 30px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '20px'
    },
    reviewsList: {},
    reviewItem: {
        padding: '20px',
        borderBottom: '1px solid #eee',
        marginBottom: '20px'
    },
    reviewHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '15px'
    },
    reviewRating: {
        color: '#f39c12',
        fontSize: '18px'
    },
    reviewAuthor: {
        fontWeight: '600',
        color: '#2c3e50'
    },
    reviewDate: {
        color: '#666',
        fontSize: '14px'
    },
    reviewComment: {
        fontSize: '16px',
        lineHeight: '1.5',
        color: '#333'
    },
    footerActions: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #eee'
    },
    backButton: {
        padding: '12px 24px',
        backgroundColor: '#f8f9fa',
        color: '#2c3e50',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '600'
    },
    viewCartButton: {
        padding: '12px 24px',
        backgroundColor: '#3498db',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontWeight: '600'
    }
};

// Add CSS for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .seller-card-grid:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
document.head.appendChild(styleSheet);

export default ProductDetail;