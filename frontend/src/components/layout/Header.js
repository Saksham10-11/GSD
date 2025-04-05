import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaLeaf,
  FaShoppingCart,
  FaChartLine,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import "./Header.css";

const Header = ({ metrics }) => {
  const { totalItems } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [animateLeaf, setAnimateLeaf] = useState(false);

  // Green practice: Calculate energy efficiency class based on metrics
  const getEnergyClass = () => {
    if (!metrics) return "A+";

    const score =
      metrics.pageLoads + metrics.apiCalls * 2 + metrics.dataTransferred / 50;

    if (score < 10) return "A+";
    if (score < 20) return "A";
    if (score < 30) return "B";
    if (score < 50) return "C";
    return "D";
  };

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

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="header-content">
        <Link to="/" className="logo">
          <div className={`logo-icon ${animateLeaf ? "pulse" : ""}`}>
            <FaLeaf size={24} />
          </div>
          <span>Green Shop</span>
        </Link>

        {/* Energy efficiency badge */}
        <div
          className="eco-badge header-badge"
          title="Website energy efficiency rating"
        >
          <FaLeaf size={14} />
          <span>Energy Class {getEnergyClass()}</span>
        </div>

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
                <FaChartLine />
                <span>Eco Impact</span>
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
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
