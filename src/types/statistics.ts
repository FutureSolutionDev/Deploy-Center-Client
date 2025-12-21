/**
 * Statistics & Dashboard Types
 */

import type { IDeployment } from './deployment';

export interface IDeploymentByDay {
  Date: string;
  Total: number;
  Success: number;
  Failed: number;
}

export interface IProjectStatistics {
  TotalDeployments: number;
  SuccessfulDeployments: number;
  FailedDeployments: number;
  AverageDuration: number;
  LastDeployment?: IDeployment;
  DeploymentsByDay: IDeploymentByDay[];
  SuccessRate: number;
}

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
