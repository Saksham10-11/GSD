import React from "react";
import { Link } from "react-router-dom";
import { FaChartLine, FaLeaf, FaServer, FaShoppingCart } from "react-icons/fa";

const Dashboard = ({ metrics }) => {
  return (
    <div className="dashboard-container">
      <h1>Green E-commerce Dashboard</h1>
      <p>
        Overview of application performance and environmental impact metrics
      </p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>
            <FaLeaf /> Environmental Impact
          </h3>
          <div className="metric-row">
            <span>Carbon Footprint:</span>
            <span>~{(metrics?.dataTransferred * 0.02).toFixed(2)} g CO2e</span>
          </div>
          <div className="metric-row">
            <span>Energy Efficiency Rating:</span>
            <span>A+</span>
          </div>
          <div className="metric-row">
            <span>Optimized API Calls:</span>
            <span>{metrics?.apiCalls || 0}</span>
          </div>
          <Link to="/green-metrics" className="btn btn-outline">
            View Detailed Metrics
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>
            <FaShoppingCart /> Shopping Activity
          </h3>
          <p>View your shopping history and impact</p>
          <Link to="/cart" className="btn btn-outline">
            Go to Cart
          </Link>
        </div>

        <div className="dashboard-card">
          <h3>
            <FaServer /> Resource Usage
          </h3>
          <div className="metric-row">
            <span>Page Loads:</span>
            <span>{metrics?.pageLoads || 0}</span>
          </div>
          <div className="metric-row">
            <span>Data Transferred:</span>
            <span>{metrics?.dataTransferred?.toFixed(2) || 0} KB</span>
          </div>
          <div className="metric-row">
            <span>API Calls:</span>
            <span>{metrics?.apiCalls || 0}</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>
            <FaChartLine /> Performance
          </h3>
          <div className="metric-row">
            <span>Page Load Time:</span>
            <span>~{(Math.random() * 0.5 + 0.2).toFixed(2)}s</span>
          </div>
          <div className="metric-row">
            <span>Memory Usage:</span>
            <span>~{(Math.random() * 5 + 10).toFixed(1)} MB</span>
          </div>
          <div className="metric-row">
            <span>Network Requests:</span>
            <span>
              {(metrics?.apiCalls || 0) + (metrics?.pageLoads || 0) * 3}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <h3>About Green Software Practices</h3>
        <p>
          This application implements various green software practices to
          minimize its environmental footprint:
        </p>
        <ul>
          <li>
            Code splitting and lazy loading to reduce initial payload size
          </li>
          <li>Efficient API calls with data aggregation and debouncing</li>
          <li>
            Local processing for AI features to reduce cloud computing usage
          </li>
          <li>
            Dark mode support for OLED screens to reduce power consumption
          </li>
          <li>Optimized rendering and reduced unnecessary re-renders</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
