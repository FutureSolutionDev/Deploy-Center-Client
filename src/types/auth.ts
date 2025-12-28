/**
 * Authentication & User Types
 */

export const EUserRole = {
  Admin: 'admin',
  Manager: 'manager',
  Developer: 'developer',
  Viewer: 'viewer',
} as const;

export type TUserRole = typeof EUserRole[keyof typeof EUserRole];

export interface IUser {
  Id: number;
  Username: string;
  Email: string;
  Role: TUserRole;
  IsActive: boolean;
  TwoFactorEnabled: boolean;
  LastLogin?: Date;
  FullName?: string | null;
  AvatarUrl?: string | null;
  AccountStatus?: 'active' | 'suspended' | 'deleted';
  LastPasswordChangeAt?: Date | null;
  Settings?: import('./user').IUserSettings;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface IAuthTokens {
  AccessToken: string;
  RefreshToken: string;
}

export interface ILoginCredentials {
  Username: string;
  Password: string;
  TotpCode?: string;
}

export interface ITwoFactorChallenge {
  TwoFactorRequired: true;
  UserId: number;
  Username: string;
}

export interface IRegisterData {
  Username: string;
  Email: string;
  Password: string;
}

export interface IAuthResponse {
  User: IUser;
  SessionId: number;
  Tokens?: IAuthTokens;
}
