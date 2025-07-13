// src/utils/supabaseUtils.ts
import { supabase } from '@/lib/supabase';
import { Reservation, AdminUser, User } from '../types';

export const supabaseUtils = {
  // Reservations
  getReservations: async (): Promise<Reservation[]> => {
    const { data, error } = await supabase.from('reservations').select('*');
    if (error) throw error;
    return data || [];
  },

  addReservation: async (reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> => {
    const { data, error } = await supabase
      .from('reservations')
      .insert([{ ...reservation, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateReservation: async (id: string, updates: Partial<Reservation>) => {
    const { error } = await supabase
      .from('reservations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  deleteReservation: async (id: string) => {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) throw error;
  },

  getUserReservations: async (userId: string): Promise<Reservation[]> => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  // Admin Users
  getAdminUsers: async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase.from('admin_users').select('*');
    if (error) throw error;
    return data || [];
  },

  addAdminUser: async (adminData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> => {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{ ...adminData, created_at: new Date().toISOString(), is_active: true }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateAdminUser: async (id: string, updates: Partial<AdminUser>) => {
    const { error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  deleteAdminUser: async (id: string) => {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) throw error;
  },

  validateAdmin: async (email: string, password: string): Promise<AdminUser | null> => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .eq('is_active', true)
      .single();
    if (error) return null;
    return data;
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  },

  registerUser: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .insert([{ ...userData, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  validateUser: async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    if (error) return null;
    return data;
  },

  validateLogin: async (
    email: string,
    password: string
  ): Promise<{ user: User | AdminUser; role: 'user' | 'admin' | 'super_admin' } | null> => {
    const admin = await supabaseUtils.validateAdmin(email, password);
    if (admin) return { user: admin, role: admin.role };

    const user = await supabaseUtils.validateUser(email, password);
    if (user) return { user, role: 'user' };

    return null;
  }
};
