import React from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaShoppingBag, FaRecycle, FaUserShield } from "react-icons/fa";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-logo">
            <FaLeaf className="logo-icon" />
            <h1>GREEN SHOP</h1>
          </div>
          <h2>Sustainable Shopping for a Better Tomorrow</h2>
          <p>
            Join our eco-friendly e-commerce platform designed with green
            software practices to minimize environmental impact.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">
              Log In
            </Link>
            <Link to="/register" className="btn btn-outline">
              Register
            </Link>
          </div>
        </div>

        <div className="eco-stats">
          <div className="eco-stat">
            <span className="number">85%</span>
            <span className="label">Lower Digital Carbon</span>
          </div>
          <div className="eco-stat">
            <span className="number">100+</span>
            <span className="label">Sustainable Products</span>
          </div>
          <div className="eco-stat">
            <span className="number">5x</span>
            <span className="label">Energy Efficiency</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose Green Shop?</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <FaLeaf className="feature-icon" />
            <h3>Eco-Friendly Platform</h3>
            <p>
              Built with green software practices to minimize energy consumption
              and carbon emissions.
            </p>
          </div>

          <div className="feature-card">
            <FaShoppingBag className="feature-icon" />
            <p>
              Curated selection of sustainable products with detailed
              environmental impact information.
            </p>
            <h3>Sustainable Products</h3>
          </div>

          <div className="feature-card">
            <FaRecycle className="feature-icon" />
            <h3>Carbon Tracking</h3>
            <p>
              Real-time tracking of your shopping carbon footprint with
              offsetting options.
            </p>
          </div>

          <div className="feature-card">
            <FaUserShield className="feature-icon" />
            <h3>Secure & Private</h3>
            <p>
              Enhanced security with minimal data collection for reduced server
              energy usage.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Start Your Green Shopping Journey</h2>
        <p>
          Join thousands of environmentally conscious shoppers making a
          difference with every purchase.
        </p>
        <div className="cta-buttons">
          <Link to="/register" className="btn btn-primary">
            Create Account
          </Link>
          <Link to="/login" className="btn btn-outline">
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>
            &copy; {new Date().getFullYear()} Green Shop. All rights reserved.
          </p>
          <p>
            Built with green software practices to reduce digital carbon
            footprint.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
