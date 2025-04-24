import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaRegLightbulb } from "react-icons/fa";
import mockProducts from "../../data/mockProducts";
import { useCart } from "../../context/CartContext";
import "./ProductRecommendations.css";

const ProductRecommendations = ({ onApiCall }) => {
  const { items } = useCart();
  const [productImages, setProductImages] = useState({});
  const [loading, setLoading] = useState(false);
  const imageCache = useRef({});

  // Generate recommendations based on cart items
  const recommendations = useMemo(() => {
    if (!items || items.length === 0) {
      // If cart is empty, show top-rated sustainable products
      return mockProducts
        .filter((product) => product.sustainabilityScore >= 85)
        .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)
        .slice(0, 4);
    }

    // Extract categories and ids from cart items
    const cartCategories = items.map((item) => item.product.category);
    const cartIds = items.map((item) => item.product._id);

    // Find products in the same categories but not already in cart
    const categoryRecommendations = mockProducts.filter(
      (product) =>
        cartCategories.includes(product.category) &&
        !cartIds.includes(product._id)
    );

    // If we don't have enough category matches, add some high sustainability score products
    let finalRecommendations = [...categoryRecommendations];

    if (finalRecommendations.length < 4) {
      const sustainableRecommendations = mockProducts
        .filter(
          (product) =>
            product.sustainabilityScore >= 85 &&
            !cartIds.includes(product._id) &&
            !finalRecommendations.some((rec) => rec._id === product._id)
        )
        .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);

      finalRecommendations = [
        ...finalRecommendations,
        ...sustainableRecommendations,
      ].slice(0, 4);
    } else {
      finalRecommendations = finalRecommendations.slice(0, 4);
    }

    return finalRecommendations;
  }, [items]); // Recalculate when items change

  // Fetch product images - optimized for fewer API calls
  const fetchProductImages = useCallback(
    async (productsToFetch) => {
      if (!productsToFetch.length) return;

      // To reduce API calls, we'll batch process images
      const productsNeedingImages = productsToFetch.filter(
        (product) => !sessionStorage.getItem(`img-${product._id}`)
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
        setLoading(false);
        return;
      }

      setLoading(true);

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
                const query = encodeURIComponent(product.name);
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
      } finally {
        setLoading(false);
      }
    },
    [onApiCall]
  );

  // Load images when recommendations change
  useEffect(() => {
    if (recommendations.length > 0) {
      fetchProductImages(recommendations);
    }
  }, [recommendations, fetchProductImages]);

  if (!recommendations.length) return null;

  return (
    <div className="product-recommendations">
      <h3>
        <FaRegLightbulb style={{ color: "var(--primary-light)" }} />
        Recommended For You
      </h3>

      {loading ? (
        <div className="recommendations-loading">
          <div className="recommendations-spinner"></div>
        </div>
      ) : (
        <div className="recommendations-container">
          {recommendations.map((product) => (
            <div key={product._id} className="recommendation-card">
              <Link to={`/products/${product._id}`}>
                <img
                  src={
                    productImages[product._id] ||
                    product.image ||
                    `https://via.placeholder.com/150x150?text=${encodeURIComponent(
                      product.name
                    )}`
                  }
                  alt={product.name}
                  className="recommendation-image"
                  loading="lazy"
                />
                <div className="recommendation-details">
                  <h4>{product.name}</h4>
                  <div className="recommendation-price">
                    ${product.price.toFixed(2)}
                  </div>
                  {product.sustainabilityScore && (
                    <div className="sustainability-score">
                      <FaLeaf size={12} />
                      <span>Eco Score: {product.sustainabilityScore}/100</span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductRecommendations);
