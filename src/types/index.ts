export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  email: string;
  date: string;
  startTime: string;
  endTime: string;
  roomName: string;
  tingkatan: string;
  kelas: string;
  purpose: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  userType: 'teacher' | 'staff';
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
  isActive: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | AdminUser | null;
  userRole: 'user' | 'admin' | 'super_admin' | null;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  reminderHours: number;
}