/**
 * API Interceptors with Toast Notifications
 * Handles success/error messages globally
 */

import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// This will be set by App.tsx after ToastContext is available
let toastHandlers: {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
} | null = null;

export const setToastHandlers = (handlers: typeof toastHandlers) => {
  toastHandlers = handlers;
};

/**
 * Setup response interceptor with toast notifications
 */
export const setupResponseInterceptor = (apiInstance: AxiosInstance) => {
  // Response interceptor - show success messages
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Show success toast for non-GET requests
      const method = response.config.method?.toUpperCase();

      if (toastHandlers && method && method !== 'GET') {
        const message = response.data?.Message || getDefaultSuccessMessage(method);
        toastHandlers.showSuccess(message);
      }

      return response;
    },
    (error: AxiosError) => {
      // Handle error responses with toast
      if (toastHandlers) {
        const errorMessage = getErrorMessage(error);

        // Don't show toast for 401 errors (handled by auth redirect)
        if (error.response?.status !== 401) {
          toastHandlers.showError(errorMessage);
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Get default success message based on HTTP method
 */
const getDefaultSuccessMessage = (method: string): string => {
  switch (method) {
    case 'POST':
      return 'Created successfully';
    case 'PUT':
    case 'PATCH':
      return 'Updated successfully';
    case 'DELETE':
      return 'Deleted successfully';
    default:
      return 'Operation successful';
  }
};

/**
 * Extract error message from Axios error
 */
const getErrorMessage = (error: AxiosError): string => {
  if (error.response) {
    // Server responded with error
    const data = error.response.data as any;

    if (data?.Message) {
      return data.Message;
    }

    if (data?.error) {
      return typeof data.error === 'string' ? data.error : 'An error occurred';
    }

    // HTTP status messages
    switch (error.response.status) {
      case 400:
        return 'Bad request - Please check your input';
      case 401:
        return 'Unauthorized - Please login';
      case 403:
        return 'Forbidden - You don\'t have permission';
      case 404:
        return 'Not found';
      case 409:
        return 'Conflict - Resource already exists';
      case 422:
        return 'Validation error - Please check your input';
      case 429:
        return 'Too many requests - Please try again later';
      case 500:
        return 'Server error - Please try again';
      case 503:
        return 'Service unavailable - Please try again later';
      default:
        return `Error: ${error.response.status}`;
    }
  }

  if (error.request) {
    // Request made but no response
    return 'Network error - Please check your connection';
  }

  // Something else happened
  return error.message || 'An unexpected error occurred';
};
