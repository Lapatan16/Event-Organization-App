import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.0.33:5000/api/cars', // zameni sa svojom lokalnom IP adresom i portom
});

export default API;