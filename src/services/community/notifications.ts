import { get, put } from '../api'

export type CommunityNotificationType =
  | 'status_change'
  | 'interview_reminder'
  | 'feature'
  | 'system'
  | 'deadline_approaching'
  | 'match_found'
  | 'workspace_generated'
  | 'contribution_added'
  | 'referral_claimed'

export interface CommunityNotification {
  _id: string
  userId: string
  type: CommunityNotificationType
  title: string
  message: string
  read: boolean
  dismissed: boolean
  link?: string
  createdAt: string
}

export interface NotificationsResponse {
  items: CommunityNotification[]
  unreadCount: number
}

export function getNotifications(): Promise<NotificationsResponse> {
  return get<NotificationsResponse>('/notifications')
}

export function markAsRead(id: string): Promise<CommunityNotification> {
  return put<CommunityNotification>(`/notifications/${id}/read`)
}

export function markAllAsRead(): Promise<void> {
  return put<void>('/notifications/read-all')
}

export function dismiss(id: string): Promise<CommunityNotification> {
  return put<CommunityNotification>(`/notifications/${id}/dismiss`)
}
