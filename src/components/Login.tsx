"use client";

import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { User as UserType, AdminUser } from '@/types';
import { supabaseUtils } from '@/utils/supabaseUtils';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useResponsive } from '@/hooks/useResponsive';

interface LoginProps {
  onLogin: (user: UserType | AdminUser, role: 'user' | 'admin' | 'super_admin') => void;
  onForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onForgotPassword }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'teacher' as 'teacher' | 'staff',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isMobile } = useResponsive();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('User not created.');

        const newUser = await supabaseUtils.registerUser({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          userType: formData.userType,
        });

        onLogin(newUser, 'user');
      } else {
        const loginResult = await supabaseUtils.validateLogin(formData.email, formData.password);
        if (loginResult) {
          onLogin(loginResult.user, loginResult.role);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error || !data.user) {
          setError('Invalid email or password');
          return;
        }

        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !userProfile) {
          setError('User profile not found');
          return;
        }

        onLogin(userProfile, 'user');
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setFormData({
      email: '',
      password: '',
      fullName: '',
      userType: 'teacher',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
            {isRegistering ? (
              <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400" />
            ) : (
              <LogIn className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-emphasis mb-2">
            {isRegistering ? 'Create Account' : 'Welcome to eBilik'}
          </h2>
          <p className="text-muted text-sm sm:text-base">
            {isRegistering ? 'Register to book eBilik rooms' : 'Sign in to your account'}
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-emphasis mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-emphasis mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-emphasis mb-2">
                <Lock className="h-4 w-4 inline mr-1" />
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field pr-10"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-[2.65rem] right-3 text-muted hover:text-emphasis transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-emphasis mb-2">User Type</label>
                <select
                  required
                  className="input-field"
                  value={formData.userType}
                  onChange={(e) =>
                    setFormData({ ...formData, userType: e.target.value as 'teacher' | 'staff' })
                  }
                >
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              <span>
                {isLoading
                  ? isRegistering
                    ? 'Creating Account...'
                    : 'Signing In...'
                  : isRegistering
                  ? 'Create Account'
                  : 'Sign In'}
              </span>
            </button>
          </form>
          
          <div className="text-center mt-4">
            <button
              onClick={onForgotPassword}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors text-sm sm:text-base"
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};