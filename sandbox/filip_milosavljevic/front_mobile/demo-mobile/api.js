import axios from 'axios';

const API = axios.create({
    baseURL: 'http://192.168.1.206:5003/api/users',
});

export default API;
