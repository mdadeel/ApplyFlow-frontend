import { get, put } from './api'

export type NotificationType = 'status_change' | 'interview_reminder' | 'feature' | 'system'

export interface NotificationItem {
  _id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  dismissed: boolean
  link?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationsResponse {
  items: NotificationItem[]
  unreadCount: number
}

export function getNotifications(): Promise<NotificationsResponse> {
  return get<NotificationsResponse>('/notifications')
}

export function markAsRead(id: string): Promise<NotificationItem> {
  return put<NotificationItem>(`/notifications/${id}/read`)
}

export function dismiss(id: string): Promise<NotificationItem> {
  return put<NotificationItem>(`/notifications/${id}/dismiss`)
}

export function markAllAsRead(): Promise<void> {
  return put<void>('/notifications/read-all')
}
