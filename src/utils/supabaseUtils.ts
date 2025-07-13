// supabaseUtils.ts
import { supabase } from '@/lib/supabase';
import { Reservation, AdminUser, User } from '@/types';

export const supabaseUtils = {
  // Reservations
  async getReservations(): Promise<Reservation[]> {
    const { data, error } = await supabase.from('reservations').select('*');
    if (error) throw error;
    return data || [];
  },

  async addReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
    const { data, error } = await supabase.from('reservations').insert({
      ...reservation,
      createdAt: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return data;
  },

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<void> {
    const { error } = await supabase.from('reservations').update({
      ...updates,
      updatedAt: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  },

  async deleteReservation(id: string): Promise<void> {
    const { error } = await supabase.from('reservations').delete().eq('id', id);
    if (error) throw error;
  },

  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase.from('admin_users').select('*');
    if (error) throw error;
    return data || [];
  },

  async addAdminUser(adminData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> {
    const { data, error } = await supabase.from('admin_users').insert({
      ...adminData,
      createdAt: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return data;
  },

  async updateAdminUser(id: string, updates: Partial<AdminUser>): Promise<void> {
    const { error } = await supabase.from('admin_users').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteAdminUser(id: string): Promise<void> {
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) throw error;
  },

  async validateAdmin(email: string, password: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .eq('isActive', true)
      .single();
    if (error) return null;
    return data;
  },

  // Users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  },

  async registerUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data: authUser, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (signUpError || !authUser.user) throw signUpError;

    // Simpan metadata ke table `users`
    const { data: profile, error: dbError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        fullName: userData.fullName,
        email: userData.email,
        userType: userData.userType,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return profile;
  },

  async validateUser(email: string, password: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    if (error) return null;
    return data;
  },

  async getUserReservations(userId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('userId', userId);
    if (error) throw error;
    return data || [];
  },

  // Universal login validation
  async validateLogin(email: string, password: string): Promise<{ user: User | AdminUser; role: 'user' | 'admin' | 'super_admin' } | null> {
    const admin = await this.validateAdmin(email, password);
    if (admin) return { user: admin, role: admin.role };

    const user = await this.validateUser(email, password);
    if (user) return { user, role: 'user' };

    return null;
  },
};
