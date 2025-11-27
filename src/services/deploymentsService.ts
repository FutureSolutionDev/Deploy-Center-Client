import ApiInstance from './api';

export interface IDeployment {
  id: number;
  projectId: number;
  projectName: string;
  branch: string;
  commitHash: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  triggerType: 'webhook' | 'manual';
  timestamp: string;
  duration?: string;
}

export const DeploymentsService = {
  getAll: async (): Promise<IDeployment[]> => {
    try {
      const response = await ApiInstance.get('/deployments');
      return response.data.Data || [];
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
      // Return empty array on error
      return [];
    }
  },

  getById: async (id: number): Promise<IDeployment> => {
    const response = await ApiInstance.get(`/deployments/${id}`);
    return response.data.Data;
  },

  getByProject: async (projectId: number): Promise<IDeployment[]> => {
    const response = await ApiInstance.get(`/projects/${projectId}/deployments`);
    return response.data.Data || [];
  },

  getLogs: async (id: number): Promise<string> => {
    const response = await ApiInstance.get(`/deployments/${id}/logs`);
    return response.data.Data || '';
  },

  cancel: async (id: number): Promise<void> => {
    await ApiInstance.post(`/deployments/${id}/cancel`);
  },

  retry: async (id: number): Promise<IDeployment> => {
    const response = await ApiInstance.post(`/deployments/${id}/retry`);
    return response.data.Data;
  },
};
