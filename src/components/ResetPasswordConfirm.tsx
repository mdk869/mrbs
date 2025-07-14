'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock } from 'lucide-react';
import { LoadingSpinner } from './ui/LoadingSpinner';

export const ResetPasswordConfirm = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');

      if (accessToken) {
        setToken(accessToken);
      } else {
        setStatus('Invalid token.');
      }
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!token) return;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus(`Failed to update: ${error.message}`);
    } else {
      setStatus('Password successfully updated. Redirecting to login...');

      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 2000);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="card p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
            <Lock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-emphasis">Set New Password</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-emphasis mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            <span>{loading ? 'Updating...' : 'Set Password'}</span>
          </button>

          {status && (
            <div className={`text-sm p-3 rounded-lg ${
              status.includes('successfully') 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};