import { Reservation, AdminUser, User } from '../types';

const RESERVATIONS_KEY = 'meetingRoomReservations';
const ADMIN_KEY = 'adminCredentials';
const USERS_KEY = 'registeredUsers';

// Default admin credentials
const defaultAdmin: AdminUser = {
  username: 'admin',
  password: 'admin123'
};

export const storageUtils = {
  // Reservations
  getReservations: (): Reservation[] => {
    const stored = localStorage.getItem(RESERVATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveReservations: (reservations: Reservation[]): void => {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  },

  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>): Reservation => {
    const reservations = storageUtils.getReservations();
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    reservations.push(newReservation);
    storageUtils.saveReservations(reservations);
    return newReservation;
  },

  updateReservation: (id: string, updates: Partial<Reservation>): void => {
    const reservations = storageUtils.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      reservations[index] = { ...reservations[index], ...updates };
      storageUtils.saveReservations(reservations);
    }
  },

  deleteReservation: (id: string): void => {
    const reservations = storageUtils.getReservations();
    const filtered = reservations.filter(r => r.id !== id);
    storageUtils.saveReservations(filtered);
  },

  // Admin authentication
  getAdminCredentials: (): AdminUser => {
    const stored = localStorage.getItem(ADMIN_KEY);
    if (!stored) {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(defaultAdmin));
      return defaultAdmin;
    }
    return JSON.parse(stored);
  },

  validateAdmin: (username: string, password: string): boolean => {
    const admin = storageUtils.getAdminCredentials();
    return admin.username === username && admin.password === password;
  },

  // User management
  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveUsers: (users: User[]): void => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  registerUser: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const users = storageUtils.getUsers();
    
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    storageUtils.saveUsers(users);
    return newUser;
  },

  validateUser: (email: string, password: string): User | null => {
    const users = storageUtils.getUsers();
    return users.find(user => user.email === email && user.password === password) || null;
  },

  getUserReservations: (userId: string): Reservation[] => {
    const reservations = storageUtils.getReservations();
    return reservations.filter(reservation => reservation.userId === userId);
  }
};