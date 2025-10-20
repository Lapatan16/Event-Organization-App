import axios from "axios";

// Create an instance
const api = axios.create({
  baseURL: "", 
});

// Add an interceptor
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken"); // or AsyncStorage in React Native
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
