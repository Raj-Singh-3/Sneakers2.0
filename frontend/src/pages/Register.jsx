import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobile: '',
        role: 'buyer'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check URL for seller registration
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('seller') === 'true') {
            setFormData(prev => ({ ...prev, role: 'seller' }));
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Remove confirmPassword from data sent to backend
            const { confirmPassword, ...registerData } = formData;
            await register(registerData);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Create Account</h1>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Enter your full name"
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Mobile Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="Enter your mobile number"
                        />
                    </div>
                    
                    <div style={styles.formRow}>
                        <div style={styles.formGroupHalf}>
                            <label style={styles.label}>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="Create password"
                            />
                        </div>
                        
                        <div style={styles.formGroupHalf}>
                            <label style={styles.label}>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="Confirm password"
                            />
                        </div>
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Register as</label>
                        <div style={styles.radioGroup}>
                            <label style={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="buyer"
                                    checked={formData.role === 'buyer'}
                                    onChange={handleChange}
                                    style={styles.radioInput}
                                />
                                <span style={styles.radioText}>Buyer</span>
                            </label>
                            
                            <label style={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="seller"
                                    checked={formData.role === 'seller'}
                                    onChange={handleChange}
                                    style={styles.radioInput}
                                />
                                <span style={styles.radioText}>Seller</span>
                            </label>
                            
                            <label style={styles.radioLabel}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="both"
                                    checked={formData.role === 'both'}
                                    onChange={handleChange}
                                    style={styles.radioInput}
                                />
                                <span style={styles.radioText}>Both</span>
                            </label>
                        </div>
                    </div>
                    
                    {formData.role === 'seller' || formData.role === 'both' ? (
                        <div style={styles.sellerNote}>
                            <p style={styles.noteText}>
                                As a seller, you'll be able to list products, manage inventory, and process orders.
                            </p>
                        </div>
                    ) : null}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Already have an account?{' '}
                        <Link to="/login" style={styles.link}>Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px',
        transition: 'transform 0.3s ease'
    },
    title: {
        marginBottom: '30px',
        textAlign: 'center',
        color: '#333',
        fontSize: '28px',
        fontWeight: '600'
    },
    formGroup: {
        marginBottom: '20px'
    },
    formRow: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px'
    },
    formGroupHalf: {
        flex: 1
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#555',
        fontSize: '14px',
        fontWeight: '500'
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        fontSize: '16px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        transition: 'border-color 0.3s',
        boxSizing: 'border-box'
    },
    inputFocus: {
        borderColor: '#007bff',
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.1)'
    },
    radioGroup: {
        display: 'flex',
        gap: '20px',
        marginTop: '8px'
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
    },
    radioInput: {
        marginRight: '8px',
        cursor: 'pointer'
    },
    radioText: {
        color: '#555',
        fontSize: '15px'
    },
    sellerNote: {
        backgroundColor: '#e7f3ff',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '20px',
        borderLeft: '4px solid #007bff'
    },
    noteText: {
        margin: 0,
        color: '#0066cc',
        fontSize: '14px',
        lineHeight: '1.5'
    },
    button: {
        width: '100%',
        padding: '14px',
        fontSize: '16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '10px',
        fontWeight: '600',
        transition: 'background-color 0.3s'
    },
    buttonHover: {
        backgroundColor: '#218838'
    },
    buttonDisabled: {
        backgroundColor: '#6c757d',
        cursor: 'not-allowed'
    },
    error: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '14px',
        textAlign: 'center'
    },
    footer: {
        marginTop: '30px',
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid #eee'
    },
    footerText: {
        margin: '8px 0',
        color: '#666',
        fontSize: '14px'
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: '500'
    },
    linkHover: {
        textDecoration: 'underline'
    }
};

export default Register;