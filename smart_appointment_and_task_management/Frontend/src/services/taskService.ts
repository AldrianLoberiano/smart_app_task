import api from './api';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { format } from 'date-fns';

export const taskService = {
  /**
   * Get all tasks for current user
   */
  getAll: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks');
    return response.data;
  },

  /**
   * Get task by ID
   */
  getById: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Get tasks by status
   */
  getByStatus: async (status: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/tasks/status/${status}`);
    return response.data;
  },

  /**
   * Get tasks by priority
   */
  getByPriority: async (priority: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(`/tasks/priority/${priority}`);
    return response.data;
  },

  /**
   * Get overdue tasks
   */
  getOverdue: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/tasks/overdue');
    return response.data;
  },

  /**
   * Create new task
   */
  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  /**
   * Update task
   */
  update: async (id: number, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Mark task as complete
   */
  markAsComplete: async (id: number): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}/complete`);
    return response.data;
  },

  /**
   * Delete task
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};
