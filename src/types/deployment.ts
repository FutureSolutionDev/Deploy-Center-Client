/**
 * Deployment Types
 */

import type { IProject } from './project';
import type { IUser } from './auth';

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

export const EStepStatus = {
  Pending: 'pending',
  Running: 'running',
  Success: 'success',
  Failed: 'failed',
  Skipped: 'skipped',
} as const;

export type TStepStatus = typeof EStepStatus[keyof typeof EStepStatus];

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
