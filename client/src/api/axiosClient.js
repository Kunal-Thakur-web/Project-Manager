import axios from "axios";

// Base URL of the backend API. Override by creating a client/.env file with
// VITE_API_BASE_URL=http://localhost:3000/api/v1
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export const ACCESS_TOKEN_KEY = "pm_access_token";
export const REFRESH_TOKEN_KEY = "pm_refresh_token";

export const tokenStore = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Queue of requests waiting on a token refresh so we only hit
// /auth/refresh-token once even if several requests 401 at the same time.
let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const isAuthRoute =
      config?.url?.includes("/auth/login") ||
      config?.url?.includes("/auth/register") ||
      config?.url?.includes("/auth/refresh-token");

    if (response?.status !== 401 || isAuthRoute || config._retry) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) {
      tokenStore.clear();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        config._retry = true;
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${baseURL}/auth/refresh-token`, {
        refreshToken,
      });
      const { accessToken, refreshToken: newRefreshToken } = data.data;
      tokenStore.setTokens(accessToken, newRefreshToken);
      resolveQueue(null, accessToken);
      config.headers.Authorization = `Bearer ${accessToken}`;
      return api(config);
    } catch (refreshError) {
      resolveQueue(refreshError, null);
      tokenStore.clear();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
