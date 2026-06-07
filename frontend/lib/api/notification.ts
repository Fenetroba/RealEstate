import apiClient from './client';
import type { Notification } from '@/types';

export const notificationApi = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await apiClient.get('/notifications');
    return data.data;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
