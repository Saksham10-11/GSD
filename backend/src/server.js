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

// Replace the simple CORS middleware configuration:
app.use(cors());

// With this more detailed configuration:
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "user-id"],
  })
);

// Connect to MongoDB (green practice: connection pooling enabled by default)
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

// Implement connection optimization (green practice: efficient resource use)
mongoose.connection.on("connected", () => {
  console.log("MongoDB connection established");
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB connection disconnected");
});

// Handle process termination gracefully to close MongoDB connections
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed due to app termination");
    process.exit(0);
  });
});

// Import routes
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");

// Middleware
// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors());

// Compression middleware (green software practice: reduces network traffic)
app.use(compression());

// Logging middleware - use 'tiny' format for minimal logging (green practice: reduces log size)
app.use(morgan("tiny"));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: "An internal server error occurred",
  });
});

// Start server
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
