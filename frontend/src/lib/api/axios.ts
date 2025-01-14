// src/lib/api/axios.ts
import axios from 'axios';

const api = axios.create({
    // Remove the /api from the end if your backend is at localhost:3000
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;