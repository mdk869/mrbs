export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  email: string;
  date: string;
  startTime: string;
  endTime: string;
  roomName: string;
  purpose: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AdminUser {
  username: string;
  password: string;
}