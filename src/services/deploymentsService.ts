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
    // Mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 101,
            projectId: 1,
            projectName: 'CRM Backend',
            branch: 'master',
            commitHash: 'a1b2c3d',
            status: 'success',
            triggerType: 'webhook',
            timestamp: '2 hours ago',
            duration: '2m 15s',
          },
          {
            id: 102,
            projectId: 2,
            projectName: 'Admin Portal',
            branch: 'develop',
            commitHash: 'e5f6g7h',
            status: 'success',
            triggerType: 'manual',
            timestamp: '4 hours ago',
            duration: '1m 45s',
          },
          {
            id: 103,
            projectId: 3,
            projectName: 'Customer Portal',
            branch: 'master',
            commitHash: 'i8j9k0l',
            status: 'failed',
            triggerType: 'webhook',
            timestamp: '6 hours ago',
            duration: '45s',
          },
        ]);
      }, 500);
    });
    // return ApiInstance.get('/deployments').then((res) => res.data);
  },

  getById: async (id: number): Promise<IDeployment> => {
    return ApiInstance.get(`/deployments/${id}`).then((res) => res.data);
  },

  getByProject: async (projectId: number): Promise<IDeployment[]> => {
    return ApiInstance.get(`/projects/${projectId}/deployments`).then((res) => res.data);
  },
};
