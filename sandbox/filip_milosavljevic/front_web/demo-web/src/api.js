import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5003/api/users',
});

export default API;
