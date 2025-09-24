import axios from 'axios';
import { getToken, storeToken, logout } from './auth';
import { API_BASE_URL } from './constant';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to request
api.interceptors.request.use(config => {
  const { accessToken } = getToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ---- Auto Refresh Access Token on 401 ----
let isRefreshing = false;
let pendingQueue = [];

const subscribeRefresh = (cb) => pendingQueue.push(cb);
const notifyRefreshed = (newAccess) => {
  pendingQueue.forEach((cb) => cb(newAccess));
  pendingQueue = [];
};

async function refreshAccessToken() {
  const { refreshToken } = getToken() || {};
  if (!refreshToken) throw new Error('No refresh token');
  // Use base axios to avoid interceptor loop
  const res = await axios.post(`${API_BASE_URL}/user/token/refresh/`, { refresh: refreshToken });
  const newAccess = res?.data?.access || res?.data?.access_token;
  if (!newAccess) throw new Error('Invalid refresh response');
  // Persist new access while keeping same refresh
  storeToken(newAccess, refreshToken);
  return newAccess;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config || {};
    // If not 401 or already retried, reject
    if (status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Mark to avoid infinite loop
    original._retry = true;

    // Start a single refresh for concurrent 401s
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAccess = await refreshAccessToken();
        isRefreshing = false;
        notifyRefreshed(newAccess);
        // Retry failed request with new token
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        isRefreshing = false;
        pendingQueue = [];
        // On refresh failure, logout
        logout();
        return Promise.reject(e);
      }
    }

    // If a refresh is already in progress, wait and then retry
    return new Promise((resolve, reject) => {
      subscribeRefresh((newAccess) => {
        if (!newAccess) {
          reject(error);
          return;
        }
        try {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newAccess}`;
          resolve(api(original));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
);

export default api;
