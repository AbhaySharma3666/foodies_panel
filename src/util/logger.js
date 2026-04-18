// Simple logger utility - only logs in development
const isDev = import.meta.env.VITE_ENV === "development";

export const logger = {
  log: (message, data = null) => {
    if (isDev) {
      console.log(`[LOG] ${message}`, data || "");
    }
  },
  error: (message, error = null) => {
    console.error(`[ERROR] ${message}`, error || "");
  },
  warn: (message, data = null) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, data || "");
    }
  },
};

export default logger;
