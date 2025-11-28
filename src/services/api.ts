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

// Response Interceptor - Handle errors globally
ApiInstance.interceptors.response.use(
  (response: AxiosResponse<IApiResponse>) => {
    return response;
  },
  async (error: AxiosError<IApiError>) => {
    const errorMessage = error.response?.data?.Message || 'An unexpected error occurred';

    // Handle 401 Unauthorized - User not authenticated
    if (error.response?.status === 401) {
      // Clear any client-side non-sensitive data
      localStorage.removeItem('user_preferences');

      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden - Access denied or CSRF token invalid
    if (error.response?.status === 403) {
      // Check if it's a CSRF token error
      if (errorMessage.toLowerCase().includes('csrf') || errorMessage.toLowerCase().includes('token')) {
        if (process.env.NODE_ENV === 'development') {
          console.error('CSRF token validation failed - Please refresh the page');
        }
        // Optionally refresh the page to get new CSRF token
        // window.location.reload();
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Access forbidden:', errorMessage);
        }
      }
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Resource not found:', error.config?.url);
      }
    }

    // Handle 409 Conflict - Idempotency key conflict
    if (error.response?.status === 409) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Duplicate request detected (Idempotency conflict)');
      }
    }

    // Handle 422 Unprocessable Entity - Validation errors
    if (error.response?.status === 422) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Validation error:', errorMessage);
      }
    }

    // Handle 429 Too Many Requests - Rate limiting
    if (error.response?.status === 429) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Too many requests - Please slow down');
      }
    }

    // Handle 500+ Server Errors
    if (error.response && error.response.status >= 500) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Server error:', error.response.data);
      }
    }

    // Network Error - Server unreachable
    if (!error.response) {
      if (process.env.NODE_ENV === 'development') {
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
