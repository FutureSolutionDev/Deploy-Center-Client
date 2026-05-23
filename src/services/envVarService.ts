/**
 * Environment Variables client service — Deploy Center v3.0 / F-003.
 * Thin axios wrapper over /api/projects/:projectId/env-vars. Secret values
 * arrive from the server pre-redacted as "***" — never expect plaintext.
 */

import ApiInstance from './api';

export interface IEnvVarListItem {
  Id: number;
  KeyName: string;
  Value: string; // "***" when IsSecret
  IsSecret: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface IEnvVarCreate {
  KeyName: string;
  Value: string;
  IsSecret?: boolean;
}

export interface IEnvVarUpdate {
  KeyName?: string;
  Value?: string;
  IsSecret?: boolean;
}

export const EnvVarService = {
  list: async (projectId: number): Promise<IEnvVarListItem[]> => {
    const res = await ApiInstance.get(`/projects/${projectId}/env-vars`);
    return (res.data?.Data?.Items as IEnvVarListItem[]) ?? [];
  },

  create: async (projectId: number, data: IEnvVarCreate): Promise<IEnvVarListItem> => {
    const res = await ApiInstance.post(`/projects/${projectId}/env-vars`, data);
    return res.data?.Data as IEnvVarListItem;
  },

  update: async (
    projectId: number,
    id: number,
    data: IEnvVarUpdate
  ): Promise<IEnvVarListItem> => {
    const res = await ApiInstance.put(`/projects/${projectId}/env-vars/${id}`, data);
    return res.data?.Data as IEnvVarListItem;
  },

  remove: async (projectId: number, id: number): Promise<void> => {
    await ApiInstance.delete(`/projects/${projectId}/env-vars/${id}`);
  },
};

export default EnvVarService;
