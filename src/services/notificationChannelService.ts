/**
 * NotificationChannels client service — v3.0 F-006 (T063).
 */

import ApiInstance from './api';
import type { TProviderType } from './notificationProviderService';

export interface IChannelListItem {
  Id: number;
  ProviderId: number;
  ProviderName?: string;
  ProviderType?: TProviderType;
  Name: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface IDiscordDelivery { webhookSuffix?: string; overrideWebhook?: string; }
export interface ISlackDelivery { channel: string; }
export interface IEmailDelivery { recipients: string[]; }
export type IDeliveryConfigInput = IDiscordDelivery | ISlackDelivery | IEmailDelivery;

export interface IChannelCreate {
  ProviderId: number;
  Name: string;
  DeliveryConfig: IDeliveryConfigInput;
}

export interface IChannelUpdate {
  Name?: string;
  DeliveryConfig?: IDeliveryConfigInput;
  IsActive?: boolean;
}

export const NotificationChannelService = {
  list: async (providerId?: number): Promise<IChannelListItem[]> => {
    const res = await ApiInstance.get('/notifications/channels', {
      params: providerId ? { providerId } : undefined,
    });
    return (res.data?.Data?.Items as IChannelListItem[]) ?? [];
  },
  create: async (data: IChannelCreate): Promise<IChannelListItem> => {
    const res = await ApiInstance.post('/notifications/channels', data);
    return res.data?.Data as IChannelListItem;
  },
  update: async (id: number, data: IChannelUpdate): Promise<IChannelListItem> => {
    const res = await ApiInstance.put(`/notifications/channels/${id}`, data);
    return res.data?.Data as IChannelListItem;
  },
  remove: async (id: number): Promise<void> => {
    await ApiInstance.delete(`/notifications/channels/${id}`);
  },
  test: async (id: number): Promise<void> => {
    await ApiInstance.post(`/notifications/channels/${id}/test`);
  },
};

export default NotificationChannelService;
