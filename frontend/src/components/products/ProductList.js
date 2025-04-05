import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaRecycle,
  FaShoppingCart,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import axiosInstance, { getMockProducts } from "../../utils/axiosConfig";

const ProductList = ({ onApiCall }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    sustainableOnly: false,
    sort: "price-asc",
    page: 1,
    limit: 10, // Default items per page
  });
  const [usingMockData, setUsingMockData] = useState(false);
  const [productImages, setProductImages] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  });

  // Cache reference to avoid unnecessary API calls
  const productsCache = useRef({});
  const imageCache = useRef({});
  const lastFetchTime = useRef(0);
  const fetchTimeoutRef = useRef(null);

  // Get cart context
  const { addToCart } = useCart();

  // Generate a cache key from the current filters
  const getCacheKey = useCallback(() => {
    return `${filters.category}_${filters.sustainableOnly}_${filters.sort}_${filters.page}_${filters.limit}`;
  }, [filters]);

  // Fetch images from Pexels API
  const fetchProductImages = useCallback(
    async (productsList) => {
      if (!productsList.length) return;

      // To reduce API calls, we'll batch process images
      const productsNeedingImages = productsList.filter(
        (product) => !imageCache.current[product._id]
      );

      if (!productsNeedingImages.length) {
        // If we have all images cached, just use the cache
        const cachedImages = {};
        productsList.forEach((product) => {
          cachedImages[product._id] = imageCache.current[product._id];
        });
        setProductImages(cachedImages);
        return;
      }

      setImageLoading(true);
      const images = { ...productImages };

      try {
        // Get API key from environment variables
        const PEXELS_API_KEY = process.env.REACT_APP_PEXELS_API_KEY;

        if (!PEXELS_API_KEY) {
          throw new Error("Pexels API key not found in environment variables");
        }

        // Process in smaller batches to be environmentally friendly (fewer API calls)
        const batchSize = 5;
        for (let i = 0; i < productsNeedingImages.length; i += batchSize) {
          const batch = productsNeedingImages.slice(i, i + batchSize);

          await Promise.all(
            batch.map(async (product) => {
              try {
                // Use product category and name for better search results
                const searchTerm = `${product.category} ${product.name}`;
                const response = await fetch(
                  `https://api.pexels.com/v1/search?query=${encodeURIComponent(
                    searchTerm
                  )}&per_page=1`,
                  {
                    headers: {
                      Authorization: PEXELS_API_KEY,
                    },
                  }
                );

                if (!response.ok) {
                  throw new Error(`Pexels API error: ${response.statusText}`);
                }

                const data = await response.json();

                let imageUrl;
                if (data.photos && data.photos.length > 0) {
                  // Use medium size for better performance
                  imageUrl = data.photos[0].src.medium;
                } else {
                  // Use a specific placeholder based on category
                  imageUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(
                    product.category + ": " + product.name
                  )}`;
                }

                // Update the image cache
                imageCache.current[product._id] = imageUrl;
                images[product._id] = imageUrl;
              } catch (err) {
                console.error(`Error fetching image for ${product.name}:`, err);
                images[
                  product._id
                ] = `https://via.placeholder.com/300x200?text=${encodeURIComponent(
                  product.name
                )}`;
              }
            })
          );

          // Small delay between batches to be gentle on the API
          if (i + batchSize < productsNeedingImages.length) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        setProductImages(images);
      } catch (error) {
        console.error("Error fetching product images:", error);
      } finally {
        setImageLoading(false);
      }
    },
    [productImages]
  );

  // Fetch products with debounced API calls (green practice)
  const fetchProducts = useCallback(async () => {
    try {
      // Avoid unnecessary loading state for cached data
      if (!productsCache.current[getCacheKey()]) {
        setLoading(true);
      }

      // Check if we've already fetched this data in the last 5 minutes (300000ms)
      const now = Date.now();
      const cacheKey = getCacheKey();
      const cacheEntry = productsCache.current[cacheKey];

      if (cacheEntry && now - lastFetchTime.current < 300000) {
        // Use cached data if available and recent
        setProducts(cacheEntry.products);
        setPagination(cacheEntry.pagination);
        setLoading(false);
        setUsingMockData(false);

        // Fetch images for cached products
        fetchProductImages(cacheEntry.products);
        return;
      }

      // Create query string from filters
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.sustainableOnly) queryParams.append("green", "true");

      // Add pagination parameters
      queryParams.append("page", filters.page);
      queryParams.append("limit", filters.limit);

      // Add sorting parameters
      let sort = "createdAt";
      let order = "desc";

      switch (filters.sort) {
        case "price-asc":
          sort = "price";
          order = "asc";
          break;
        case "price-desc":
          sort = "price";
          order = "desc";
          break;
        case "sustainability":
          sort = "sustainabilityScore";
          order = "desc";
          break;
        default:
          break;
      }

      queryParams.append("sort", sort);
      queryParams.append("order", order);

      let productData;
      let paginationData;

      try {
        const response = await axiosInstance.get(
          `/api/products?${queryParams}`
        );

        // Track API call for metrics
        if (onApiCall) onApiCall(response.data.data.length * 0.5); // Approx KB per product

        productData = response.data.data;
        setUsingMockData(false);

        // Update pagination state
        paginationData = {
          currentPage: response.data.page || 1,
          totalPages: response.data.pages || 1,
          totalProducts: response.data.total || productData.length,
        };

        setPagination(paginationData);
      } catch (apiError) {
        console.log("API error, using mock data:", apiError.message);
        // Use mock data when API is unavailable
        const allMockProducts = getMockProducts().filter((product) => {
          if (filters.category && product.category !== filters.category)
            return false;
          if (filters.sustainableOnly && product.sustainabilityScore < 80)
            return false;
          return true;
        });

        // Sort mock products
        switch (filters.sort) {
          case "price-asc":
            allMockProducts.sort((a, b) => a.price - b.price);
            break;
          case "price-desc":
            allMockProducts.sort((a, b) => b.price - a.price);
            break;
          case "sustainability":
            allMockProducts.sort(
              (a, b) => b.sustainabilityScore - a.sustainabilityScore
            );
            break;
          default:
          // No sorting
        }

        // Calculate pagination for mock data
        const startIndex = (filters.page - 1) * filters.limit;
        const endIndex = startIndex + parseInt(filters.limit, 10);
        productData = allMockProducts.slice(startIndex, endIndex);

        paginationData = {
          currentPage: filters.page,
          totalPages: Math.ceil(allMockProducts.length / filters.limit),
          totalProducts: allMockProducts.length,
        };

        setPagination(paginationData);
        setUsingMockData(true);
      }

      // Update cache and last fetch time with both products and pagination
      productsCache.current[cacheKey] = {
        products: productData,
        pagination: paginationData,
      };
      lastFetchTime.current = now;

      setProducts(productData);
      setLoading(false);
      setError(null);

      // Fetch images for the products
      fetchProductImages(productData);
    } catch (err) {
      setError("Error fetching products. Please try again.");
      setLoading(false);
      console.error("Error fetching products:", err);

      // Try to show mock data if anything fails
      if (!products.length) {
        const mockData = getMockProducts().slice(0, filters.limit);
        setProducts(mockData);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalProducts: mockData.length,
        });
        setUsingMockData(true);
        fetchProductImages(mockData);
      }
    }
  }, [filters, onApiCall, fetchProductImages]);

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

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      <h1>Products</h1>

      {/* Mock Data Notice */}
      {usingMockData && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "15px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FaInfoCircle style={{ marginRight: "8px" }} />
          <span>
            Currently showing demo products. The backend server might be
            unavailable.
          </span>
        </div>
      )}

      {/* Filters */}
      <div
        className="filters"
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f1f8e9",
          borderRadius: "8px",
        }}
      >
        <h3>Filter Products</h3>
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            margin: "10px 0",
          }}
        >
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
              <option value="sustainability">Sustainability</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              id="sustainableOnly"
              name="sustainableOnly"
              checked={filters.sustainableOnly}
              onChange={handleFilterChange}
              className="green-checkbox"
            />
            <label
              htmlFor="sustainableOnly"
              style={{
                marginLeft: "5px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaLeaf color="#2e7d32" style={{ marginRight: "5px" }} />
              Sustainable Products Only
            </label>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            marginBottom: "20px",
          }}
        >
          <div
            className="loading-spinner"
            style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid rgba(0, 0, 0, 0.1)",
              borderLeftColor: "#2e7d32",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "10px",
            }}
          ></div>
          <style>
            {`@keyframes spin { to { transform: rotate(360deg) } }`}
          </style>
          <p>Loading sustainable products...</p>
        </div>
      )}
      {error && !usingMockData && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <p>{error}</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && (
        <>
          <p style={{ marginBottom: "15px" }}>
            <strong>{pagination.totalProducts}</strong> products found
            {!usingMockData && (
              <span>
                {" "}
                (showing page {pagination.currentPage} of{" "}
                {pagination.totalPages})
              </span>
            )}
          </p>
          <div className="product-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <img
                  src={
                    productImages[product._id] ||
                    `https://via.placeholder.com/300x200?text=${encodeURIComponent(
                      product.name
                    )}`
                  }
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />

                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>

                  <p className="product-price">${product.price.toFixed(2)}</p>

                  <div className="product-actions">
                    <button
                      className="btn btn-block"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FaShoppingCart style={{ marginRight: "5px" }} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <p>No products found. Try adjusting your filters.</p>
          )}

          {/* Pagination Controls */}
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

export default ProductList;
