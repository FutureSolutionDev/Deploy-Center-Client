/**
 * Axios API Instance
 * Configured with secure cookies, CSRF protection, and Idempotency
 * Following security best practices for sensitive data
 */

import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { Config } from '@/utils/config';
import type { IApiResponse, IApiError } from '@/types';

// Generate unique Idempotency Key
const GenerateIdempotencyKey = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

// Get CSRF Token from cookie
const GetCsrfToken = (): string | undefined => {
  return Cookies.get('XSRF-TOKEN');
};

// Create Axios instance with secure configuration
const ApiInstance: AxiosInstance = axios.create({
  baseURL: Config.Api.BaseUrl,
  timeout: Config.Api.Timeout,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with requests
  withCredentials: true,
});

// Request Interceptor - Add CSRF token and Idempotency key
ApiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Headers are guaranteed to exist in InternalAxiosRequestConfig
    const headers = config.headers;

    // Add CSRF Token to all state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = GetCsrfToken();
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      // Add Idempotency Key for POST/PUT/PATCH requests
      if (['post', 'put', 'patch'].includes(config.method?.toLowerCase() || '')) {
        // Check if idempotency key already exists in headers or generate new one
        if (!headers['Idempotency-Key']) {
          headers['Idempotency-Key'] = GenerateIdempotencyKey();
        }
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Response Interceptor - Handle errors globally
ApiInstance.interceptors.response.use(
  (response: AxiosResponse<IApiResponse>) => {
    return response;
  },
  async (error: AxiosError<IApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const errorMessage = error.response?.data?.Message || 'An unexpected error occurred';

    // Handle 401 Unauthorized - Try to refresh token first
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Skip refresh for login/register/refresh endpoints to avoid infinite loop
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        // Clear any client-side non-sensitive data
        localStorage.removeItem('user_preferences');

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return ApiInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token using the refresh_token cookie
        await ApiInstance.post('/auth/refresh', {});

        // Token refreshed successfully, process queued requests
        processQueue(null);
        isRefreshing = false;

        // Retry the original request
        return ApiInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear queue and redirect to login
        processQueue(refreshError as AxiosError);
        isRefreshing = false;

        // Clear any client-side non-sensitive data
        localStorage.removeItem('user_preferences');

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - Access denied or CSRF token invalid
    if (error.response?.status === 403) {
      // Check if it's a CSRF token error
      if (errorMessage.toLowerCase().includes('csrf') || errorMessage.toLowerCase().includes('token')) {
        if (import.meta.env.MODE === 'development') {
          console.error('CSRF token validation failed - Please refresh the page');
        }
        // Optionally refresh the page to get new CSRF token
        // window.location.reload();
      } else {
        if (import.meta.env.MODE === 'development') {
          console.error('Access forbidden:', errorMessage);
        }
      }
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      if (import.meta.env.MODE === 'development') {
        console.warn('Resource not found:', error.config?.url);
      }
    }

    // Handle 409 Conflict - Idempotency key conflict
    if (error.response?.status === 409) {
      if (import.meta.env.MODE === 'development') {
        console.warn('Duplicate request detected (Idempotency conflict)');
      }
    }

    // Handle 422 Unprocessable Entity - Validation errors
    if (error.response?.status === 422) {
      if (import.meta.env.MODE === 'development') {
        console.warn('Validation error:', errorMessage);
      }
    }

    // Handle 429 Too Many Requests - Rate limiting
    if (error.response?.status === 429) {
      if (import.meta.env.MODE === 'development') {
        console.warn('Too many requests - Please slow down');
      }
    }

    // Handle 500+ Server Errors
    if (error.response && error.response.status >= 500) {
      if (import.meta.env.MODE === 'development') {
        console.error('Server error:', error.response.data);
      }
    }

    // Network Error - Server unreachable
    if (!error.response) {
      if (import.meta.env.MODE === 'development') {
        console.error('Network error - Server is unreachable');
      }
    }

    return Promise.reject(error);
  }
);

// Export API instance
export default ApiInstance;

// Export utility functions
export { GenerateIdempotencyKey, GetCsrfToken };
