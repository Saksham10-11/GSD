import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ProductList from "./components/products/ProductList";
import Cart from "./components/cart/Cart";
import Checkout from "./components/cart/Checkout";
import GreenMetrics from "./components/dashboard/GreenMetrics";
import Landing from "./components/auth/Landing";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./App.css";

// Protected route component to check authentication
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!currentUser) return <Navigate to="/landing" />;
  return children;
};

// Public route that redirects to landing if already logged in
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (currentUser) return <Navigate to="/" />;
  return children;
};

function AppContent() {
  const [resourceMetrics, setResourceMetrics] = useState({
    pageLoads: 0,
    apiCalls: 0,
    dataTransferred: 0,
  });

  useEffect(() => {
    setResourceMetrics((prev) => ({
      ...prev,
      pageLoads: prev.pageLoads + 1,
    }));

    return () => {
      console.log("App cleanup performed");
    };
  }, []);

  const trackApiCall = (size = 1) => {
    setResourceMetrics((prev) => ({
      ...prev,
      apiCalls: prev.apiCalls + 1,
      dataTransferred: prev.dataTransferred + size,
    }));
  };

  const { currentUser } = useAuth();

  return (
    <CartProvider>
      <div className="app-container">
        {currentUser && <Header metrics={resourceMetrics} />}

        <main className={`main-content ${!currentUser ? "full-page" : ""}`}>
          <React.Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
              <Route
                path="/landing"
                element={
                  <PublicRoute>
                    <Landing />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ProductList onApiCall={trackApiCall} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart onApiCall={trackApiCall} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout onApiCall={trackApiCall} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/green-metrics"
                element={
                  <ProtectedRoute>
                    <GreenMetrics />
                  </ProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  currentUser ? <Navigate to="/" /> : <Navigate to="/landing" />
                }
              />
            </Routes>
          </React.Suspense>
        </main>

        {currentUser && <Footer />}
      </div>
    </CartProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
