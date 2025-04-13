import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLeaf, FaGoogle, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./AuthForms.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Handle email/password registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // Green practice: Efficient auth operations
      await signup(email, password);
      // TODO: Store user name in Firestore or user profile if needed

      navigate("/"); // Redirect to dashboard after successful registration
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.message || "Failed to create an account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google registration
  const handleGoogleSignup = async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/"); // Redirect to dashboard after successful registration
    } catch (error) {
      console.error("Google signup error:", error);
      setError("Failed to sign up with Google. Please try again.");
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

        <h2>Create Account</h2>
        <p className="auth-subtitle">
          Join our eco-friendly shopping community
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            </div>
          </div>

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
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-wrapper">
              <FaLock className="input-icon" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="auth-separator">
              <span>OR</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              className="btn btn-google btn-block"
              disabled={loading}
            >
              <FaGoogle /> Sign up with Google
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
          <Link to="/" className="back-home">
            Back to Home
          </Link>
        </div>
      </div>

      <div className="auth-image-container">
        <div className="eco-stats">
          <div className="eco-stat">
            <span className="number">100+</span>
            <span className="label">Sustainable Products</span>
          </div>
          <div className="eco-stat">
            <span className="number">30%</span>
            <span className="label">Average Carbon Reduction</span>
          </div>
        </div>
        <div className="auth-cta">
          <h2>Start Your Green Journey</h2>
          <p>
            Create an account to access our eco-friendly marketplace and make a
            positive impact with every purchase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
