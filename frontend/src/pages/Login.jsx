import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// No need to import axios separately

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Login</h1>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={styles.button}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        Don't have an account?{' '}
                        <Link to="/register" style={styles.link}>Register here</Link>
                    </p>
                    <p style={styles.footerText}>
                        Want to sell?{' '}
                        <Link to="/register?seller=true" style={styles.link}>Register as seller</Link>
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
        maxWidth: '400px',
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
    button: {
        width: '100%',
        padding: '14px',
        fontSize: '16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '10px',
        fontWeight: '600',
        transition: 'background-color 0.3s'
    },
    buttonHover: {
        backgroundColor: '#0056b3'
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

// Add hover effects
const addHoverEffects = () => {
    const stylesWithHover = { ...styles };
    
    // Input focus
    stylesWithHover.input = {
        ...styles.input,
        ':focus': styles.inputFocus
    };
    
    // Button hover
    stylesWithHover.button = {
        ...styles.button,
        ':hover': styles.buttonHover,
        ':disabled': styles.buttonDisabled
    };
    
    // Link hover
    stylesWithHover.link = {
        ...styles.link,
        ':hover': styles.linkHover
    };
    
    return stylesWithHover;
};

export default Login;