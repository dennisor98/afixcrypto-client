import api from './client';

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getMine: (limit = 50) =>
    api.get<NotificationRecord[]>(`/notifications?limit=${limit}`),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch<NotificationRecord>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.patch<{ updated: number }>('/notifications/read-all'),
};