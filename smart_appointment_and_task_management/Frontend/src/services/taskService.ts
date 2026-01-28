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

  /**
   * Export tasks to CSV
   */
  exportToCsv: (tasks: Task[]): void => {
    const headers = ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Created At', 'Completed'];
    const rows = tasks.map(task => [
      task.title,
      task.description || '',
      task.priority,
      task.status,
      task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd HH:mm') : 'No due date',
      format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm'),
      task.isCompleted ? 'Yes' : 'No',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
