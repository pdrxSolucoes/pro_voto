// src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Only run on client side
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        // Redirect to login if needed
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Same API methods as before
export const emendasApi = {
  getAll: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await api.get("/emendas", { params });
    return response.data;
  },
  // Other methods...
};

// Export other API methods...

export default api;
