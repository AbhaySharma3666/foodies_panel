import axios from "axios";
import { API_ENDPOINTS, AXIOS_CONFIG } from "../config/api";
import { logger } from "../util/logger";

const axiosInstance = axios.create(AXIOS_CONFIG);

export const addToCart = async (foodId, token) => {
  try {
    if (!token) {
      logger.warn("No token provided for addToCart");
      return;
    }
    await axiosInstance.post(API_ENDPOINTS.CART.ADD, { foodId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (error.response?.status === 403) {
      logger.error("Authentication required for cart operations");
    } else {
      logger.error("Error adding to cart:", error);
    }
  }
};

export const removeQtyFromCart = async (foodId, token) => {
  try {
    if (!token) {
      logger.warn("No token provided for removeQtyFromCart");
      return;
    }
    await axiosInstance.post(API_ENDPOINTS.CART.REMOVE, { foodId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (error.response?.status === 403) {
      logger.error("Authentication required for cart operations");
    } else {
      logger.error("Error removing from cart:", error);
    }
  }
};

export const getCartData = async (token) => {
  try {
    if (!token) {
      logger.warn("No token provided for getCartData");
      return {};
    }
    const response = await axiosInstance.get(API_ENDPOINTS.CART.BASE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.items || {};
  } catch (error) {
    if (error.response?.status === 403) {
      logger.error("Authentication failed for cart - please log in again");
    } else {
      logger.error("Error getting cart data:", error);
    }
    return {};
  }
};