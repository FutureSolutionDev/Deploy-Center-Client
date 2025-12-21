/**
 * Common & Shared Types
 */

// Theme Types
export type TThemeMode = 'light' | 'dark';

export interface IThemeOption {
  Name: string;
  Value: string;
  PrimaryColor: string;
  SecondaryColor: string;
}

// Language Types
export type TLanguage = 'ar' | 'en';

// API Response Types
export interface IApiResponse<T = unknown> {
  Message: string;
  Data?: T;
  Error?: boolean;
  Code?: number;
}

export interface IApiError {
  Message: string;
  Code?: number;
  Details?: unknown;
}

// Paginated Response
export interface IPaginatedResponse<T> {
  Data: T[];
  Total: number;
  Page: number;
  Limit: number;
  TotalPages: number;
}

// Notification Types
export interface INotification {
  Id: string;
  Type: 'success' | 'error' | 'warning' | 'info';
  Message: string;
  Timestamp: Date;
}
