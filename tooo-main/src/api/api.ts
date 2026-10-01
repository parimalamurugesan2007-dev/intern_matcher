import axios, { AxiosError } from 'axios';

// Base URL for the existing FastAPI backend.
const BASE_URL = "https://intern-matcher-ml.onrender.com";
console.log("BACKEND URL:", BASE_URL);
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT token (if present in localStorage) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Surface a readable error message from any failed request.
export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ detail?: string; message?: string }>;
  if (axiosError?.response?.data?.detail) {
    return String(axiosError.response.data.detail);
  }
  if (axiosError?.response?.data?.message) {
    return String(axiosError.response.data.message);
  }
  if (axiosError?.code === 'ERR_NETWORK') {
    return 'Cannot reach the backend server. Make sure your FastAPI app is running and CORS is enabled.';
  }
  if (axiosError?.message) {
    return axiosError.message;
  }
  return 'Something went wrong. Please try again.';
}

export default api;
