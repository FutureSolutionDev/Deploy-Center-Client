/**
 * Workspaces client service — v3.0 F-009 (T089).
 */

import ApiInstance from './api';
import type { TWorkspaceIcon } from '@/types/workspaceIcons';

export interface IWorkspaceListItem {
  Id: number;
  Name: string;
  Description: string | null;
  Color: string;
  Icon: TWorkspaceIcon;
  CreatedBy: number | null;
  ProjectCount: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface IWorkspaceListResponse {
  Items: IWorkspaceListItem[];
  UnassignedProjectCount: number;
}

export interface IWorkspaceCreate {
  Name: string;
  Description?: string | null;
  Color: string; // #RRGGBB
  Icon?: TWorkspaceIcon;
}

export interface IWorkspaceUpdate {
  Name?: string;
  Description?: string | null;
  Color?: string;
  Icon?: TWorkspaceIcon;
  IsActive?: boolean;
}

export const WorkspaceService = {
  list: async (): Promise<IWorkspaceListResponse> => {
    const res = await ApiInstance.get('/workspaces');
    const data = res.data?.Data;
    return {
      Items: (data?.Items as IWorkspaceListItem[]) ?? [],
      UnassignedProjectCount: (data?.UnassignedProjectCount as number) ?? 0,
    };
  },
  create: async (data: IWorkspaceCreate): Promise<IWorkspaceListItem> => {
    const res = await ApiInstance.post('/workspaces', data);
    return res.data?.Data as IWorkspaceListItem;
  },
  update: async (id: number, data: IWorkspaceUpdate): Promise<IWorkspaceListItem> => {
    const res = await ApiInstance.put(`/workspaces/${id}`, data);
    return res.data?.Data as IWorkspaceListItem;
  },
  remove: async (id: number): Promise<void> => {
    await ApiInstance.delete(`/workspaces/${id}`);
  },
  assignProject: async (projectId: number, workspaceId: number | null): Promise<void> => {
    await ApiInstance.patch(`/projects/${projectId}/workspace`, { WorkspaceId: workspaceId });
  },
};

export default WorkspaceService;
