
import axios from 'axios';
import { redirect } from 'react-router-dom';
import { getAuthStore } from '../utils/get-auth-store.util';

export const api = axios.create({
  //baseURL: "https://localhost:7185/api",
  baseURL: 'https://distribuidora-gc-api.onrender.com',
});


api.interceptors.request.use(
  (config) => {
        const { state } = getAuthStore();

  const token = state?.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      console.error('Token expirado ou inválido. Redirecionando para login.');
      redirect('/login');
    }

    return Promise.reject(error);
  }
);