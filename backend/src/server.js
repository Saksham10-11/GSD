require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Specific CORS configuration (green practice: only allowing necessary origins/methods)
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "user-id"],
  })
);

// Update the MongoDB connection section:
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");

    // Log connection pool stats (green practice: monitoring resource usage)
    const poolSize =
      mongoose.connection.client.s.options.maxPoolSize || "default";
    console.log(`MongoDB connection pool size: ${poolSize}`);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Connection event handlers (green practice: efficient resource management)
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB connection disconnected");
});

// Graceful shutdown (green practice: prevents resource leaks)
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  });
});

// Import routes
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

// Security middleware (green practice: efficient security implementation)
app.use(helmet());

// Compression middleware (green practice: reduces network traffic by 40-60%)
app.use(compression());

// Minimal logging - 'tiny' format (green practice: reduces storage usage)
app.use(morgan("tiny"));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes
 * The controllers implement green practices such as:
 * - Lean queries to reduce memory usage
 * - Pagination to limit data transfer
 * - Selective field retrieval to minimize response size
 * - Efficient database indexing
 */
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling middleware (green practice: prevents unhandled crashes that waste resources)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: "An internal server error occurred",
  });
});

/**
 * Server Startup with Resource Monitoring
 *
 * Green practices:
 * - Memory usage tracking
 * - Resource consumption monitoring
 * - Efficient process management
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server started at ${new Date().toISOString()}`);

  // Log memory usage (green software practice: monitoring resource consumption)
  const used = process.memoryUsage();
  console.log("Memory usage:");
  for (const key in used) {
    console.log(
      `${key}: ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
    );
  }
});
