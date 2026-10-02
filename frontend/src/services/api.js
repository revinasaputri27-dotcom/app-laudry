import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('revina_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('revina_token');
      localStorage.removeItem('revina_user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export const formatRupiah = (value) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0
}).format(Number(value || 0));

export const formatTanggal = (value) => new Intl.DateTimeFormat('id-ID', {
  day: '2-digit', month: 'short', year: 'numeric'
}).format(new Date(value));

export default api;