import ApiInstance from './api';
import type { IProject, IProjectStatistics } from '@/types';

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

  deploy: async (id: number, branch?: string): Promise<any> => {
    const response = await ApiInstance.post(`/projects/${id}/deploy`, { branch });
    return response.data.Data?.Deployment;
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

