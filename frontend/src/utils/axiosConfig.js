import axios from 'axios';

// Create a configured axios instance for our app
const axiosInstance = axios.create({
  // Configure the base URL for all API calls
  baseURL: 'http://localhost:5000',
  
  // Set reasonable timeouts to prevent long-hanging requests
  timeout: 5000,
  
  // Add common headers if needed
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors to console (for debugging)
    console.error('API Error:', error.message);
    
    // Store error status in localStorage for app-wide error handling
    if (error.response) {
      localStorage.setItem('apiErrorStatus', error.response.status);
    } else {
      localStorage.setItem('apiErrorStatus', 'network-error');
    }
    
    return Promise.reject(error);
  }
);

// Add request interceptor to check connectivity
axiosInstance.interceptors.request.use(
  (config) => {
    // Don't attempt API calls if we're offline
    if (!navigator.onLine) {
      // Cancel the request
      const error = new Error('You are currently offline');
      error.config = config;
      error.isOffline = true;
      throw error;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock API functionality for when backend is unavailable
export const getMockProducts = () => {
  return [
    {
      _id: 'mock-1',
      name: 'Eco-Friendly Laptop',
      price: 899.99,
      image: 'https://via.placeholder.com/300x200?text=Eco+Laptop',
      category: 'Electronics',
      sustainabilityScore: 92,
      recycledMaterials: true,
      carbonFootprint: 85,
      description: 'Energy-efficient laptop made with recycled materials'
    },
    {
      _id: 'mock-2',
      name: 'Organic Cotton T-Shirt',
      price: 29.99,
      image: 'https://via.placeholder.com/300x200?text=Organic+Tshirt',
      category: 'Clothing',
      sustainabilityScore: 95,
      recycledMaterials: false,
      carbonFootprint: 5,
      description: 'Soft, organic cotton t-shirt with natural dyes'
    },
    {
      _id: 'mock-3',
      name: 'Bamboo Desk Organizer',
      price: 24.99,
      image: 'https://via.placeholder.com/300x200?text=Bamboo+Organizer',
      category: 'Office',
      sustainabilityScore: 88,
      recycledMaterials: false,
      carbonFootprint: 8,
      description: 'Stylish desk organizer made from sustainable bamboo'
    },
    {
      _id: 'mock-4',
      name: 'Recycled Paper Notebook',
      price: 12.99,
      image: 'https://via.placeholder.com/300x200?text=Recycled+Notebook',
      category: 'Office',
      sustainabilityScore: 84,
      recycledMaterials: true,
      carbonFootprint: 3,
      description: '100% recycled paper notebook with soy-based ink'
    }
  ];
};

export default axiosInstance;