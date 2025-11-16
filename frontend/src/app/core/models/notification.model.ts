export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  page: number;
  lastPage: number;
  unreadCount: number;
}
