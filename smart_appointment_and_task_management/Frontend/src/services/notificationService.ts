import api from './api';
import type { Appointment, Task } from '../types';

export interface Notification {
  id: string;
  type: 'appointment' | 'task';
  title: string;
  message: string;
  timestamp: Date;
  data: Appointment | Task;
  priority: 'high' | 'medium' | 'low';
}

class NotificationService {
  private lastAppointmentIds: Set<number> = new Set();
  private lastTaskIds: Set<number> = new Set();
  private appointmentStatusMap: Map<number, string> = new Map();
  private isAdmin = false;

  setUserRole(role: string) {
    this.isAdmin = role === 'Admin';
  }

  async getNotifications(): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    try {
      // Fetch appointments (use regular endpoint for all users first)
      const appointmentsResponse = await api.get<Appointment[]>('/appointments');
      const appointments = appointmentsResponse.data;
      
      // Check for new appointments (admin only)
      if (this.isAdmin) {
        // Find newly created appointments (created in last 5 minutes)
        appointments.forEach((appointment) => {
          const createdDate = new Date(appointment.createdAt);
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
          
          if (createdDate >= fiveMinutesAgo && !this.lastAppointmentIds.has(appointment.id)) {
            notifications.push({
              id: `new-appointment-${appointment.id}`,
              type: 'appointment',
              title: 'New Appointment Created',
              message: `${appointment.username} created "${appointment.title}"`,
              timestamp: createdDate,
              data: appointment,
              priority: 'medium',
            });
          }
        });
        
        // Update tracking
        this.lastAppointmentIds = new Set(appointments.map(a => a.id));
      }
      
      // Check for upcoming appointments (next 24 hours)
      appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.startDateTime);
        
        // Check for status changes (Cancelled or Approved)
        const previousStatus = this.appointmentStatusMap.get(appointment.id);
        if (previousStatus && previousStatus !== appointment.status) {
          if (appointment.status === 'Cancelled') {
            notifications.push({
              id: `cancelled-appointment-${appointment.id}`,
              type: 'appointment',
              title: 'Appointment Cancelled',
              message: `"${appointment.title}" has been cancelled`,
              timestamp: new Date(appointment.updatedAt),
              data: appointment,
              priority: 'high',
            });
          } else if (appointment.status === 'Approved') {
            notifications.push({
              id: `approved-appointment-${appointment.id}`,
              type: 'appointment',
              title: 'Appointment Approved',
              message: `"${appointment.title}" has been approved`,
              timestamp: new Date(appointment.updatedAt),
              data: appointment,
              priority: 'medium',
            });
          }
        }
        
        // Update status map
        this.appointmentStatusMap.set(appointment.id, appointment.status);
        
        if (appointmentDate > now && appointmentDate <= next24Hours && appointment.status === 'Scheduled') {
          const hoursUntil = Math.floor((appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60));
          
          notifications.push({
            id: `appointment-${appointment.id}`,
            type: 'appointment',
            title: 'Upcoming Appointment',
            message: `"${appointment.title}" in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`,
            timestamp: appointmentDate,
            data: appointment,
            priority: hoursUntil <= 2 ? 'high' : hoursUntil <= 6 ? 'medium' : 'low',
          });
        }
      });
      
      // Fetch tasks
      const tasksResponse = await api.get<Task[]>('/tasks');
      const tasks = tasksResponse.data;
      
      // Check for new tasks (admin only)
      if (this.isAdmin) {
        // Find newly created tasks (created in last 5 minutes)
        tasks.forEach((task) => {
          const createdDate = new Date(task.createdAt);
          const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
          
          if (createdDate >= fiveMinutesAgo && !this.lastTaskIds.has(task.id)) {
            notifications.push({
              id: `new-task-${task.id}`,
              type: 'task',
              title: 'New Task Created',
              message: `${task.username} created "${task.title}"`,
              timestamp: createdDate,
              data: task,
              priority: 'medium',
            });
          }
        });
        
        // Update tracking
        this.lastTaskIds = new Set(tasks.map(t => t.id));
      }
      
      // Check for overdue and due-soon tasks
      tasks.forEach((task) => {
        if (!task.dueDate) return;
        
        const dueDate = new Date(task.dueDate);
        
        // Overdue tasks
        if (dueDate < now && task.status !== 'Completed') {
          const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          notifications.push({
            id: `task-overdue-${task.id}`,
            type: 'task',
            title: 'Overdue Task',
            message: `"${task.title}" is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`,
            timestamp: dueDate,
            data: task,
            priority: 'high',
          });
        }
        // Due soon tasks (next 24 hours)
        else if (dueDate > now && dueDate <= next24Hours && task.status !== 'Completed') {
          const hoursUntil = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
          
          notifications.push({
            id: `task-due-${task.id}`,
            type: 'task',
            title: 'Task Due Soon',
            message: `"${task.title}" due in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`,
            timestamp: dueDate,
            data: task,
            priority: hoursUntil <= 2 ? 'high' : task.priority === 'High' ? 'high' : 'medium',
          });
        }
      });
      
      // Sort by priority and timestamp
      notifications.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        return b.timestamp.getTime() - a.timestamp.getTime(); // Most recent first
      });
      
      return notifications;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }
  
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }
  
  async showBrowserNotification(notification: Notification): Promise<void> {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png',
        tag: notification.id,
      });
    }
  }
}

export const notificationService = new NotificationService();
