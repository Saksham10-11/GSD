const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  seedProducts,
} = require("../controllers/productController");

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get("/", getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get("/:id", getProductById);

/**
 * @route   POST /api/products/seed
 * @desc    Seed product data for development
 * @access  Public (should be secured in production)
 */
router.post("/seed", seedProducts);

module.exports = router;
