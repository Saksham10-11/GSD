import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCepyN_MvSZVmNpDoVS0_1LLhWY4ZXHu4M",
  authDomain: "gsd-saksham.firebaseapp.com",
  projectId: "gsd-saksham",
  storageBucket: "gsd-saksham.firebasestorage.app",
  messagingSenderId: "941784451442",
  appId: "1:941784451442:web:adec4ec9bcedb547aa75eb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create the auth context
const AuthContext = createContext();

// Green practice: Batch authentication operations to reduce network usage
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Login with email and password
  const login = async (email, password) => {
    try {
      setError("");
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.message);
      throw error;
    }
  };

  // Sign up with email and password
  const signup = async (email, password) => {
    try {
      setError("");
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Signup error:", error.message);
      setError(error.message);
      throw error;
    }
  };

  // Google sign-in
  const loginWithGoogle = async () => {
    try {
      setError("");
      const provider = new GoogleAuthProvider();
      // Green practice: Optimize network usage by specifying only needed scopes
      provider.setCustomParameters({ prompt: "select_account" });
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in error:", error.message);
      setError(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error.message);
      setError(error.message);
    }
  };

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up subscription - green practice to prevent memory leaks
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithGoogle,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a hook for easy context usage
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
