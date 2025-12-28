import ApiInstance from './api';
import type { IProject, IProjectStatistics, IDeployment, IDeploymentRequest } from '@/types';

export const ProjectsService = {
  getAll: async (includeInactive: boolean = false): Promise<IProject[]> => {
    try {
      const response = await ApiInstance.get('/projects', { params: { includeInactive } });
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

  // ========================================
  // SSH KEY MANAGEMENT METHODS
  // ========================================

  /**
   * Generate SSH key for project
   * POST /api/projects/:id/ssh-key
   */
  generateSshKey: async (
    id: number,
    options?: { keyType?: 'ed25519' | 'rsa' }
  ): Promise<{
    PublicKey: string;
    Fingerprint: string;
    KeyType: 'ed25519' | 'rsa';
  }> => {
    const response = await ApiInstance.post(`/projects/${id}/ssh-key`, options || {});
    return response.data.Data;
  },

  /**
   * Regenerate (rotate) SSH key for project
   * PUT /api/projects/:id/ssh-key
   */
  regenerateSshKey: async (id: number): Promise<{
    PublicKey: string;
    Fingerprint: string;
    KeyType: 'ed25519' | 'rsa';
  }> => {
    const response = await ApiInstance.put(`/projects/${id}/ssh-key`);
    return response.data.Data;
  },

  /**
   * Delete SSH key from project
   * DELETE /api/projects/:id/ssh-key
   */
  deleteSshKey: async (id: number): Promise<void> => {
    await ApiInstance.delete(`/projects/${id}/ssh-key`);
  },

  /**
   * Get SSH public key info
   * GET /api/projects/:id/ssh-key
   */
  getSshPublicKey: async (id: number): Promise<{
    PublicKey: string;
    Fingerprint: string;
    KeyType: string;
    CreatedAt: Date;
    RotatedAt: Date | null;
  } | null> => {
    try {
      const response = await ApiInstance.get(`/projects/${id}/ssh-key`);
      return response.data.Data;
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Toggle SSH key usage
   * PATCH /api/projects/:id/ssh-key/toggle
   */
  toggleSshKeyUsage: async (id: number, enabled: boolean): Promise<void> => {
    await ApiInstance.patch(`/projects/${id}/ssh-key/toggle`, { enabled });
  },

  // ========================================
  // PROJECT MEMBER MANAGEMENT METHODS
  // ========================================

  /**
   * Get all members of a project
   * GET /api/projects/:id/members
   */
  getMembers: async (projectId: number): Promise<any[]> => {
    const response = await ApiInstance.get(`/projects/${projectId}/members`);
    return response.data.Data || [];
  },

  /**
   * Add a member to a project
   * POST /api/projects/:id/members
   */
  addMember: async (projectId: number, userId: number, role: string): Promise<any> => {
    const response = await ApiInstance.post(`/projects/${projectId}/members`, { userId, role });
    return response.data.Data;
  },

  /**
   * Remove a member from a project
   * DELETE /api/projects/:id/members/:userId
   */
  removeMember: async (projectId: number, userId: number): Promise<void> => {
    await ApiInstance.delete(`/projects/${projectId}/members/${userId}`);
  },
};


