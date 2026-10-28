/**
 * ProjectTemplates client service — v3.0 F-008 (T083).
 *
 * Thin wrapper around /api/project-templates. Reads are open to all
 * authenticated users; writes require Admin/Manager (enforced server-side).
 */

import ApiInstance from './api';

export type EProjectTemplateCategory = 'backend' | 'frontend' | 'static' | 'other';

export interface IProjectTemplate {
  Id: number;
  Name: string;
  Description: string | null;
  Icon: string | null;
  Category: EProjectTemplateCategory;
  DefaultConfig: Record<string, unknown>;
  IsBuiltIn: boolean;
  CreatedBy: number | null;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface IProjectTemplateCreate {
  Name: string;
  Description?: string | null;
  Icon?: string | null;
  Category: EProjectTemplateCategory;
  DefaultConfig: Record<string, unknown>;
}

export interface IProjectTemplateUpdate {
  Name?: string;
  Description?: string | null;
  Icon?: string | null;
  Category?: EProjectTemplateCategory;
  DefaultConfig?: Record<string, unknown>;
}

export const ProjectTemplateService = {
  list: async (category?: EProjectTemplateCategory): Promise<IProjectTemplate[]> => {
    const params = category ? { category } : undefined;
    const res = await ApiInstance.get('/project-templates', { params });
    const data = res.data?.Data;
    return (data?.Items as IProjectTemplate[]) ?? [];
  },
  getById: async (id: number): Promise<IProjectTemplate> => {
    const res = await ApiInstance.get(`/project-templates/${id}`);
    return res.data?.Data as IProjectTemplate;
  },
  create: async (data: IProjectTemplateCreate): Promise<IProjectTemplate> => {
    const res = await ApiInstance.post('/project-templates', data);
    return res.data?.Data as IProjectTemplate;
  },
  update: async (id: number, data: IProjectTemplateUpdate): Promise<IProjectTemplate> => {
    const res = await ApiInstance.put(`/project-templates/${id}`, data);
    return res.data?.Data as IProjectTemplate;
  },
  remove: async (id: number): Promise<void> => {
    await ApiInstance.delete(`/project-templates/${id}`);
  },
};

export default ProjectTemplateService;
