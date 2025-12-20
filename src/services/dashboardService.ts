import ApiInstance from './api';
import type { IDeployment } from '@/types';

export interface IDashboardStats {
  TotalProjects: number;
  TotalDeployments: number;
  SuccessfulDeployments: number;
  FailedDeployments: number;
}

export interface IDashboardSummary {
  Stats: IDashboardStats;
  RecentDeployments: IDeployment[];
}

export interface IDeploymentStats {
  Total: number;
  Success: number;
  Failed: number;
  InProgress: number;
  Queued: number;
  Pending: number;
  Cancelled: number;
}

export interface IProjectActivity {
  ProjectId: number;
  ProjectName: string;
  ProjectType: string;
  TotalDeployments: number;
  SuccessfulDeployments: number;
  FailedDeployments: number;
  LastDeploymentAt: string | null;
}

export const DashboardService = {
  /**
   * Get dashboard summary (stats + recent 5 deployments)
   * Optimized endpoint that replaces fetching all projects + all deployments
   */
  getSummary: async (): Promise<IDashboardSummary> => {
    const response = await ApiInstance.get('/dashboard/summary');
    return response.data.Data;
  },

  /**
   * Get deployment statistics for a specific time range
   */
  getDeploymentStats: async (startDate?: string, endDate?: string): Promise<{
    Stats: IDeploymentStats;
    StartDate: string;
    EndDate: string;
  }> => {
    const response = await ApiInstance.get('/dashboard/stats', {
      params: { startDate, endDate },
    });
    return response.data.Data;
  },

  /**
   * Get project activity summary (deployment counts per project)
   */
  getProjectActivity: async (limit: number = 10): Promise<{
    Activity: IProjectActivity[];
  }> => {
    const response = await ApiInstance.get('/dashboard/project-activity', {
      params: { limit },
    });
    return response.data.Data;
  },
};
