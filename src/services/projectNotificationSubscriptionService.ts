/**
 * ProjectNotificationSubscriptions client service — v3.0 F-006 (T063).
 */

import ApiInstance from './api';
import type { TProviderType } from './notificationProviderService';

export type TNotificationEvent =
  | 'DeploymentStarted'
  | 'DeploymentSucceeded'
  | 'DeploymentFailed'
  | 'DeploymentRolledBack'
  | 'DeploymentCancelled';

export const ALL_NOTIFICATION_EVENTS: TNotificationEvent[] = [
  'DeploymentStarted',
  'DeploymentSucceeded',
  'DeploymentFailed',
  'DeploymentRolledBack',
  'DeploymentCancelled',
];

export interface ISubscriptionListItem {
  Id: number;
  ProjectId: number;
  ChannelId: number;
  ChannelName?: string;
  ProviderName?: string;
  ProviderType?: TProviderType;
  Events: TNotificationEvent[];
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ISubscriptionCreate {
  ChannelId: number;
  Events: TNotificationEvent[];
}

export interface ISubscriptionUpdate {
  Events?: TNotificationEvent[];
  IsActive?: boolean;
}

export const ProjectNotificationSubscriptionService = {
  list: async (projectId: number): Promise<ISubscriptionListItem[]> => {
    const res = await ApiInstance.get(`/projects/${projectId}/notification-subscriptions`);
    return (res.data?.Data?.Items as ISubscriptionListItem[]) ?? [];
  },
  create: async (projectId: number, data: ISubscriptionCreate): Promise<ISubscriptionListItem> => {
    const res = await ApiInstance.post(`/projects/${projectId}/notification-subscriptions`, data);
    return res.data?.Data as ISubscriptionListItem;
  },
  update: async (
    projectId: number,
    id: number,
    data: ISubscriptionUpdate
  ): Promise<ISubscriptionListItem> => {
    const res = await ApiInstance.put(`/projects/${projectId}/notification-subscriptions/${id}`, data);
    return res.data?.Data as ISubscriptionListItem;
  },
  remove: async (projectId: number, id: number): Promise<void> => {
    await ApiInstance.delete(`/projects/${projectId}/notification-subscriptions/${id}`);
  },
};

export default ProjectNotificationSubscriptionService;
