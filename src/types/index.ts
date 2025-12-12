/**
 * TypeScript Type Definitions for Deploy Center
 * Following PascalCase naming convention
 */

// User & Authentication Types
export const EUserRole = {
  Admin: 'admin',
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
}

export interface IRegisterData {
  Username: string;
  Email: string;
  Password: string;
}

export interface IAuthResponse {
  User: IUser;
  Tokens?: IAuthTokens; // Optional because server uses httpOnly cookies
}

// Project Types
export const EProjectType = {
  NodeJS: 'node',
  React: 'react',
  Static: 'static',
  Docker: 'docker',
  NextJS: 'nextjs',
  Other: 'other',
} as const;

export type TProjectType = typeof EProjectType[keyof typeof EProjectType];

export interface IProject {
  Id: number;
  Name: string;
  Description?: string;
  RepoUrl: string;
  Branch: string;
  ProjectPath: string;
  ProjectType: TProjectType;
  WebhookSecret: string;
  IsActive: boolean;
  Config: IProjectConfig;
  CreatedAt: Date;
  UpdatedAt: Date;

  // SSH Key Management Fields
  UseSshKey: boolean;
  SshKeyEncrypted?: string | null;
  SshKeyIv?: string | null;
  SshKeyAuthTag?: string | null;
  SshPublicKey?: string | null;
  SshKeyFingerprint?: string | null;
  SshKeyType?: 'ed25519' | 'rsa' | null;
  SshKeyCreatedAt?: Date | null;
  SshKeyRotatedAt?: Date | null;
  GitHubDeployKeyId?: number | null;
}

export interface IProjectConfig {
  Branch: string;
  AutoDeploy: boolean;
  DeployOnPaths?: string[];
  Environment?: string;
  Variables: Record<string, string>;
  Pipeline: IPipelineStep[];
  Notifications?: INotificationConfig;
  HealthCheck?: IHealthCheckConfig;
  Url?: string;
}

export interface IPipelineStep {
  Name: string;
  RunIf?: string;
  Run: string[];
}

export interface INotificationConfig {
  Discord?: IDiscordConfig;
  Slack?: ISlackConfig;
  Email?: IEmailConfig;
  Telegram?: ITelegramConfig;
  OnSuccess?: boolean;
  OnFailure?: boolean;
  OnStart?: boolean;
}

export interface IDiscordConfig {
  Enabled: boolean;
  WebhookUrl: string;
}

export interface ISlackConfig {
  Enabled: boolean;
  WebhookUrl: string;
}

export interface IEmailConfig {
  Enabled: boolean;
  Host: string;
  Port: number;
  Secure: boolean;
  User: string;
  Password?: string;
  From: string;
  To: string[];
}

export interface ITelegramConfig {
  Enabled: boolean;
  BotToken: string;
  ChatId: string;
}

export interface IHealthCheckConfig {
  Enabled: boolean;
  Url?: string;
  Interval?: number;
  Timeout?: number;
}

// Deployment Types
export const EDeploymentStatus = {
  Queued: 'queued',
  Pending: 'pending',
  InProgress: 'inProgress',
  Success: 'success',
  Failed: 'failed',
  Cancelled: 'cancelled',
  RolledBack: 'rolled_back',
} as const;

export type TDeploymentStatus = typeof EDeploymentStatus[keyof typeof EDeploymentStatus];

export const ETriggerType = {
  Webhook: 'webhook',
  Manual: 'manual',
  Scheduled: 'scheduled',
} as const;

export type TTriggerType = typeof ETriggerType[keyof typeof ETriggerType];

// Deployment Request (for manual deployments)
export interface IDeploymentRequest {
  ProjectId: number;
  Branch?: string;
  CommitHash?: string;
  CommitMessage?: string;
}


export interface IDeployment {
  Id: number;
  ProjectId: number;
  ProjectName?: string;
  Project?: IProject;
  Status: TDeploymentStatus;
  TriggerType: TTriggerType;
  Branch: string;
  Commit: string;
  TriggeredBy?: number;
  TriggeredByUser?: IUser;
  StartedAt?: Date;
  CompletedAt?: Date;
  Duration?: number;
  LogFile?: string;
  ErrorMessage?: string;
  CommitMessage?: string;
  CommitAuthor?: string;
  Author?: string;
  CreatedAt: Date;
}

export interface IDeploymentStep {
  Id: number;
  DeploymentId: number;
  StepNumber: number;
  StepName: string;
  Status: TStepStatus;
  StartedAt?: Date;
  CompletedAt?: Date;
  Duration?: number;
  Output?: string;
  ErrorMessage?: string;
}

export const EStepStatus = {
  Pending: 'pending',
  Running: 'running',
  Success: 'success',
  Failed: 'failed',
  Skipped: 'skipped',
} as const;

export type TStepStatus = typeof EStepStatus[keyof typeof EStepStatus];

// Statistics Types
export interface IProjectStatistics {
  TotalDeployments: number;
  SuccessfulDeployments: number;
  FailedDeployments: number;
  AverageDuration: number;
  LastDeployment?: IDeployment;
  DeploymentsByDay: IDeploymentByDay[];
  SuccessRate: number;
}

// Deployment Statistics
export interface IDeploymentStatistics {
  Total: number;
  Success: number;
  Failed: number;
  Pending: number;
  InProgress: number;
  Cancelled: number;
  SuccessRate: number;
  AverageDuration: number;
  TotalDuration: number;
  DeploymentsToday: number;
  DeploymentsThisWeek: number;
  DeploymentsThisMonth: number;
}

// Queue Status
export interface IQueueStatus {
  TotalQueued: number;
  QueuedByProject: Array<{
    ProjectId: number;
    ProjectName: string;
    QueuedCount: number;
  }>;
  CurrentlyRunning: number;
  EstimatedWaitTime: number;
}

// Paginated Response
export interface IPaginatedResponse<T> {
  Data: T[];
  Total: number;
  Page: number;
  Limit: number;
  TotalPages: number;
}

export interface IDeploymentByDay {
  Date: string;
  Total: number;
  Success: number;
  Failed: number;
}

export interface IDashboardStats {
  TotalProjects: number;
  ActiveProjects: number;
  TotalDeployments: number;
  SuccessfulDeployments: number;
  FailedDeployments: number;
  AverageDuration: number;
  RecentDeployments: IDeployment[];
  DeploymentsTrend: IDeploymentByDay[];
}

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

// Notification Types
export interface INotification {
  Id: string;
  Type: 'success' | 'error' | 'warning' | 'info';
  Message: string;
  Timestamp: Date;
}
