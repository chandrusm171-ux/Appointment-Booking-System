import axios from "axios";
import { clearAdminSession, getAdminToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token && !String(config.url || "").endsWith("/admin/login")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || "");

    if (
      status === 401 &&
      !requestUrl.endsWith("/admin/login") &&
      window.location.pathname.startsWith("/admin")
    ) {
      clearAdminSession();
      const target = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace(`/admin/login?reason=session-expired&returnTo=${target}`);
    }

    return Promise.reject(error);
  }
);

export default api;
