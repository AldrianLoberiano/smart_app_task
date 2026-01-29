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
   * Check for scheduling conflicts
   */
  checkConflicts: async (startDateTime: string, endDateTime: string, excludeId?: number): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    params.append('startDateTime', startDateTime);
    params.append('endDateTime', endDateTime);
    if (excludeId) params.append('excludeId', excludeId.toString());
    
    const response = await api.get<Appointment[]>(`/appointments/conflicts?${params.toString()}`);
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
};
