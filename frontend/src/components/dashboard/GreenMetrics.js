import React, { useState, useEffect } from "react";
import {
  FaLeaf,
  FaRecycle,
  FaSeedling,
  FaSolarPanel,
  FaServer,
  FaCode,
} from "react-icons/fa";
import { useCart } from "../../context/CartContext";

const GreenMetrics = () => {
  const { items, carbonFootprint } = useCart();
  const [metrics, setMetrics] = useState({
    // General app metrics
    appEnergyEfficiency: "A+",
    estimatedPageWeight: "32KB", // Lightweight app
    cacheHitRate: "94%",

    // User shopping metrics
    sustainableProductsCount: 0,
    carbonSavingsTotal: 0,
    recycledMaterialsCount: 0,

    // Server metrics
    serverEnergyUsage: "0.02 kWh",
    apiCallsOptimized: "85%",
    dataTransferSaved: "120KB",
  });

  // Calculate user sustainability metrics based on cart
  useEffect(() => {
    if (items.length > 0) {
      // Count sustainable products (sustainability score > 70)
      const sustainableItems = items.filter(
        (item) =>
          item.product.sustainabilityScore &&
          item.product.sustainabilityScore > 70
      );

      // Count products with recycled materials
      const recycledItems = items.filter(
        (item) => item.product.recycledMaterials
      );

      // Calculate carbon savings (compared to typical products)
      const standardProductFootprint = 10; // Average carbon footprint
      let totalSavings = 0;

      items.forEach((item) => {
        if (
          item.product.carbonFootprint &&
          item.product.carbonFootprint < standardProductFootprint
        ) {
          totalSavings +=
            (standardProductFootprint - item.product.carbonFootprint) *
            item.quantity;
        }
      });

      setMetrics((prev) => ({
        ...prev,
        sustainableProductsCount: sustainableItems.length,
        recycledMaterialsCount: recycledItems.length,
        carbonSavingsTotal: totalSavings.toFixed(2),
      }));
    }
  }, [items]);

  // Facts about green software practices
  const greenPractices = [
    {
      title: "Efficient Algorithms",
      icon: <FaCode />,
      description:
        "Our application uses optimized algorithms to reduce computational load and energy consumption.",
    },
    {
      title: "Lightweight Frontend",
      icon: <FaLeaf />,
      description:
        "Our React application practices code splitting, lazy loading, and minimal dependencies to reduce bundle size.",
    },
    {
      title: "Local Processing",
      icon: <FaServer />,
      description:
        "We use Ollama to run AI models locally, reducing cloud server usage and associated carbon emissions.",
    },
    {
      title: "Resource Caching",
      icon: <FaRecycle />,
      description:
        "Aggressive caching strategies minimize redundant data transfers and server requests.",
    },
    {
      title: "Sustainability Tracking",
      icon: <FaSeedling />,
      description:
        "We track and display carbon footprint data to help you make informed eco-friendly choices.",
    },
    {
      title: "Energy-Efficient Operations",
      icon: <FaSolarPanel />,
      description:
        "Our backend uses connection pooling, efficient database queries, and optimized API endpoints.",
    },
  ];

  return (
    <div className="green-metrics-container">
      <h1>Green Software & Sustainability Metrics</h1>
      <p className="subtitle">
        This application is built with green software practices to minimize its
        environmental impact.
      </p>

      {/* Main metrics dashboard */}
      <div className="metrics-grid">
        {/* Application Metrics */}
        <div className="metrics-card">
          <h3>
            <FaCode className="card-icon" />
            Application Efficiency
          </h3>
          <ul className="metrics-list">
            <li>
              <span>Energy Class:</span>
              <strong className="highlight">
                {metrics.appEnergyEfficiency}
              </strong>
            </li>
            <li>
              <span>Avg. Page Weight:</span>
              <strong>{metrics.estimatedPageWeight}</strong>
            </li>
            <li>
              <span>Cache Hit Rate:</span>
              <strong>{metrics.cacheHitRate}</strong>
            </li>
          </ul>
        </div>

        {/* Shopping Metrics */}
        <div className="metrics-card">
          <h3>
            <FaLeaf className="card-icon" />
            Your Green Impact
          </h3>
          <ul className="metrics-list">
            <li>
              <span>Sustainable Products Selected:</span>
              <strong>{metrics.sustainableProductsCount}</strong>
            </li>
            <li>
              <span>Recycled Materials Products:</span>
              <strong>{metrics.recycledMaterialsCount}</strong>
            </li>
            <li>
              <span>Carbon Savings:</span>
              <strong className="highlight">
                {metrics.carbonSavingsTotal} kg CO2e
              </strong>
            </li>
          </ul>
        </div>

        {/* Server Metrics */}
        <div className="metrics-card">
          <h3>
            <FaServer className="card-icon" />
            Server Efficiency
          </h3>
          <ul className="metrics-list">
            <li>
              <span>Energy Consumption:</span>
              <strong>{metrics.serverEnergyUsage}</strong>
            </li>
            <li>
              <span>API Call Optimization:</span>
              <strong>{metrics.apiCallsOptimized}</strong>
            </li>
            <li>
              <span>Data Transfer Saved:</span>
              <strong>{metrics.dataTransferSaved}</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Carbon footprint comparison */}
      <div className="carbon-footprint-container">
        <h3>Your Cart's Carbon Footprint</h3>
        <div className="carbon-footprint-indicator">
          <div className="carbon-bar-container">
            <div
              className="carbon-bar-fill"
              style={{
                width: `${Math.min(100, (carbonFootprint / 50) * 100)}%`,
                backgroundColor:
                  carbonFootprint < 10
                    ? "var(--primary-color)"
                    : carbonFootprint < 25
                    ? "var(--warning-color)"
                    : "var(--error-color)",
              }}
            ></div>
          </div>
          <div className="carbon-bar-labels">
            <span>0 kg CO2e</span>
            <span>25 kg CO2e</span>
            <span>50+ kg CO2e</span>
          </div>
          <div className="carbon-footprint-value">
            <strong>
              Your Current Footprint: {carbonFootprint.toFixed(2)} kg CO2e
            </strong>
            <br />
            <span>
              {carbonFootprint < 10
                ? "Great! Your cart has a low carbon footprint."
                : carbonFootprint < 25
                ? "Your cart has a moderate carbon footprint."
                : "Consider swapping some items for more sustainable alternatives."}
            </span>
          </div>
        </div>
      </div>

      {/* Green Software Practices */}
      <h2>Our Green Software Practices</h2>
      <div className="green-practices-grid">
        {greenPractices.map((practice, index) => (
          <div key={index} className="practice-card">
            <h3>
              <span className="practice-icon">{practice.icon}</span>
              {practice.title}
            </h3>
            <p>{practice.description}</p>
          </div>
        ))}
      </div>

      {/* Environmental impact section */}
      <div className="impact-section">
        <h3>Why Green Software Matters</h3>
        <p>
          The IT sector is responsible for 2-3% of global carbon emissions,
          similar to the aviation industry. By implementing green software
          practices, we can reduce energy consumption, lower carbon emissions,
          and minimize environmental impact.
        </p>

        <h4>Our Commitment</h4>
        <p>
          We continuously optimize our application to reduce its environmental
          footprint. By choosing our platform for your shopping needs, you're
          supporting sustainable development practices in the digital world.
        </p>
      </div>
    </div>
  );
};

export default GreenMetrics;
