'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth.api';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess('Check your email for a 6-digit reset code');
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setSuccess('Password reset! Redirecting to login...');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : msg || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-binance-yellow rounded-xl flex items-center justify-center font-black text-black text-xl">₿</div>
              <span className="text-primary font-bold text-xl">afixcrypto</span>
            </Link>
            <h1 className="text-2xl font-bold text-primary mt-6">
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-secondary text-sm mt-1">
              {step === 'email' ? 'Enter your email to receive a reset code' : `Enter the code we sent to ${email}`}
            </p>
          </div>

          <div className="bg-secondary border border-primary rounded-2xl p-8">
            {error && (
                <div className="bg-[#f6465d15] border border-[#f6465d40] text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
            )}
            {success && (
                <div className="bg-[#0ecb8115] border border-[#0ecb8130] text-green-400 text-sm px-4 py-3 rounded-lg mb-4">
                  {success}
                </div>
            )}

            {step === 'email' ? (
                <form onSubmit={requestReset} className="space-y-5">
                  <div>
                    <label className="block text-secondary text-sm mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="w-full bg-primary border border-primary text-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f0b90b]"
                    />
                  </div>
                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-binance-yellow text-black font-bold py-3.5 rounded-xl hover:bg-[#d4a017] transition-colors disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>
            ) : (
                <form onSubmit={doReset} className="space-y-5">
                  <div>
                    <label className="block text-secondary text-sm mb-2">6-Digit Code</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        className="w-full bg-primary border border-primary text-primary rounded-xl px-4 py-3 text-2xl text-center tracking-[0.5em] font-mono focus:outline-none focus:border-[#f0b90b]"
                    />
                  </div>
                  <div>
                    <label className="block text-secondary text-sm mb-2">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full bg-primary border border-primary text-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f0b90b]"
                    />
                    <PasswordStrengthMeter password={newPassword} />
                  </div>
                  <div>
                    <label className="block text-secondary text-sm mb-2">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        className="w-full bg-primary border border-primary text-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f0b90b]"
                    />
                  </div>
                  <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-binance-yellow text-black font-bold py-3.5 rounded-xl hover:bg-[#d4a017] transition-colors disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
            )}

            <p className="text-center text-secondary text-sm mt-6">
              Remembered your password?{' '}
              <Link href="/auth/login" className="text-[#f0b90b] hover:text-[#d4a017]">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
  );
}