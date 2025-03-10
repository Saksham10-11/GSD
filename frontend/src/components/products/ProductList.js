import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaLeaf, FaRecycle, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const ProductList = ({ onApiCall }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    sustainableOnly: false,
    sort: 'price-asc'
  });
  
  // Get cart context
  const { addToCart } = useCart();
  
  // Fetch products with debounced API calls (green practice)
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Create query string from filters
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.sustainableOnly) queryParams.append('sustainableOnly', 'true');
      
      const response = await axios.get(`/api/products?${queryParams}`);
      
      // Track API call for metrics
      if (onApiCall) onApiCall(response.data.data.length * 0.5); // Approx KB per product
      
      let sortedProducts = [...response.data.data];
      
      // Sort products client-side to reduce server load (green practice)
      switch (filters.sort) {
        case 'price-asc':
          sortedProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          sortedProducts.sort((a, b) => b.price - a.price);
          break;
        case 'sustainability':
          sortedProducts.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
          break;
        default:
          // No sorting
      }
      
      setProducts(sortedProducts);
      setLoading(false);
    } catch (err) {
      setError('Error fetching products. Please try again.');
      setLoading(false);
      console.error('Error fetching products:', err);
    }
  }, [filters, onApiCall]);
  
  // Debounced filter change to reduce API calls (green practice)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [fetchProducts]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle adding product to cart
  const handleAddToCart = (product) => {
    addToCart(product);
  };
  
  // Render sustainability badge based on score
  const renderSustainabilityBadge = (score) => {
    if (score >= 90) {
      return (
        <div title="Excellent sustainability rating" className="eco-badge">
          <FaLeaf color="#2e7d32" />
          <span>Excellent</span>
        </div>
      );
    } else if (score >= 70) {
      return (
        <div title="Good sustainability rating" className="eco-badge">
          <FaLeaf color="#4caf50" />
          <span>Good</span>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div>
      <h1>Sustainable Products</h1>
      
      {/* Filters */}
      <div className="filters" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f1f8e9', borderRadius: '8px' }}>
        <h3>Filter Products</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="category">Category: </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Office">Office</option>
              <option value="Health">Health</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort">Sort by: </label>
            <select
              id="sort"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="sustainability">Sustainability</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="sustainableOnly"
              name="sustainableOnly"
              checked={filters.sustainableOnly}
              onChange={handleFilterChange}
              className="green-checkbox"
            />
            <label htmlFor="sustainableOnly" style={{ marginLeft: '5px', display: 'flex', alignItems: 'center' }}>
              <FaLeaf color="#2e7d32" style={{ marginRight: '5px' }} />
              Sustainable Products Only
            </label>
          </div>
        </div>
      </div>
      
      {/* Loading and Error States */}
      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}
      
      {/* Product Grid */}
      {!loading && !error && (
        <>
          <p>{products.length} products found</p>
          <div className="product-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <img
                  src={product.image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="product-image"
                  // Green practice: Use loading=lazy to defer loading offscreen images
                  loading="lazy"
                />
                
                <div className="product-info">
                  <h3 className="product-title">
                    <Link to={`/product/${product._id}`}>{product.name}</Link>
                  </h3>
                  
                  <p className="product-price">${product.price.toFixed(2)}</p>
                  
                  {/* Sustainability Indicators */}
                  <div className="sustainability-score">
                    <span>Sustainability:</span>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${product.sustainabilityScore}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {renderSustainabilityBadge(product.sustainabilityScore)}
                  
                  {product.recycledMaterials && (
                    <div className="eco-badge" title="Made with recycled materials">
                      <FaRecycle color="#4caf50" />
                      <span>Recycled</span>
                    </div>
                  )}
                  
                  {/* Carbon Footprint */}
                  <p className="carbon-info" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
                    Carbon Footprint: {product.carbonFootprint}kg CO2e
                  </p>
                  
                  <div className="product-actions">
                    <button 
                      className="btn btn-block"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FaShoppingCart style={{ marginRight: '5px' }} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {products.length === 0 && <p>No products found. Try adjusting your filters.</p>}
        </>
      )}
      
      {/* Green Software Info */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center' }}>
          <FaLeaf style={{ marginRight: '8px' }} />
          Green Shopping Tips
        </h3>
        <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
          <li>Look for products with high sustainability scores</li>
          <li>Consider the carbon footprint of each product</li>
          <li>Choose items made from recycled materials when possible</li>
          <li>Consolidate your orders to reduce shipping emissions</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductList;