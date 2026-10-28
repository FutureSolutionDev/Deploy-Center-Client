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

/**
 * Returned by /auth/login for 2FA accounts. Since v3.0.1 the server binds the
 * second step to an httpOnly `mfa_pending` cookie; no user id is exposed.
 */
export interface ITwoFactorChallenge {
  TwoFactorRequired: true;
  Username: string;
  ExpiresInSeconds?: number;
}

export interface ITwoFactorStatus {
  enabled: boolean;
  enabledAt?: Date | null;
  backupCodesRemaining?: number;
  legacyBackupCodesInvalidated?: boolean;
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
