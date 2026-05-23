/**
 * NotificationProviders client service — v3.0 F-006 (T063).
 * Config values arrive from server as "***" — never plaintext.
 */

import ApiInstance from './api';

export type TProviderType = 'discord' | 'slack' | 'email';

export interface IProviderListItem {
  Id: number;
  Name: string;
  Type: TProviderType;
  IsActive: boolean;
  ChannelCount?: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface IDiscordConfigInput { webhookRoot: string; }
export interface ISlackConfigInput { webhookUrl?: string; botToken?: string; }
export interface IEmailConfigInput {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  presetName?: 'gmail' | 'sendgrid' | 'mailgun' | 'custom';
}

export type IProviderConfigInput = IDiscordConfigInput | ISlackConfigInput | IEmailConfigInput;

export interface IProviderCreate {
  Name: string;
  Type: TProviderType;
  Config: IProviderConfigInput;
}

export interface IProviderUpdate {
  Name?: string;
  Config?: IProviderConfigInput;
  IsActive?: boolean;
}

export const NotificationProviderService = {
  list: async (): Promise<IProviderListItem[]> => {
    const res = await ApiInstance.get('/notifications/providers');
    return (res.data?.Data?.Items as IProviderListItem[]) ?? [];
  },
  create: async (data: IProviderCreate): Promise<IProviderListItem> => {
    const res = await ApiInstance.post('/notifications/providers', data);
    return res.data?.Data as IProviderListItem;
  },
  update: async (id: number, data: IProviderUpdate): Promise<IProviderListItem> => {
    const res = await ApiInstance.put(`/notifications/providers/${id}`, data);
    return res.data?.Data as IProviderListItem;
  },
  remove: async (id: number): Promise<void> => {
    await ApiInstance.delete(`/notifications/providers/${id}`);
  },
  test: async (id: number): Promise<void> => {
    await ApiInstance.post(`/notifications/providers/${id}/test`);
  },
};

export default NotificationProviderService;
