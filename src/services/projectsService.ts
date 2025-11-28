import ApiInstance from './api';
import type { IProject, IProjectStatistics, IDeployment, IDeploymentRequest } from '@/types';

export const ProjectsService = {
  getAll: async (): Promise<IProject[]> => {
    try {
      const response = await ApiInstance.get('/projects');
      const data = response.data.Data;
      return data?.Projects || [];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<IProject> => {
    return ApiInstance.get(`/projects/${id}`).then((res) => res.data.Data?.Project);
  },

  create: async (data: Partial<IProject>): Promise<IProject> => {
    return ApiInstance.post('/projects', data).then((res) => res.data.Data?.Project);
  },

  update: async (id: number, data: Partial<IProject>): Promise<IProject> => {
    return ApiInstance.put(`/projects/${id}`, data).then((res) => res.data.Data?.Project);
  },

  delete: async (id: number): Promise<void> => {
    return ApiInstance.delete(`/projects/${id}`).then((res) => res.data);
  },

  deploy: async (id: number, data?: IDeploymentRequest): Promise<IDeployment> => {
    const response = await ApiInstance.post(`/deployments/projects/${id}/deploy`, data || {});
    return response.data.Data?.Deployment;
  },

  getBranches: async (id: number): Promise<string[]> => {
    try {
      const response = await ApiInstance.get(`/projects/${id}/branches`);
      return response.data.Data?.Branches || ['main', 'master', 'develop'];
    } catch (_error) {
      // Fallback to common branches if API fails
      return ['main', 'master', 'develop'];
    }
  },

  regenerateWebhook: async (id: number): Promise<string> => {
    const response = await ApiInstance.post(`/projects/${id}/regenerate-webhook`);
    return response.data.Data?.WebhookSecret;
  },

  getStatistics: async (id: number): Promise<IProjectStatistics> => {
    const response = await ApiInstance.get(`/projects/${id}/statistics`);
    return response.data.Data?.Statistics;
  },
};


