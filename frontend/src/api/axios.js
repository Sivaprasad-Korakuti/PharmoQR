import axios from 'axios';

const API = axios.create({
  baseURL: window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api'
});

export default API;
