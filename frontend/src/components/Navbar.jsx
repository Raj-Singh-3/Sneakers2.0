import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          SneakerMarket
        </Link>

        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>
            Home
          </Link>
          <Link to="/cart" style={styles.navLink}>
            Cart
          </Link>
          <Link to="/orders" style={styles.navLink}>
            Orders
          </Link>

          {user && (user.role === "seller" || user.role === "both") && (
            <Link to="/seller/dashboard" style={styles.navLink}>
              Seller Dashboard
            </Link>
          )}

          {user && (user.role === "seller" || user.role === "both") && (
            <>
              <Link to="/seller/dashboard" style={styles.navLink}>
                Seller Dashboard
              </Link>
              <Link to="/seller/products" style={styles.navLink}>
                My Products
              </Link>
              <Link to="/seller/add-product" style={styles.navLink}>
                Add Product
              </Link>
            </>
          )}

          {user ? (
            <>
              <span style={styles.userName}>Hi, {user.name}</span>
              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.navLink}>
                Login
              </Link>
              <Link to="/register" style={styles.registerButton}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#333",
    color: "white",
    padding: "1rem 0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 1rem",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "white",
    textDecoration: "none",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
  },
  userName: {
    marginLeft: "1rem",
    color: "#ccc",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  registerButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    textDecoration: "none",
    fontSize: "0.9rem",
  },
};

export default Navbar;
