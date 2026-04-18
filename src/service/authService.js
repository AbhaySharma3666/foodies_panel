import axios from "axios";
import { API_ENDPOINTS, AXIOS_CONFIG } from "../config/api";
import { logger } from "../util/logger";

const axiosInstance = axios.create(AXIOS_CONFIG);

export const registerUser = async (data) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, data);
        return response;
    } catch (error) {
        logger.error("Registration error:", error);
        throw error;
    }
};

export const loginUser = async (data) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, data);
        return response.data;
    } catch (error) {
        logger.error("Login error:", error);
        throw error;
    }
};