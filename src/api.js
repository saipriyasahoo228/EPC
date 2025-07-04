// import axios from 'axios';
// import {getToken, getNewAccessToken} from './auth';
// import {API_BASE_URL} from './constant';

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

// api.interceptors.request.use(config => {
//   const { accessToken } = getToken();
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response.status === 401) {
//       return getNewAccessToken().then(() => api(error.config));
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;






import axios from 'axios';
import { getToken, logout } from './auth';
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

// Handle 401 errors without refresh token logic
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn('Access token expired or invalid. Logging out...');
      logout(); // Optional: or show error and redirect manually
    }
    return Promise.reject(error);
  }
);

export default api;
