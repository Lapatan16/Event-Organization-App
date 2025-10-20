import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:5001/api/cars', // ili http ako nisi u HTTPS
});

export default API;