import api from './api';
import type { Appointment, CreateAppointmentRequest, UpdateAppointmentRequest } from '../types';

export const appointmentService = {
  /**
   * Get all appointments for current user
   */
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  },

  /**
   * Get appointment by ID
   */
  getById: async (id: number): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Get appointments by date range
   */
  getByDateRange: async (startDate?: string, endDate?: string): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get<Appointment[]>(`/appointments/filter?${params.toString()}`);
    return response.data;
  },

  /**
   * Get appointments by status
   */
  getByStatus: async (status: string): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>(`/appointments/status/${status}`);
    return response.data;
  },

  /**
   * Create new appointment
   */
  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  /**
   * Update appointment
   */
  update: async (id: number, data: UpdateAppointmentRequest): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Delete appointment
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },

  /**
   * Cancel appointment (quick action)
   */
  cancel: async (id: number): Promise<Appointment> => {
    const appointment = await appointmentService.getById(id);
    return appointmentService.update(id, { ...appointment, status: 'Cancelled' });
  },

  /**
   * Mark appointment as completed (quick action)
   */
  complete: async (id: number): Promise<Appointment> => {
    const appointment = await appointmentService.getById(id);
    return appointmentService.update(id, { ...appointment, status: 'Completed' });
  },

  /**
   * Export appointments to CSV
   */
  exportToCsv: (appointments: Appointment[]): void => {
    const headers = ['Title', 'Description', 'Start Date/Time', 'End Date/Time', 'Location', 'Status', 'Created At'];
    const rows = appointments.map(apt => [
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
    link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
