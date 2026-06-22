import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const instance = axios.create({
  baseURL: API_URL,
});

// REQUEST INTERCEPTOR: Attach Token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR: Auto-Logout on Expired Token
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; // Force redirect
    }
    return Promise.reject(error);
  },
);

export default instance;
