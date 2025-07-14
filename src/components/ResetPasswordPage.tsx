'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from './ui/LoadingSpinner';

export const ResetPassword: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/reset-password` 
      : 'http://localhost:3000/reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset link has been sent to your email.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-dark-900 dark:to-dark-800 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
            <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-emphasis mb-2">Reset Password</h2>
          <p className="text-muted text-sm sm:text-base">Enter your email to receive reset instructions</p>
        </div>

        <div className="card p-6 sm:p-8">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleReset}>
            <div>
              <label className="block text-sm font-medium text-emphasis mb-2">Email Address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg border border-red-200 dark:border-red-800 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg border border-green-200 dark:border-green-800 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={onBack}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};