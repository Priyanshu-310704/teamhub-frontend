import axios, { AxiosError } from 'axios';
import { ProblemDetail } from '@/types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request interceptor: Inject Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teamhub_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Extract RFC 7807 ProblemDetail or meaningful message
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetail>) => {
    if (error.response?.status === 401) {
      // If 401 Unauthorized on protected routes, broadcast unauthorized event
      const isAuthRoute = error.config?.url?.includes('/auth/');
      if (!isAuthRoute) {
        window.dispatchEvent(new CustomEvent('teamhub:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly error message from an Axios error,
 * prioritizing RFC 7807 ProblemDetail attributes.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ProblemDetail | undefined;
    if (data) {
      if (data.errors && Object.keys(data.errors).length > 0) {
        // Return first validation message or joined list
        const firstField = Object.keys(data.errors)[0];
        return `${data.errors[firstField]}`;
      }
      if (data.detail) {
        return data.detail;
      }
      if (data.title) {
        return data.title;
      }
    }
    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.response?.status === 409) {
      return 'A conflict occurred with existing data.';
    }
    if (error.message === 'Network Error') {
      return 'Unable to reach backend server. Please verify the Spring Boot service is running on port 8080.';
    }
    return error.message || 'An unexpected error occurred.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}

export default apiClient;
