/**
 * User Settings & Preferences Types
 */

import type { IUser } from './auth';

export interface IUserSettings {
  Id: number;
  UserId: number;
  // v3.0 — per-user notification fields removed; notifications are
  // managed centrally via NotificationProviders/Channels + per-project
  // ProjectNotificationSubscriptions (F-006).
  Timezone: string;
  DateFormat: string;
  TimeFormat: '12h' | '24h';
  Language: string;
  Theme: string;
  ColorTheme: string;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface IUserPreferences {
  Timezone?: string;
  DateFormat?: string;
  TimeFormat?: '12h' | '24h';
  Language?: string;
  Theme?: string;
  ColorTheme?: string;
}

export interface IUserProfile {
  User: IUser;
  Settings?: IUserSettings;
}

export interface IApiKey {
  Id: number;
  UserId: number;
  Name: string;
  Description?: string | null;
  KeyPrefix: string;
  Scopes: string[];
  IsActive: boolean;
  ExpiresAt?: Date | null;
  LastUsedAt?: Date | null;
  UsageCount: number;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface IApiKeyCreateResponse {
  keyId: number;
  key: string;
  prefix: string;
}

export interface IUserSession {
  Id: number;
  UserId: number;
  DeviceInfo?: Record<string, any> | null;
  IpAddress?: string | null;
  UserAgent?: string | null;
  IsActive: boolean;
  ExpiresAt: Date;
  CreatedAt: Date;
  LastActivityAt: Date;
}
