import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const ResetPasswordConfirm = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const accessToken = params.get('access_token');

    if (accessToken) {
      setToken(accessToken);
    } else {
      setStatus('Token tidak sah.');
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus(`Gagal kemaskini: ${error.message}`);
    } else {
      setStatus('Password berjaya dikemaskini. Anda akan dialihkan ke login...');

      // ✅ Redirect selepas beberapa saat
      setTimeout(() => {
        window.location.href = '/'; // jika guna Vite
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleUpdatePassword} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        <h2 className="text-xl font-bold">Set New Password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          required
        />

        <button type="submit" className="btn-primary w-full">
          Set Password
        </button>

        {status && <div className="text-sm text-gray-600">{status}</div>}
      </form>
    </div>
  );
};
