import api from './api';
import type { Appointment, Task } from '../types';

export interface AdminStats {
  totalAppointments: number;
  pendingAppointments: number;
  scheduledAppointments: number;
  approvedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  totalUsers: number;
  activeUsers: number;
}

export interface UserActivity {
  userId: number;
  username: string;
  totalAppointments: number;
  totalTasks: number;
  lastActive: string;
}

export const adminService = {
  /**
   * Get all appointments from all users
   */
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/admin/appointments');
    return response.data;
  },

  /**
   * Get all tasks from all users
   */
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get<Task[]>('/admin/tasks');
    return response.data;
  },

  /**
   * Update appointment status
   */
  updateAppointmentStatus: async (id: number, status: string): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/admin/appointments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Update task status
   */
  updateTaskStatus: async (id: number, status: string): Promise<Task> => {
    const response = await api.patch<Task>(`/admin/tasks/${id}/status`, { status });
    return response.data;
  },

  /**
   * Bulk update appointment statuses
   */
  bulkUpdateAppointmentStatus: async (ids: number[], status: string): Promise<void> => {
    await Promise.all(ids.map(id => adminService.updateAppointmentStatus(id, status)));
  },

  /**
   * Bulk update task statuses
   */
  bulkUpdateTaskStatus: async (ids: number[], status: string): Promise<void> => {
    await Promise.all(ids.map(id => adminService.updateTaskStatus(id, status)));
  },

  /**
   * Approve appointment
   */
  approveAppointment: async (id: number): Promise<Appointment> => {
    return adminService.updateAppointmentStatus(id, 'Approved');
  },

  /**
   * Reject/Cancel appointment
   */
  rejectAppointment: async (id: number): Promise<Appointment> => {
    return adminService.updateAppointmentStatus(id, 'Cancelled');
  },

  /**
   * Calculate admin statistics
   */
  calculateStats: (appointments: Appointment[], tasks: Task[]): AdminStats => {
    const stats: AdminStats = {
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter(a => a.status === 'Scheduled' && new Date(a.startDateTime) > new Date()).length,
      scheduledAppointments: appointments.filter(a => a.status === 'Scheduled').length,
      approvedAppointments: appointments.filter(a => a.status === 'Approved').length,
      completedAppointments: appointments.filter(a => a.status === 'Completed').length,
      cancelledAppointments: appointments.filter(a => a.status === 'Cancelled').length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'Pending').length,
      inProgressTasks: tasks.filter(t => t.status === 'InProgress').length,
      completedTasks: tasks.filter(t => t.status === 'Completed').length,
      totalUsers: new Set([...appointments.map(a => a.userId), ...tasks.map(t => t.userId)]).size,
      activeUsers: new Set([
        ...appointments.filter(a => new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).map(a => a.userId),
        ...tasks.filter(t => new Date(t.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).map(t => t.userId)
      ]).size,
    };
    return stats;
  },

  /**
   * Get user activity summary
   */
  getUserActivity: (appointments: Appointment[], tasks: Task[]): UserActivity[] => {
    const userMap = new Map<number, UserActivity>();

    appointments.forEach(apt => {
      if (!userMap.has(apt.userId)) {
        userMap.set(apt.userId, {
          userId: apt.userId,
          username: apt.username,
          totalAppointments: 0,
          totalTasks: 0,
          lastActive: apt.createdAt,
        });
      }
      const user = userMap.get(apt.userId)!;
      user.totalAppointments++;
      if (new Date(apt.createdAt) > new Date(user.lastActive)) {
        user.lastActive = apt.createdAt;
      }
    });

    tasks.forEach(task => {
      if (!userMap.has(task.userId)) {
        userMap.set(task.userId, {
          userId: task.userId,
          username: task.username,
          totalAppointments: 0,
          totalTasks: 0,
          lastActive: task.createdAt,
        });
      }
      const user = userMap.get(task.userId)!;
      user.totalTasks++;
      if (new Date(task.createdAt) > new Date(user.lastActive)) {
        user.lastActive = task.createdAt;
      }
    });

    return Array.from(userMap.values()).sort((a, b) => 
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );
  },

  /**
   * Export appointments to CSV
   */
  exportAppointmentsToCsv: (appointments: Appointment[]): void => {
    const headers = ['ID', 'User', 'User ID', 'Title', 'Description', 'Start Date/Time', 'End Date/Time', 'Location', 'Status', 'Created At'];
    const rows = appointments.map(apt => [
      apt.id,
      apt.username,
      apt.userId,
      apt.title,
      apt.description || '',
      apt.startDateTime,
      apt.endDateTime,
      apt.location || '',
      apt.status,
      apt.createdAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export tasks to CSV
   */
  exportTasksToCsv: (tasks: Task[]): void => {
    const headers = ['ID', 'User', 'User ID', 'Title', 'Description', 'Due Date', 'Priority', 'Status', 'Created At'];
    const rows = tasks.map(task => [
      task.id,
      task.username,
      task.userId,
      task.title,
      task.description || '',
      task.dueDate || '',
      task.priority,
      task.status,
      task.createdAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `admin_tasks_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
