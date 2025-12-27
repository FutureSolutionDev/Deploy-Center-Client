/**
 * Project Types
 */

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
  SyncIgnorePatterns?: string[]; // Custom patterns to ignore during sync (e.g., node_modules, Backup, Logs)
  RsyncOptions?: string; // Custom rsync options (e.g., '--no-perms --no-owner --no-group --omit-dir-times')
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
