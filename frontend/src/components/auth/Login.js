import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLeaf, FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./AuthForms.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // Green practice: Using low-energy auth approach (batch operations)
      await login(email, password);
      navigate("/"); // Redirect to dashboard after successful login
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.message || "Failed to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/"); // Redirect to dashboard after successful login
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-logo">
          <FaLeaf className="logo-icon" />
          <h1>GREEN SHOP</h1>
        </div>

        <h2>Welcome Back</h2>
        <p className="auth-subtitle">
          Sign in to continue your sustainable shopping journey
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="auth-separator">
              <span>OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn btn-google btn-block"
              disabled={loading}
            >
              <FaGoogle /> Continue with Google
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
          <Link to="/" className="back-home">
            Back to Home
          </Link>
        </div>
      </div>

      <div className="auth-image-container">
        <div className="eco-stats">
          <div className="eco-stat">
            <span className="number">85%</span>
            <span className="label">Lower Digital Carbon</span>
          </div>
          <div className="eco-stat">
            <span className="number">5x</span>
            <span className="label">Energy Efficiency</span>
          </div>
        </div>
        <div className="auth-cta">
          <h2>Shop Sustainably</h2>
          <p>
            Join our community of eco-conscious shoppers and reduce your carbon
            footprint with every purchase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
