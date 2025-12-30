import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const SellerAddProduct = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'existing'
    const [existingProducts, setExistingProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form for new product
    const [newProductForm, setNewProductForm] = useState({
        name: '',
        brand: '',
        category: '',
        description: '',
        price: '',
        stock: '',
        condition: 'new',
        images: [''],
        specifications: [{ key: '', value: '' }]
    });

    // Form for existing product
    const [existingProductForm, setExistingProductForm] = useState({
        productId: '',
        price: '',
        stock: '',
        condition: 'new',
        description: ''
    });

    useEffect(() => {
        if (user && (user.role === 'seller' || user.role === 'both')) {
            fetchExistingProducts();
        } else {
            navigate('/');
        }
    }, [user, navigate]);

    const fetchExistingProducts = async () => {
        try {
            const response = await API.get('/products');
            setExistingProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleNewProductChange = (e) => {
        const { name, value } = e.target;
        setNewProductForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExistingProductChange = (e) => {
        const { name, value } = e.target;
        setExistingProductForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSpecification = () => {
        setNewProductForm(prev => ({
            ...prev,
            specifications: [...prev.specifications, { key: '', value: '' }]
        }));
    };

    const handleSpecificationChange = (index, field, value) => {
        const updatedSpecs = [...newProductForm.specifications];
        updatedSpecs[index][field] = value;
        setNewProductForm(prev => ({
            ...prev,
            specifications: updatedSpecs
        }));
    };

    const handleRemoveSpecification = (index) => {
        const updatedSpecs = newProductForm.specifications.filter((_, i) => i !== index);
        setNewProductForm(prev => ({
            ...prev,
            specifications: updatedSpecs
        }));
    };

    const handleAddImage = () => {
        setNewProductForm(prev => ({
            ...prev,
            images: [...prev.images, '']
        }));
    };

    const handleImageChange = (index, value) => {
        const updatedImages = [...newProductForm.images];
        updatedImages[index] = value;
        setNewProductForm(prev => ({
            ...prev,
            images: updatedImages
        }));
    };

    const handleRemoveImage = (index) => {
        const updatedImages = newProductForm.images.filter((_, i) => i !== index);
        setNewProductForm(prev => ({
            ...prev,
            images: updatedImages
        }));
    };

    const handleCreateNewProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Filter out empty specifications and images
            const validSpecs = newProductForm.specifications.filter(
                spec => spec.key.trim() && spec.value.trim()
            );
            const validImages = newProductForm.images.filter(img => img.trim());

            const specificationsObj = {};
            validSpecs.forEach(spec => {
                specificationsObj[spec.key] = spec.value;
            });

            const productData = {
                name: newProductForm.name,
                brand: newProductForm.brand,
                category: newProductForm.category,
                description: newProductForm.description,
                price: parseFloat(newProductForm.price),
                stock: parseInt(newProductForm.stock),
                condition: newProductForm.condition,
                images: validImages,
                specifications: specificationsObj,
                tags: []
            };

            const response = await API.post('/products/seller/new', productData);
            
            setMessage({
                type: 'success',
                text: 'Product created successfully!'
            });

            // Reset form
            setNewProductForm({
                name: '',
                brand: '',
                category: '',
                description: '',
                price: '',
                stock: '',
                condition: 'new',
                images: [''],
                specifications: [{ key: '', value: '' }]
            });

            // Navigate to seller products page after 2 seconds
            setTimeout(() => {
                navigate('/seller/products');
            }, 2000);

        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to create product'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddExistingProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const productData = {
                productId: existingProductForm.productId,
                price: parseFloat(existingProductForm.price),
                stock: parseInt(existingProductForm.stock),
                condition: existingProductForm.condition,
                description: existingProductForm.description
            };

            const response = await API.post('/products/seller/add-existing', productData);
            
            setMessage({
                type: 'success',
                text: 'Product added to your inventory successfully!'
            });

            // Reset form
            setExistingProductForm({
                productId: '',
                price: '',
                stock: '',
                condition: 'new',
                description: ''
            });

            // Navigate to seller products page after 2 seconds
            setTimeout(() => {
                navigate('/seller/products');
            }, 2000);

        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to add product'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = existingProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <Navbar />
            <div style={styles.container}>
                <h1 style={styles.title}>Add Product to Sell</h1>
                
                {message.text && (
                    <div style={{
                        ...styles.message,
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'new' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('new')}
                    >
                        Create New Product
                    </button>
                    <button
                        style={{
                            ...styles.tabButton,
                            ...(activeTab === 'existing' ? styles.activeTab : {})
                        }}
                        onClick={() => setActiveTab('existing')}
                    >
                        Add Existing Product
                    </button>
                </div>

                {/* New Product Form */}
                {activeTab === 'new' && (
                    <form onSubmit={handleCreateNewProduct} style={styles.form}>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newProductForm.name}
                                    onChange={handleNewProductChange}
                                    required
                                    style={styles.input}
                                    placeholder="e.g., Nike Air Force 1"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Brand *</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={newProductForm.brand}
                                    onChange={handleNewProductChange}
                                    required
                                    style={styles.input}
                                    placeholder="e.g., Nike"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Category *</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={newProductForm.category}
                                    onChange={handleNewProductChange}
                                    required
                                    style={styles.input}
                                    placeholder="e.g., Sneakers, Running Shoes"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Price (₹) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={newProductForm.price}
                                    onChange={handleNewProductChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    style={styles.input}
                                    placeholder="e.g., 7999"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Stock *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={newProductForm.stock}
                                    onChange={handleNewProductChange}
                                    required
                                    min="0"
                                    style={styles.input}
                                    placeholder="e.g., 10"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Condition *</label>
                                <select
                                    name="condition"
                                    value={newProductForm.condition}
                                    onChange={handleNewProductChange}
                                    style={styles.select}
                                >
                                    <option value="new">New</option>
                                    <option value="used">Used</option>
                                    <option value="refurbished">Refurbished</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Description *</label>
                            <textarea
                                name="description"
                                value={newProductForm.description}
                                onChange={handleNewProductChange}
                                required
                                rows="4"
                                style={styles.textarea}
                                placeholder="Describe your product..."
                            />
                        </div>

                        {/* Images Section */}
                        <div style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <h3 style={styles.sectionTitle}>Images</h3>
                                <button
                                    type="button"
                                    onClick={handleAddImage}
                                    style={styles.addButton}
                                >
                                    + Add Image URL
                                </button>
                            </div>
                            {newProductForm.images.map((image, index) => (
                                <div key={index} style={styles.arrayItem}>
                                    <input
                                        type="text"
                                        value={image}
                                        onChange={(e) => handleImageChange(index, e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        style={styles.input}
                                    />
                                    {newProductForm.images.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            style={styles.removeButton}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Specifications Section */}
                        <div style={styles.section}>
                            <div style={styles.sectionHeader}>
                                <h3 style={styles.sectionTitle}>Specifications</h3>
                                <button
                                    type="button"
                                    onClick={handleAddSpecification}
                                    style={styles.addButton}
                                >
                                    + Add Specification
                                </button>
                            </div>
                            {newProductForm.specifications.map((spec, index) => (
                                <div key={index} style={styles.arrayItem}>
                                    <input
                                        type="text"
                                        value={spec.key}
                                        onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                        placeholder="e.g., Color"
                                        style={styles.specInput}
                                    />
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                        placeholder="e.g., White"
                                        style={styles.specInput}
                                    />
                                    {newProductForm.specifications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSpecification(index)}
                                            style={styles.removeButton}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={styles.submitButton}
                        >
                            {loading ? 'Creating Product...' : 'Create & List Product'}
                        </button>
                    </form>
                )}

                {/* Existing Product Form */}
                {activeTab === 'existing' && (
                    <div>
                        {/* Product Search */}
                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search existing products..."
                                style={styles.searchInput}
                            />
                        </div>

                        <div style={styles.existingProductsGrid}>
                            {filteredProducts.map(product => (
                                <div
                                    key={product._id}
                                    style={{
                                        ...styles.productCard,
                                        borderColor: existingProductForm.productId === product._id ? '#3498db' : '#ddd'
                                    }}
                                    onClick={() => setExistingProductForm(prev => ({
                                        ...prev,
                                        productId: product._id
                                    }))}
                                >
                                    {product.images && product.images[0] && (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            style={styles.productImage}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                            }}
                                        />
                                    )}
                                    <div style={styles.productInfo}>
                                        <h4 style={styles.productName}>{product.name}</h4>
                                        <p style={styles.productBrand}>{product.brand}</p>
                                        <p style={styles.productCategory}>{product.category}</p>
                                        <p style={styles.productDescription}>
                                            {product.description.substring(0, 100)}...
                                        </p>
                                        <div style={styles.selectIndicator}>
                                            {existingProductForm.productId === product._id ? '✓ Selected' : 'Click to select'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {existingProductForm.productId && (
                            <form onSubmit={handleAddExistingProduct} style={styles.form}>
                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Your Price (₹) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={existingProductForm.price}
                                            onChange={handleExistingProductChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            style={styles.input}
                                            placeholder="Set your price"
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Your Stock *</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={existingProductForm.stock}
                                            onChange={handleExistingProductChange}
                                            required
                                            min="0"
                                            style={styles.input}
                                            placeholder="Available quantity"
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Condition *</label>
                                        <select
                                            name="condition"
                                            value={existingProductForm.condition}
                                            onChange={handleExistingProductChange}
                                            style={styles.select}
                                        >
                                            <option value="new">New</option>
                                            <option value="used">Used</option>
                                            <option value="refurbished">Refurbished</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Your Description (Optional)</label>
                                    <textarea
                                        name="description"
                                        value={existingProductForm.description}
                                        onChange={handleExistingProductChange}
                                        rows="3"
                                        style={styles.textarea}
                                        placeholder="Add your specific description..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={styles.submitButton}
                                >
                                    {loading ? 'Adding Product...' : 'Add to My Inventory'}
                                </button>
                            </form>
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
        padding: '20px'
    },
    title: {
        fontSize: '28px',
        marginBottom: '30px',
        color: '#333'
    },
    message: {
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '14px'
    },
    tabs: {
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '1px solid #ddd',
        paddingBottom: '10px'
    },
    tabButton: {
        padding: '10px 20px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '6px 6px 0 0',
        cursor: 'pointer',
        fontSize: '16px'
    },
    activeTab: {
        backgroundColor: '#3498db',
        color: 'white',
        borderColor: '#3498db'
    },
    form: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '600',
        color: '#555'
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        boxSizing: 'border-box'
    },
    select: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: 'white'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        resize: 'vertical',
        fontFamily: 'inherit'
    },
    section: {
        marginBottom: '30px',
        padding: '20px',
        border: '1px solid #eee',
        borderRadius: '6px'
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    sectionTitle: {
        fontSize: '18px',
        color: '#333'
    },
    addButton: {
        padding: '8px 16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    arrayItem: {
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '10px'
    },
    specInput: {
        flex: 1,
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '4px'
    },
    removeButton: {
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    submitButton: {
        width: '100%',
        padding: '15px',
        fontSize: '18px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        marginTop: '20px'
    },
    searchContainer: {
        marginBottom: '20px'
    },
    searchInput: {
        width: '100%',
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '6px'
    },
    existingProductsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    productCard: {
        border: '2px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        cursor: 'pointer',
        transition: 'border-color 0.3s'
    },
    productImage: {
        width: '100%',
        height: '150px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '10px'
    },
    productInfo: {
        textAlign: 'center'
    },
    productName: {
        fontSize: '16px',
        marginBottom: '5px'
    },
    productBrand: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '5px'
    },
    productCategory: {
        color: '#888',
        fontSize: '12px',
        marginBottom: '10px'
    },
    productDescription: {
        fontSize: '12px',
        color: '#999',
        marginBottom: '10px'
    },
    selectIndicator: {
        fontSize: '12px',
        color: '#3498db',
        fontWeight: '600'
    }
};

export default SellerAddProduct;