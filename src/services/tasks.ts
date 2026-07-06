import { getArray, post, put, del } from './api'
import type { Task, TaskPriority, TaskStatus } from '../types'

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
}

export type UpdateTaskInput = Partial<CreateTaskInput>

export function getTasks(applicationId: string): Promise<Task[]> {
  return getArray<Task>(`/applications/${applicationId}/tasks`)
}

export function createTask(applicationId: string, data: CreateTaskInput): Promise<Task> {
  return post<Task>(`/applications/${applicationId}/tasks`, data)
}

export function updateTask(applicationId: string, taskId: string, data: UpdateTaskInput): Promise<Task> {
  return put<Task>(`/applications/${applicationId}/tasks/${taskId}`, data)
}

export function deleteTask(applicationId: string, taskId: string): Promise<void> {
  return del<void>(`/applications/${applicationId}/tasks/${taskId}`)
}

export const tasksService = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
}
