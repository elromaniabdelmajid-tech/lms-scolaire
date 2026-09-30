import type { ApiClient } from '../client'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface UnreadCount {
  count: number
}

export interface MarkAllResult {
  success: boolean
  count: number
}

export class NotificationsResource {
  constructor(private readonly client: ApiClient) {}

  /**
   * Nombre de notifications non lues
   */
  async getUnreadCount(): Promise<UnreadCount> {
    return this.client.get<UnreadCount>('/notifications/unread-count')
  }

  /**
   * Liste les notifications
   */
  async list(): Promise<Notification[]> {
    return this.client.get<Notification[]>('/notifications')
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: string): Promise<Notification> {
    return this.client.put<Notification>(`/notifications/${id}/read`)
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<MarkAllResult> {
    return this.client.post<MarkAllResult>('/notifications/mark-all-read')
  }
}