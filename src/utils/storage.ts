import { Reservation, AdminUser, User } from '../types';

const RESERVATIONS_KEY = 'meetingRoomReservations';
const ADMIN_USERS_KEY = 'adminUsers';
const USERS_KEY = 'registeredUsers';
const NOTIFICATIONS_KEY = 'notificationSettings';

// Default super admin
const defaultSuperAdmin: AdminUser = {
  id: 'super_admin_1',
  email: 'khalis.abdrahim@gmail.com',
  password: 'Abcd1234',
  fullName: 'Khalis Abd Rahim',
  role: 'super_admin',
  createdAt: new Date().toISOString(),
  isActive: true
};

export const storageUtils = {
  // Initialize default data
  initializeDefaults: (): void => {
    const adminUsers = storageUtils.getAdminUsers();
    if (!adminUsers.some(admin => admin.email === defaultSuperAdmin.email)) {
      adminUsers.push(defaultSuperAdmin);
      storageUtils.saveAdminUsers(adminUsers);
    }
  },

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
    
    // Send notification to admins
    storageUtils.notifyAdmins(newReservation);
    
    return newReservation;
  },

  updateReservation: (id: string, updates: Partial<Reservation>): void => {
    const reservations = storageUtils.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index !== -1) {
      reservations[index] = { 
        ...reservations[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      storageUtils.saveReservations(reservations);
    }
  },

  deleteReservation: (id: string): void => {
    const reservations = storageUtils.getReservations();
    const filtered = reservations.filter(r => r.id !== id);
    storageUtils.saveReservations(filtered);
  },

  // Admin Users Management
  getAdminUsers: (): AdminUser[] => {
    const stored = localStorage.getItem(ADMIN_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveAdminUsers: (adminUsers: AdminUser[]): void => {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(adminUsers));
  },

  addAdminUser: (adminData: Omit<AdminUser, 'id' | 'createdAt'>): AdminUser => {
    const adminUsers = storageUtils.getAdminUsers();
    
    // Check if email already exists
    if (adminUsers.some(admin => admin.email === adminData.email)) {
      throw new Error('Email already registered');
    }

    const newAdmin: AdminUser = {
      ...adminData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    adminUsers.push(newAdmin);
    storageUtils.saveAdminUsers(adminUsers);
    return newAdmin;
  },

  updateAdminUser: (id: string, updates: Partial<AdminUser>): void => {
    const adminUsers = storageUtils.getAdminUsers();
    const index = adminUsers.findIndex(admin => admin.id === id);
    if (index !== -1) {
      adminUsers[index] = { ...adminUsers[index], ...updates };
      storageUtils.saveAdminUsers(adminUsers);
    }
  },

  deleteAdminUser: (id: string): void => {
    const adminUsers = storageUtils.getAdminUsers();
    const filtered = adminUsers.filter(admin => admin.id !== id);
    storageUtils.saveAdminUsers(filtered);
  },

  // Authentication
  validateAdmin: (email: string, password: string): AdminUser | null => {
    const adminUsers = storageUtils.getAdminUsers();
    return adminUsers.find(admin => 
      admin.email === email && 
      admin.password === password && 
      admin.isActive
    ) || null;
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
  },

  // Universal login validation
  validateLogin: (email: string, password: string): { user: User | AdminUser; role: 'user' | 'admin' | 'super_admin' } | null => {
    // Check admin users first
    const admin = storageUtils.validateAdmin(email, password);
    if (admin) {
      return { user: admin, role: admin.role };
    }

    // Check regular users
    const user = storageUtils.validateUser(email, password);
    if (user) {
      return { user, role: 'user' };
    }

    return null;
  },

  // Notification system
  notifyAdmins: (reservation: Reservation): void => {
    // In a real app, this would send actual emails
    console.log('📧 Email notification sent to admins for new reservation:', {
      reservationId: reservation.id,
      user: reservation.userName,
      room: reservation.roomName,
      date: reservation.date,
      time: `${reservation.startTime} - ${reservation.endTime}`
    });
  },

  scheduleReminder: (reservation: Reservation): void => {
    // In a real app, this would schedule actual reminders
    console.log('⏰ Reminder scheduled for reservation:', {
      reservationId: reservation.id,
      user: reservation.userName,
      reminderTime: '3-4 hours before reservation'
    });
  },

  // Export functionality
  exportReservations: (format: 'json' | 'csv' = 'json'): string => {
    const reservations = storageUtils.getReservations();
    
    if (format === 'csv') {
      const headers = ['ID', 'User Name', 'Email', 'Date', 'Start Time', 'End Time', 'Room', 'Tingkatan', 'Kelas', 'Purpose', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...reservations.map(r => [
          r.id,
          r.userName,
          r.email,
          r.date,
          r.startTime,
          r.endTime,
          r.roomName,
          r.tingkatan,
          r.kelas,
          `"${r.purpose}"`,
          r.status,
          r.createdAt
        ].join(','))
      ].join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(reservations, null, 2);
  }
};

// Initialize defaults on load
storageUtils.initializeDefaults();