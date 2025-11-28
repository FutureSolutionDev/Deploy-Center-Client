import ApiInstance from './api';
import type { IDeployment, IDeploymentStatistics, IQueueStatus } from '@/types';

export const DeploymentsService = {
  getAll: async (): Promise<IDeployment[]> => {
    try {
      const response = await ApiInstance.get('/deployments');
      const data = response.data.Data;
      return data?.Deployments || [];
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
      // Return empty array on error
      return [];
    }
  },

  getById: async (id: number): Promise<IDeployment> => {
    const response = await ApiInstance.get(`/deployments/${id}`);
    const data = response.data.Data;
    return data?.Deployment;
  },

  getByProject: async (projectId: number): Promise<IDeployment[]> => {
    const response = await ApiInstance.get(`/deployments/projects/${projectId}/deployments`);
    const data = response.data.Data;
    return data?.Deployments || [];
  },

  getLogs: async (id: number): Promise<string> => {
    const response = await ApiInstance.get(`/deployments/${id}/logs`);
    const data = response.data.Data;
    return data?.Logs || '';
  },

  cancel: async (id: number): Promise<void> => {
    await ApiInstance.post(`/deployments/${id}/cancel`);
  },

  retry: async (id: number): Promise<IDeployment> => {
    const response = await ApiInstance.post(`/deployments/${id}/retry`);
    const data = response.data.Data;
    return data?.Deployment;
  },

  // Statistics APIs
  getStatistics: async (): Promise<IDeploymentStatistics> => {
    const response = await ApiInstance.get('/deployments/statistics');
    const data = response.data.Data;
    return data?.Statistics;
  },

  getProjectStatistics: async (projectId: number): Promise<IDeploymentStatistics> => {
    const response = await ApiInstance.get(`/deployments/statistics?projectId=${projectId}`);
    const data = response.data.Data;
    return data?.Statistics;
  },

  // Queue Management APIs
  getQueueStatus: async (): Promise<IQueueStatus> => {
    const response = await ApiInstance.get('/deployments/queue/status');
    const data = response.data.Data;
    return data?.QueueStatus;
  },

  getProjectQueueStatus: async (projectId: number): Promise<IQueueStatus> => {
    const response = await ApiInstance.get(`/deployments/projects/${projectId}/queue/status`);
    const data = response.data.Data;
    return data?.QueueStatus;
  },

  cancelAllPending: async (projectId: number): Promise<void> => {
    await ApiInstance.post(`/deployments/projects/${projectId}/queue/cancel-all`);
  },
};
