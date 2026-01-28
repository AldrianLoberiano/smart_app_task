// User and Authentication Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  expiresAt: string;
}

// Appointment Types
export interface Appointment {
  id: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Approved';
  userId: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}

export interface UpdateAppointmentRequest {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Approved';
}

// Task Types
export interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'InProgress' | 'Completed';
  isCompleted: boolean;
  userId: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'InProgress' | 'Completed';
  isCompleted: boolean;
}

// API Error Response
export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}
