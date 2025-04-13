/**
 * Mock products data for development and testing
 * Used as fallback when the API fails to fetch products
 */

const mockProducts = [
  {
    _id: "eco-speaker-1",
    name: "Solar Bluetooth Speaker",
    price: 79.0,
    category: "Electronics",
    description:
      "Environmentally friendly bluetooth speaker with built-in solar charging panel",
    sustainabilityScore: 95,
    carbonFootprint: 3.2,
    recycledMaterials: true,
    image: "/images/products/solar-speaker.jpg",
  },
  {
    _id: "bamboo-desk-1",
    name: "Bamboo Standing Desk",
    price: 249.99,
    category: "Furniture",
    description: "Adjustable height standing desk made from sustainable bamboo",
    sustainabilityScore: 90,
    carbonFootprint: 10.5,
    recycledMaterials: true,
    image: "/images/products/bamboo-desk.jpg",
  },
  {
    _id: "solar-charger-1",
    name: "Portable Solar Charger",
    price: 49.99,
    category: "Electronics",
    description: "Compact solar panel for charging devices on the go",
    sustainabilityScore: 88,
    carbonFootprint: 2.8,
    recycledMaterials: false,
    image: "/images/products/solar-charger.jpg",
  },
  {
    _id: "water-bottle-1",
    name: "Insulated Water Bottle",
    price: 29.99,
    category: "Home",
    description:
      "Reusable insulated water bottle made from recycled stainless steel",
    sustainabilityScore: 85,
    carbonFootprint: 5.2,
    recycledMaterials: true,
    image: "/images/products/water-bottle.jpg",
  },
  {
    _id: "eco-backpack-1",
    name: "Recycled Polyester Backpack",
    price: 79.99,
    category: "Clothing",
    description: "Durable backpack made from recycled polyester fabric",
    sustainabilityScore: 80,
    carbonFootprint: 6.5,
    recycledMaterials: true,
    image: "/images/products/eco-backpack.jpg",
  },
  {
    _id: "bamboo-cutlery-1",
    name: "Bamboo Cutlery Set",
    price: 19.99,
    category: "Home",
    description: "Portable bamboo cutlery set to replace disposable utensils",
    sustainabilityScore: 93,
    carbonFootprint: 1.8,
    recycledMaterials: false,
    image: "/images/products/bamboo-cutlery.jpg",
  },
  {
    _id: "led-bulb-pack-1",
    name: "Smart LED Bulb 4-Pack",
    price: 39.99,
    category: "Electronics",
    description:
      "Energy-efficient smart LED bulbs that connect to your home network",
    sustainabilityScore: 75,
    carbonFootprint: 8.3,
    recycledMaterials: false,
    image: "/images/products/led-bulbs.jpg",
  },
  {
    _id: "organic-sheets-1",
    name: "Organic Cotton Bed Sheets",
    price: 89.99,
    category: "Home",
    description: "Soft bed sheets made from 100% organic cotton",
    sustainabilityScore: 87,
    carbonFootprint: 7.2,
    recycledMaterials: false,
    image: "/images/products/organic-sheets.jpg",
  },
  {
    _id: "plant-pots-1",
    name: "Biodegradable Plant Pots (Set of 6)",
    price: 24.99,
    category: "Home",
    description:
      "Plant pots made from biodegradable materials that break down naturally",
    sustainabilityScore: 98,
    carbonFootprint: 1.5,
    recycledMaterials: true,
    image: "/images/products/plant-pots.jpg",
  },
  {
    _id: "eco-laptop-1",
    name: "Energy-Efficient Laptop",
    price: 1299.99,
    category: "Electronics",
    description:
      "High-performance laptop with eco-friendly materials and energy efficiency",
    sustainabilityScore: 72,
    carbonFootprint: 18.5,
    recycledMaterials: true,
    image: "/images/products/eco-laptop.jpg",
  },
];

export default mockProducts;
