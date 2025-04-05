import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaLeaf,
  FaTrash,
  FaMinus,
  FaPlus,
  FaShoppingCart,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";

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

  // Fetch images from Pexels API
  const fetchProductImages = async (cartItems) => {
    if (!cartItems.length) return;

    // To reduce API calls, we'll batch process images
    const productsNeedingImages = cartItems.filter(
      (item) => !imageCache.current[item.product._id]
    );

    if (!productsNeedingImages.length) {
      // If we have all images cached, just use the cache
      const cachedImages = {};
      cartItems.forEach((item) => {
        cachedImages[item.product._id] = imageCache.current[item.product._id];
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
      const batchSize = 3;
      for (let i = 0; i < productsNeedingImages.length; i += batchSize) {
        const batch = productsNeedingImages.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (item) => {
            try {
              // Use product category and name for better search results
              const searchTerm = `${item.product.category || ""} ${
                item.product.name
              }`;
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
                // Use a placeholder based on product name
                imageUrl = `https://via.placeholder.com/100x100?text=${encodeURIComponent(
                  item.product.name
                )}`;
              }

              // Update the image cache
              imageCache.current[item.product._id] = imageUrl;
              images[item.product._id] = imageUrl;
            } catch (err) {
              console.error(
                `Error fetching image for ${item.product.name}:`,
                err
              );
              images[
                item.product._id
              ] = `https://via.placeholder.com/100x100?text=${encodeURIComponent(
                item.product.name
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
  };

  // Fetch images when cart items change
  useEffect(() => {
    if (items && items.length > 0) {
      fetchProductImages(items);
    }
  }, [items]);

  // Green tip to display
  const getRandomGreenTip = () => {
    const tips = [
      "Choosing green delivery can reduce carbon emissions by up to 30%.",
      "Carbon offsetting helps fund renewable energy and reforestation projects.",
      "Digital receipts save paper and reduce waste.",
      "Consolidating your purchases into fewer orders reduces packaging waste.",
      "Opting for sustainable products helps promote eco-friendly manufacturing.",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  // Potential carbon savings calculation
  const calculatePotentialSavings = () => {
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
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Your Cart</h1>
        <span>{totalItems} items</span>
      </div>

      {loading && <p>Loading cart...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <FaShoppingCart size={48} color="#c5e1a5" />
              <h3 style={{ margin: "15px 0" }}>Your cart is empty</h3>
              <p>Add sustainable products to your cart to get started.</p>
              <Link
                to="/"
                className="btn"
                style={{ marginTop: "20px", display: "inline-block" }}
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.product._id} className="cart-item">
                    <img
                      src={
                        productImages[item.product._id] ||
                        item.product.image ||
                        `https://via.placeholder.com/100x100?text=${encodeURIComponent(
                          item.product.name
                        )}`
                      }
                      alt={item.product.name}
                      className="cart-item-image"
                      loading="lazy" // Green practice: lazy loading
                    />

                    <div className="cart-item-details">
                      <h3 className="cart-item-title">
                        <Link to={`/product/${item.product._id}`}>
                          {item.product.name}
                        </Link>
                      </h3>

                      <p className="cart-item-price">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>

                      {/* Sustainability score if available */}
                      {item.product.sustainabilityScore && (
                        <div
                          className="sustainability-score"
                          style={{ marginTop: "5px" }}
                        >
                          <FaLeaf color="#4caf50" size={14} />
                          <span
                            style={{ marginLeft: "5px", fontSize: "0.9rem" }}
                          >
                            Sustainability: {item.product.sustainabilityScore}
                            /100
                          </span>
                        </div>
                      )}

                      {/* Carbon footprint if available */}
                      {item.product.carbonFootprint && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            marginTop: "5px",
                            color: "#555",
                          }}
                        >
                          Carbon:{" "}
                          {(
                            item.product.carbonFootprint * item.quantity
                          ).toFixed(2)}
                          kg CO2e
                        </div>
                      )}

                      <div className="cart-item-actions">
                        <div className="quantity-control">
                          <button
                            className="quantity-btn"
                            onClick={() =>
                              updateQuantity(
                                item.product._id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            aria-label="Decrease quantity"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="quantity-value">
                            {item.quantity}
                          </span>
                          <button
                            className="quantity-btn"
                            onClick={() =>
                              updateQuantity(
                                item.product._id,
                                item.quantity + 1
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>

                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.product._id)}
                        >
                          <FaTrash size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {greenDelivery
                      ? "Green Shipping (Free)"
                      : "Standard Shipping ($5.00)"}
                  </span>
                </div>

                <div className="summary-row">
                  <span>Carbon Offset {carbonOffset && "(Applied)"}</span>
                  <span>
                    {carbonOffset
                      ? `$${(carbonFootprint * 0.1).toFixed(2)}`
                      : "$0.00"}
                  </span>
                </div>

                <div className="cart-total">
                  <span>Total</span>
                  <span>
                    $
                    {(
                      totalPrice +
                      (greenDelivery ? 0 : 5) +
                      (carbonOffset ? carbonFootprint * 0.1 : 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Green delivery and carbon offset options */}
              <div className="green-options">
                <h3 style={{ display: "flex", alignItems: "center" }}>
                  <FaLeaf style={{ marginRight: "8px" }} />
                  Eco-Friendly Options
                </h3>

                <div className="option-row">
                  <input
                    type="checkbox"
                    id="greenDelivery"
                    checked={greenDelivery}
                    onChange={toggleGreenDelivery}
                    className="green-checkbox"
                  />
                  <label htmlFor="greenDelivery">
                    Eco-friendly Delivery (CO2 reduction: 1.5kg)
                  </label>
                </div>

                <div className="option-row">
                  <input
                    type="checkbox"
                    id="carbonOffset"
                    checked={carbonOffset}
                    onChange={toggleCarbonOffset}
                    className="green-checkbox"
                  />
                  <label htmlFor="carbonOffset">
                    Carbon Offset (+${(carbonFootprint * 0.1).toFixed(2)})
                  </label>
                </div>

                <div className="carbon-info">
                  <p>
                    Total Carbon Footprint: {carbonFootprint.toFixed(2)}kg CO2e
                  </p>
                  {calculatePotentialSavings() > 0 && (
                    <p style={{ marginTop: "5px", color: "#2e7d32" }}>
                      Potential CO2 savings: {calculatePotentialSavings()}kg
                    </p>
                  )}
                </div>

                <div className="eco-tip">
                  <FaLeaf style={{ marginRight: "5px" }} />
                  <span>Tip: {getRandomGreenTip()}</span>
                </div>
              </div>

              <div style={{ marginTop: "20px", textAlign: "right" }}>
                <Link
                  to="/"
                  className="btn btn-outline"
                  style={{ marginRight: "10px" }}
                >
                  Continue Shopping
                </Link>
                <Link to="/checkout" className="btn">
                  Proceed to Checkout
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;
