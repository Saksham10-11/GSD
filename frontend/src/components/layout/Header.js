import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaLeaf,
  FaShoppingCart,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

const Header = ({ metrics }) => {
  const { totalItems } = useCart();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [animateLeaf, setAnimateLeaf] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Periodically animate the leaf icon
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateLeaf(true);
      setTimeout(() => setAnimateLeaf(false), 2000);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".user-menu")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/landing");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Format user display name
  const getUserDisplayName = () => {
    if (!currentUser) return "";

    if (currentUser.displayName) {
      return currentUser.displayName;
    } else {
      // Use email as fallback, but only show part before @ symbol
      const email = currentUser.email || "";
      return email.split("@")[0];
    }
  };

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="header-content">
        <Link to="/" className="logo">
          <div className={`logo-icon ${animateLeaf ? "pulse" : ""}`}>
            <FaLeaf size={24} />
          </div>
          <span>GREEN SHOP</span>
        </Link>

        <nav>
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/green-metrics"
                className={
                  location.pathname === "/green-metrics" ? "active" : ""
                }
              >
                Eco Impact
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                className={`cart-icon ${
                  location.pathname === "/cart" ? "active" : ""
                }`}
              >
                <div className="cart-icon-container">
                  <FaShoppingCart size={20} />
                  {totalItems > 0 && (
                    <span className="cart-count">{totalItems}</span>
                  )}
                </div>
              </Link>
            </li>
            <li className="user-menu">
              <button
                className="user-dropdown-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaUserCircle size={20} />
                <span className="user-name">{getUserDisplayName()}</span>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <FaUserCircle size={20} />
                    <span>{currentUser?.email}</span>
                  </div>

                  <button className="logout-button" onClick={handleLogout}>
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
