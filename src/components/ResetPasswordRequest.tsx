// src/components/ResetPasswordRequest.tsx
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`, // halaman reset
    });
    if (error) {
      setStatus('Gagal hantar emel reset: ' + error.message);
    } else {
      setStatus('📧 Emel reset telah dihantar!');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12 space-y-4">
      <h2 className="text-lg font-semibold">Reset Password</h2>
      <input
        type="email"
        className="input-field"
        placeholder="Masukkan emel anda"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="btn-primary w-full" onClick={handleReset}>
        Hantar Emel Reset
      </button>
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </div>
  );
};
