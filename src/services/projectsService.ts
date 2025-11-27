import ApiInstance from './api';

export interface IProject {
  id: number;
  name: string;
  repoUrl: string;
  branch: string;
  type: 'node' | 'static' | 'docker';
  status: 'active' | 'inactive';
  lastDeployment?: {
    status: 'success' | 'failed';
    timestamp: string;
  };
}

export const ProjectsService = {
  getAll: async (): Promise<IProject[]> => {
    try {
      const response = await ApiInstance.get('/projects');
      const data = response.data.Data;
      return data?.Projects || [];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Return empty array on error
      return [];
    }
  },

  getById: async (id: number): Promise<IProject> => {
    return ApiInstance.get(`/projects/${id}`).then((res) => res.data.Data?.Project);
  },

  create: async (data: Omit<IProject, 'id'>): Promise<IProject> => {
    return ApiInstance.post('/projects', data).then((res) => res.data.Data?.Project);
  },

  update: async (id: number, data: Partial<IProject>): Promise<IProject> => {
    return ApiInstance.put(`/projects/${id}`, data).then((res) => res.data.Data?.Project);
  },

  delete: async (id: number): Promise<void> => {
    return ApiInstance.delete(`/projects/${id}`).then((res) => res.data);
  },

  deploy: async (id: number, branch?: string): Promise<IProject> => {
    const response = await ApiInstance.post(`/projects/${id}/deploy`, { branch });
    return response.data.Data?.Deployment;
  },
};
