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
    // Mock data for now until backend is ready
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'CRM Backend',
            repoUrl: 'https://github.com/org/crm-backend',
            branch: 'master',
            type: 'node',
            status: 'active',
            lastDeployment: { status: 'success', timestamp: '2 hours ago' },
          },
          {
            id: 2,
            name: 'Admin Portal',
            repoUrl: 'https://github.com/org/admin-portal',
            branch: 'develop',
            type: 'static',
            status: 'active',
            lastDeployment: { status: 'success', timestamp: '4 hours ago' },
          },
          {
            id: 3,
            name: 'Customer Portal',
            repoUrl: 'https://github.com/org/customer-portal',
            branch: 'master',
            type: 'static',
            status: 'inactive',
            lastDeployment: { status: 'failed', timestamp: '6 hours ago' },
          },
        ]);
      }, 500);
    });
    // return ApiInstance.get('/projects').then((res) => res.data);
  },

  getById: async (id: number): Promise<IProject> => {
    return ApiInstance.get(`/projects/${id}`).then((res) => res.data);
  },

  create: async (data: Omit<IProject, 'id'>): Promise<IProject> => {
    return ApiInstance.post('/projects', data).then((res) => res.data);
  },

  update: async (id: number, data: Partial<IProject>): Promise<IProject> => {
    return ApiInstance.put(`/projects/${id}`, data).then((res) => res.data);
  },

  delete: async (id: number): Promise<void> => {
    return ApiInstance.delete(`/projects/${id}`).then((res) => res.data);
  },
};
