import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaInfoCircle,
  FaTruck,
  FaRecycle,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { calculateOrderTotal } from "../../utils/cartUtils";
import ProductRecommendations from "../products/ProductRecommendations";
import "./Cart.css";

const Cart = ({ onApiCall }) => {
  const {
    items,
    totalItems,
    totalPrice,
    loading,
    error,
    greenDelivery,
    carbonOffset,
    carbonFootprint,
    updateQuantity,
    removeFromCart,
    toggleGreenDelivery,
    toggleCarbonOffset,
  } = useCart();

  // Add state for product images
  const [productImages, setProductImages] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const imageCache = useRef({});

  // This ref will store our selected tip so it doesn't change on re-renders
  const selectedTipRef = useRef(null);

  // Fetch product images - optimized for fewer API calls
  const fetchProductImages = useCallback(
    async (productsToFetch) => {
      if (!productsToFetch.length) return;

      // To reduce API calls, we'll batch process images
      const productsNeedingImages = productsToFetch.filter(
        (item) => !imageCache.current[item.product._id]
      );

      if (!productsNeedingImages.length) {
        // If we have all images cached, just use the cache
        const cachedImages = {};
        productsToFetch.forEach((item) => {
          cachedImages[item.product._id] = imageCache.current[item.product._id];
        });
        setProductImages(cachedImages);
        return;
      }

      setImageLoading(true);
      const images = {}; // Create a new object instead of spreading existing state

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

          await Promise.all(
            batch.map(async (item) => {
              try {
                // Track API call
                if (onApiCall) onApiCall(1);

                const query = encodeURIComponent(item.product.name);
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
                  images[item.product._id] = imageUrl;
                  imageCache.current[item.product._id] = imageUrl;
                }
              } catch (err) {
                console.error(
                  `Error fetching image for ${item.product.name}:`,
                  err
                );
              }
            })
          );

          // Add a small delay between batches to be respectful to the API
          if (i + batchSize < productsNeedingImages.length) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Merge with existing images from cache for any items we already had images for
        productsToFetch.forEach((item) => {
          if (
            imageCache.current[item.product._id] &&
            !images[item.product._id]
          ) {
            images[item.product._id] = imageCache.current[item.product._id];
          }
        });

        setProductImages(images);
      } catch (err) {
        console.error("Error fetching product images:", err);
      } finally {
        setImageLoading(false);
      }
    },
    [onApiCall]
  ); // Dependencies array

  // Load images when cart items change
  useEffect(() => {
    if (items.length > 0) {
      fetchProductImages(items);
    }
  }, [items, fetchProductImages]);

  // Green tip to display - memoized to prevent regeneration on each render
  const greenTips = useMemo(
    () => [
      "Choosing green delivery can reduce carbon emissions by up to 30%.",
      "Carbon offsetting helps fund renewable energy and reforestation projects.",
      "Digital receipts save paper and reduce waste.",
      "Consolidating your purchases into fewer orders reduces packaging waste.",
      "Opting for sustainable products helps promote eco-friendly manufacturing.",
    ],
    []
  );

  // Select a green tip only once and store it in a ref
  // This ensures the tip doesn't change on re-renders
  const greenTip = useMemo(() => {
    if (selectedTipRef.current === null) {
      selectedTipRef.current =
        greenTips[Math.floor(Math.random() * greenTips.length)];
    }
    return selectedTipRef.current;
  }, [greenTips]);

  // Potential carbon savings calculation - memoized to prevent recalculation on every render
  const calculatePotentialSavings = useCallback(() => {
    // Base calculations
    let savings = 0;

    // If not using green delivery, calculate potential savings
    if (!greenDelivery) {
      savings += 1.5; // Average 1.5kg CO2 saving for green delivery
    }

    // If not offsetting carbon, calculate potential savings
    if (!carbonOffset) {
      savings += carbonFootprint * 0.8; // Offset covers ~80% of carbon footprint
    }

    return savings.toFixed(2);
  }, [greenDelivery, carbonOffset, carbonFootprint]);

  // Memoize the order total calculation
  const orderTotal = useMemo(
    () =>
      calculateOrderTotal(
        totalPrice,
        greenDelivery,
        carbonOffset,
        carbonFootprint
      ),
    [totalPrice, greenDelivery, carbonOffset, carbonFootprint]
  );

  // Memoized handlers for cart actions
  const handleUpdateQuantity = useCallback(
    (productId, newQuantity) => {
      updateQuantity(productId, newQuantity);
    },
    [updateQuantity]
  );

  const handleRemoveFromCart = useCallback(
    (productId) => {
      removeFromCart(productId);
    },
    [removeFromCart]
  );

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Cart</h1>
        <span className="cart-count-badge">{totalItems} items</span>
      </div>

      {loading && <div className="loading-spinner"></div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div className="empty-cart">
              <FaShoppingCart size={60} />
              <h3>Your cart is empty</h3>
              <p>Add sustainable products to your cart to get started.</p>
              <Link to="/" className="btn">
                Browse Products
              </Link>

              {/* Show recommendations even when cart is empty */}
              <ProductRecommendations onApiCall={onApiCall} />
            </div>
          ) : (
            <>
              <div className="cart-grid">
                <div className="cart-items">
                  {items.map((item) => (
                    <div key={item.product._id} className="cart-item">
                      <div className="item-image-container">
                        <img
                          src={
                            productImages[item.product._id] ||
                            item.product.image ||
                            `https://via.placeholder.com/150x150?text=${encodeURIComponent(
                              item.product.name
                            )}`
                          }
                          alt={item.product.name}
                          className="cart-item-image"
                          loading="lazy" // Green practice: lazy loading
                        />
                      </div>

                      <div className="cart-item-details">
                        <div className="cart-item-header">
                          <h3 className="cart-item-title">
                            {item.product.name}
                          </h3>
                          <div className="cart-item-price">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        {/* Product attributes and badges */}
                        <div className="cart-item-attributes">
                          {/* Sustainability score */}
                          {item.product.sustainabilityScore && (
                            <div className="item-badge sustainability-badge">
                              <FaLeaf size={14} />
                              <span>
                                Eco Score: {item.product.sustainabilityScore}
                                /100
                              </span>
                            </div>
                          )}

                          {/* Recycled materials badge */}
                          {item.product.recycledMaterials && (
                            <div className="item-badge recycled-badge">
                              <FaRecycle size={14} />
                              <span>Recycled Materials</span>
                            </div>
                          )}

                          {/* Carbon footprint */}
                          {item.product.carbonFootprint && (
                            <div className="item-badge carbon-badge">
                              <FaInfoCircle size={14} />
                              <span>
                                Carbon:{" "}
                                {(
                                  item.product.carbonFootprint * item.quantity
                                ).toFixed(2)}{" "}
                                kg
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="cart-item-actions">
                          <div className="quantity-control">
                            <button
                              className="quantity-btn"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product._id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              <FaMinus />
                            </button>
                            <span className="quantity-value">
                              {item.quantity}
                            </span>
                            <button
                              className="quantity-btn"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product._id,
                                  item.quantity + 1
                                )
                              }
                              aria-label="Increase quantity"
                            >
                              <FaPlus />
                            </button>
                          </div>

                          <button
                            className="remove-btn"
                            onClick={() =>
                              handleRemoveFromCart(item.product._id)
                            }
                            aria-label="Remove from cart"
                          >
                            <FaTrash />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-sidebar">
                  <div className="order-summary">
                    <h3>Order Summary</h3>

                    <div className="summary-row">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="amount">${totalPrice.toFixed(2)}</span>
                    </div>

                    <div className="summary-row">
                      <span>Shipping</span>
                      <span className="amount">
                        {greenDelivery ? (
                          <span className="eco-shipping">Green (Free)</span>
                        ) : (
                          <span>Standard ($5.00)</span>
                        )}
                      </span>
                    </div>

                    <div className="summary-row">
                      <span>Carbon Offset</span>
                      <span className="amount">
                        {carbonOffset ? (
                          <span className="eco-carbon">
                            ${(carbonFootprint * 0.1).toFixed(2)}
                          </span>
                        ) : (
                          <span>Not Applied</span>
                        )}
                      </span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="cart-total">
                      <span>Total</span>
                      <span className="total-amount">${orderTotal}</span>
                    </div>

                    <div className="checkout-actions">
                      <Link to="/checkout" className="btn checkout-btn">
                        Proceed to Checkout
                      </Link>

                      <Link to="/" className="continue-shopping">
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add product recommendations below the cart items */}
              <ProductRecommendations onApiCall={onApiCall} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(Cart);
