// Centralized API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/register`,
    LOGIN: `${API_BASE_URL}/login`,
  },
  FOODS: {
    LIST: `${API_BASE_URL}/foods`,
    DETAILS: (id) => `${API_BASE_URL}/foods/${id}`,
  },
  CART: {
    BASE: `${API_BASE_URL}/cart`,
    ADD: `${API_BASE_URL}/cart`,
    REMOVE: `${API_BASE_URL}/cart/remove`,
  },
  ORDERS: {
    CREATE: `${API_BASE_URL}/orders`,
    LIST: `${API_BASE_URL}/orders`,
    DETAILS: (id) => `${API_BASE_URL}/orders/${id}`,
    VERIFY: `${API_BASE_URL}/orders/verify`,
  },
};

// Axios instance configuration
export const AXIOS_CONFIG = {
  timeout: 120000, // 120s to handle Render free tier cold starts
  headers: {
    "Content-Type": "application/json",
  },
};
