'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth.api';
import AuthShell from './AuthShell';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PasswordStrengthMeter from './PasswordStrengthMeter';

type Step = 'request' | 'reset' | 'done';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      // The backend replies the same way whether or not the account exists,
      // so the response is never used to reveal that
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send the reset code');
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      setStep('done');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : msg || 'Could not reset the password');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <AuthShell
        title="Password updated"
        subtitle="You can now sign in with your new password"
      >
        <div className="space-y-5">
          <Alert tone="success">
            Your password has been changed. Any existing sessions remain valid until
            they expire.
          </Alert>
          <Button fullWidth size="lg" onClick={() => router.push('/auth/login')}>
            Go to sign in
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={step === 'request' ? 'Reset your password' : 'Enter your code'}
      subtitle={
        step === 'request'
          ? 'We will send a six digit code to your email'
          : `Enter the code sent to ${email} and choose a new password`
      }
      footer={
        <>
          Remembered it?{' '}
          <Link href="/auth/login" className="text-accent hover:text-accent-hover font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}

        {step === 'request' ? (
          <form onSubmit={requestCode} className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? 'Sending' : 'Send reset code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={submitReset} className="space-y-4">
            <Alert tone="info">
              If an account exists for {email}, a reset code has been sent. The code
              expires in thirty minutes.
            </Alert>

            <Input
              type="text"
              name="otp"
              label="Reset code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-[0.4em] font-mono"
              required
            />

            <div>
              <Input
                type="password"
                name="newPassword"
                label="New password"
                autoComplete="new-password"
                placeholder="Choose a strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <PasswordStrengthMeter password={newPassword} />
            </div>

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
              placeholder="Repeat the password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={
                confirm && confirm !== newPassword ? 'Passwords do not match' : undefined
              }
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={otp.length !== 6 || !newPassword || newPassword !== confirm}
            >
              {loading ? 'Updating' : 'Reset password'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => {
                setStep('request');
                setOtp('');
                setError('');
              }}
            >
              Use a different email
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}