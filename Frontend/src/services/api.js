import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jobfinder_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jobfinder_token");
      localStorage.removeItem("jobfinder_role");
      localStorage.removeItem("jobfinder_user");
    }

    return Promise.reject(error);
  }
);

export default api;