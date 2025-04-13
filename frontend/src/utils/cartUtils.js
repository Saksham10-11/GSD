/**
 * Utility functions for cart operations
 * Supports calculations for cart totals, carbon footprint, and eco-friendly options
 */

/**
 * Calculate the total order amount including any additional fees or discounts
 * @param {number} subtotal - The cart subtotal
 * @param {boolean} greenDelivery - Whether green delivery is selected (free) or standard shipping ($5)
 * @param {boolean} carbonOffset - Whether carbon offset is selected
 * @param {number} carbonFootprint - The total carbon footprint of the order
 * @returns {string} - Formatted total price as string with 2 decimal places
 */
export const calculateOrderTotal = (
  subtotal,
  greenDelivery,
  carbonOffset,
  carbonFootprint
) => {
  let total = subtotal;

  // Add shipping cost if not using green delivery
  if (!greenDelivery) {
    total += 5; // Standard shipping cost
  }

  // Add carbon offset cost if selected (typically 10% of the carbon footprint in $)
  if (carbonOffset) {
    total += carbonFootprint * 0.1;
  }

  return total.toFixed(2);
};

/**
 * Calculate the carbon footprint of a cart
 * @param {Array} items - Cart items with product data
 * @returns {number} - Total carbon footprint in kg CO2e
 */
export const calculateTotalCarbonFootprint = (items) => {
  if (!items || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => {
    const productFootprint = item.product.carbonFootprint || 0;
    return total + productFootprint * item.quantity;
  }, 0);
};

/**
 * Calculate potential carbon savings from eco-friendly options
 * @param {boolean} greenDelivery - Whether green delivery is selected
 * @param {boolean} carbonOffset - Whether carbon offset is selected
 * @param {number} carbonFootprint - The total carbon footprint of the order
 * @returns {number} - Potential or actual carbon savings in kg CO2e
 */
export const calculateCarbonSavings = (
  greenDelivery,
  carbonOffset,
  carbonFootprint
) => {
  let savings = 0;

  if (greenDelivery) {
    // Green delivery saves approximately 1.5kg CO2e compared to standard delivery
    savings += 1.5;
  }

  if (carbonOffset) {
    // Carbon offset typically offsets about 80% of the carbon footprint
    savings += carbonFootprint * 0.8;
  }

  return savings.toFixed(2);
};

/**
 * Format price with currency symbol
 * @param {number} price - The price to format
 * @returns {string} - Formatted price with currency symbol
 */
export const formatPrice = (price) => {
  return `$${Number(price).toFixed(2)}`;
};

/**
 * Calculate the sustainability score for the entire cart
 * @param {Array} items - Cart items with product data
 * @returns {number} - Average sustainability score (0-100)
 */
export const calculateCartSustainabilityScore = (items) => {
  if (!items || items.length === 0) {
    return 0;
  }

  const totalScore = items.reduce((sum, item) => {
    const itemScore = item.product.sustainabilityScore || 0;
    return sum + itemScore * item.quantity;
  }, 0);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return Math.round(totalScore / totalQuantity);
};

/**
 * Count items with recycled materials in the cart
 * @param {Array} items - Cart items with product data
 * @returns {number} - Count of items with recycled materials
 */
export const countRecycledItems = (items) => {
  if (!items || items.length === 0) {
    return 0;
  }

  return items.filter((item) => item.product.recycledMaterials).length;
};
