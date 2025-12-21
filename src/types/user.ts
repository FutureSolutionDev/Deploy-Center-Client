/**
 * User Settings & Preferences Types
 */

import type { IUser } from './auth';

export interface IUserSettings {
  Id: number;
  UserId: number;
  EmailNotifications: boolean;
  DiscordWebhookUrl?: string | null;
  SlackWebhookUrl?: string | null;
  NotifyOnSuccess: boolean;
  NotifyOnFailure: boolean;
  NotifyOnProjectUpdate: boolean;
  NotifyOnSystemAlert: boolean;
  Timezone: string;
  DateFormat: string;
  TimeFormat: '12h' | '24h';
  Language: string;
  Theme: string;
  ColorTheme: string;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface INotificationSettings {
  EmailNotifications?: boolean;
  DiscordWebhookUrl?: string | null;
  SlackWebhookUrl?: string | null;
  NotifyOnSuccess?: boolean;
  NotifyOnFailure?: boolean;
  NotifyOnProjectUpdate?: boolean;
  NotifyOnSystemAlert?: boolean;
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
