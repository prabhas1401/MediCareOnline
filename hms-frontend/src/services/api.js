import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use(
  (config) => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      if (loggedInUser?.token) {
        config.headers.Authorization = `Bearer ${loggedInUser.token}`;
      }
    } catch (error) {
      console.error('Error parsing loggedInUser from localStorage', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;


