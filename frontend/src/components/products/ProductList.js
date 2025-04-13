import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  FaLeaf,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import axios from "axios";
import mockData from "../../data/mockProducts";

const ProductList = ({ onApiCall }) => {
  const { addToCart, updateQuantity, removeFromCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [productImages, setProductImages] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });
  const [filters, setFilters] = useState({
    category: "",
    sort: "price-asc",
    page: 1,
    limit: 10,
  });
  const fetchTimeoutRef = useRef(null);

  // Memoize cache key to prevent unnecessary API calls
  const getCacheKey = useCallback(() => {
    return `products-${filters.category}-${filters.sort}-${filters.page}-${filters.limit}`;
  }, [filters]);

  // Fetch product images - optimized for fewer API calls
  const fetchProductImages = useCallback(
    async (productsToFetch) => {
      if (!productsToFetch.length) return;

      // To reduce API calls, we'll batch process images
      const productsNeedingImages = productsToFetch.filter(
        (item) => !sessionStorage.getItem(`img-${item._id}`)
      );

      if (!productsNeedingImages.length) {
        // If we have all images cached, just use the cache
        const cachedImages = {};
        productsToFetch.forEach((product) => {
          const cachedImage = sessionStorage.getItem(`img-${product._id}`);
          if (cachedImage) {
            cachedImages[product._id] = cachedImage;
          }
        });
        setProductImages((prev) => ({ ...prev, ...cachedImages }));
        return;
      }

      try {
        // Get API key from environment variables
        const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;

        if (!PEXELS_API_KEY) {
          throw new Error("Pexels API key not found in environment variables");
        }

        // Process in smaller batches to be environmentally friendly (fewer API calls)
        const batchSize = 3;
        for (let i = 0; i < productsNeedingImages.length; i += batchSize) {
          const batch = productsNeedingImages.slice(i, i + batchSize);

          // Track batch API call
          if (onApiCall) onApiCall(1);

          await Promise.all(
            batch.map(async (product) => {
              try {
                const query = encodeURIComponent(
                  product.category || product.name
                );
                const response = await fetch(
                  `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`,
                  {
                    headers: {
                      Authorization: PEXELS_API_KEY,
                    },
                  }
                );

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.photos && data.photos.length > 0) {
                  // Use smaller image size for better energy efficiency
                  const imageUrl = data.photos[0].src.medium;
                  setProductImages((prev) => ({
                    ...prev,
                    [product._id]: imageUrl,
                  }));

                  // Cache the image for future use
                  sessionStorage.setItem(`img-${product._id}`, imageUrl);
                }
              } catch (err) {
                console.error(`Error fetching image for ${product.name}:`, err);
              }
            })
          );

          // Add a small delay between batches to be respectful to the API
          if (i + batchSize < productsNeedingImages.length) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      } catch (err) {
        console.error("Error fetching product images:", err);
      }
    },
    [onApiCall]
  ); // Dependencies array

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get from cache first (green practice: reduces API calls)
      const cacheKey = getCacheKey();
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // Use cache if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          if (data.data && Array.isArray(data.data)) {
            setProducts(data.data);
            setPagination({
              currentPage: data.page || filters.page,
              totalPages: data.pages || 1,
              totalProducts: data.total || data.data.length,
            });
          } else if (Array.isArray(data)) {
            setProducts(data);
            setPagination({
              currentPage: filters.page,
              totalPages: 1,
              totalProducts: data.length,
            });
          }
          setUsingMockData(false);
          setLoading(false);
          return;
        }
      }

      // Track API call for resource metrics
      if (onApiCall) onApiCall(1);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      params.append("sort", filters.sort);
      params.append("page", filters.page);
      params.append("limit", filters.limit);

      const response = await axios.get(`/api/products?${params.toString()}`);
      const responseData = response.data;

      console.log("API Response:", responseData);

      // Cache the result (green practice: reduces API calls)
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: responseData,
          timestamp: Date.now(),
        })
      );

      // Handle the API response
      if (
        responseData &&
        responseData.data &&
        Array.isArray(responseData.data)
      ) {
        setProducts(responseData.data);
        setPagination({
          currentPage: responseData.page || filters.page,
          totalPages: responseData.pages || 1,
          totalProducts:
            responseData.total ||
            responseData.count ||
            responseData.data.length,
        });
      } else if (Array.isArray(responseData)) {
        setProducts(responseData);
        setPagination({
          currentPage: filters.page,
          totalPages: 1,
          totalProducts: responseData.length,
        });
      } else {
        throw new Error("Invalid response format");
      }

      setUsingMockData(false);
      fetchProductImages(responseData.data || responseData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Unable to load products. Using demo data instead.");

      // Use mock data when API call fails
      const solarSpeakerData = [
        {
          _id: "solar-speaker-1",
          name: "Solar Bluetooth Speaker",
          price: 79.0,
          category: "Electronics",
          description:
            "Environmentally friendly bluetooth speaker with built-in solar charging panel",
          sustainabilityScore: 95,
          carbonFootprint: 3.2,
          recycledMaterials: true,
          image: "/images/solar-speaker.jpg",
        },
        ...mockData,
      ];

      setProducts(solarSpeakerData);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalProducts: solarSpeakerData.length,
      });
      setUsingMockData(true);
      fetchProductImages(solarSpeakerData);
    } finally {
      setLoading(false);
    }
  }, [filters, onApiCall, getCacheKey, fetchProductImages]);

  // Debounced filter change to reduce API calls (green practice)
  useEffect(() => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set a longer debounce time to reduce API calls
    fetchTimeoutRef.current = setTimeout(() => {
      fetchProducts();
    }, 800); // Increased from 300ms to 800ms

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchProducts]);

  // Initial load - fetch only once when component mounts
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter changes - memoized to prevent recreation on every render
  const handleFilterChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // Handle adding product to cart - memoized to prevent recreation on every render
  const handleAddToCart = useCallback(
    (product) => {
      addToCart(product);
    },
    [addToCart]
  );

  // Handle quantity update - memoized to prevent recreation on every render
  const handleUpdateQuantity = useCallback(
    (productId, newQuantity) => {
      updateQuantity(productId, newQuantity);
    },
    [updateQuantity]
  );

  // Handle removing product from cart - memoized to prevent recreation on every render
  const handleRemoveFromCart = useCallback(
    (productId) => {
      removeFromCart(productId);
    },
    [removeFromCart]
  );

  return (
    <div className="product-list-container">
      {/* Mock Data Notice */}
      {usingMockData && (
        <div className="notification-banner">
          <FaInfoCircle style={{ marginRight: "8px" }} />
          <span>
            Currently showing demo products. The backend server might be
            unavailable.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <h3>
          <FaFilter style={{ marginRight: "8px" }} /> Filter Products
        </h3>
        <div className="filter-grid">
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
              <option value="Home">Home</option>
              <option value="Furniture">Furniture</option>
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
            </select>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading sustainable products...</p>
        </div>
      ) : error && !usingMockData ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="products-info">
            <p>
              <strong>{pagination.totalProducts}</strong> products found
              {!usingMockData && (
                <span>
                  {" "}
                  (showing page {pagination.currentPage} of{" "}
                  {pagination.totalPages})
                </span>
              )}
            </p>
          </div>

          <div className="featured-product">
            {products &&
              products.length > 0 &&
              products[0]._id === "solar-speaker-1" && (
                <div className="product-spotlight">
                  <div className="product-image-container">
                    <img
                      src={
                        productImages[products[0]._id] ||
                        products[0].image ||
                        "https://via.placeholder.com/300x300?text=Solar+Speaker"
                      }
                      alt={products[0].name}
                      className="featured-image"
                    />
                  </div>
                  <div className="product-details">
                    <h1 className="featured-title">{products[0].name}</h1>
                    <div className="featured-price">
                      ${products[0].price.toFixed(2)}
                    </div>
                    <p className="featured-description">
                      {products[0].description}
                    </p>
                    <button
                      onClick={() => handleAddToCart(products[0])}
                      className="btn add-to-cart"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              )}
          </div>

          <h2>All Products</h2>
          <div className="product-grid">
            {products &&
              products.map(
                (product, index) =>
                  // Skip the first product if it's the featured one
                  (product._id !== "solar-speaker-1" || index !== 0) && (
                    <div key={product._id} className="product-card">
                      <img
                        src={
                          productImages[product._id] ||
                          product.image ||
                          `https://via.placeholder.com/300x300?text=${encodeURIComponent(
                            product.name
                          )}`
                        }
                        alt={product.name}
                        className="product-image"
                        loading="lazy" // Green practice: lazy loading
                      />
                      <div className="product-info">
                        <h3 className="product-title">{product.name}</h3>
                        <div className="product-price">
                          ${product.price.toFixed(2)}
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          className="btn"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  )
              )}
          </div>

          {products && products.length === 0 && (
            <p>No products found. Try adjusting your filters.</p>
          )}

          {pagination.totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={pagination.currentPage === 1}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: prev.page - 1,
                  }))
                }
                aria-label="Previous page"
              >
                <FaChevronLeft /> Previous
              </button>

              <div className="pagination-info">
                <span>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <select
                  className="limit-select"
                  name="limit"
                  value={filters.limit}
                  onChange={handleFilterChange}
                  aria-label="Items per page"
                >
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="20">20 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>

              <button
                className="pagination-btn"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: prev.page + 1,
                  }))
                }
                aria-label="Next page"
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(ProductList); // Green practice: memoize component to prevent unnecessary re-renders
