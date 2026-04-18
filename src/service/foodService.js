import axios from "axios";
import { API_ENDPOINTS, AXIOS_CONFIG } from "../config/api";
import { logger } from "../util/logger";

const axiosInstance = axios.create(AXIOS_CONFIG);

export const fetchFoodList = async () => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.FOODS.LIST);
        return response.data;
    } catch (error) {
        logger.error("Error fetching food list:", error);
        throw error;
    }
};

export const fetchFoodDetails = async (id) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.FOODS.DETAILS(id));
        return response.data;
    } catch (error) {
        logger.error(`Error fetching food details for ID ${id}:`, error);
        throw error;
    }
};

