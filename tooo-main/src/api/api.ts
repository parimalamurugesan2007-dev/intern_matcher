import axios, { AxiosError } from 'axios';

// Base URL for the existing FastAPI backend.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
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
