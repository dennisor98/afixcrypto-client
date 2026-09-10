'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth.api';
import { setAuth } from '@/lib/api/api';
import AuthShell from './AuthShell';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';

const SESSION_MESSAGES: Record<string, string> = {
  inactivity: 'You were logged out due to inactivity.',
  session_expired: 'Your session has expired. Please log in again.',
  token_removed: 'Your session was ended. Please log in again.',
  expired: 'Your session has expired. Please log in again.',
};

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const reason =
    searchParams.get('reason') || (searchParams.get('expired') ? 'expired' : null);

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const completeLogin = (data: any) => {
    const { token, ...user } = data;
    if (!token) {
      setError('Login failed, no token received');
      return;
    }
    setAuth(token, user);
    const isAdmin = user.roles === 'admin' || user.roles === 'super_admin';
    router.replace(isAdmin ? '/admin' : redirect);
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      if (res.data?.requiresOtp) setStep('otp');
      else completeLogin(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.verifyLoginOtp({
        email: form.email,
        password: form.password,
        otp,
      });
      completeLogin(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === 'credentials' ? 'Welcome back' : 'Verify your identity'}
      subtitle={
        step === 'credentials'
          ? 'Sign in to your trading account'
          : `Enter the six digit code sent to ${form.email}`
      }
      footer={
        step === 'credentials' ? (
          <>
            Do not have an account?{' '}
            <Link href="/auth/register" className="text-accent hover:text-accent-hover font-medium">
              Create one
            </Link>
          </>
        ) : null
      }
    >
      <div className="space-y-5">
        {reason && SESSION_MESSAGES[reason] && step === 'credentials' && (
          <Alert tone="warning">{SESSION_MESSAGES[reason]}</Alert>
        )}

        {error && <Alert tone="error">{error}</Alert>}

        {step === 'credentials' ? (
          <form onSubmit={submitCredentials} className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <div>
              <Input
                type="password"
                name="password"
                label="Password"
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-accent hover:text-accent-hover"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? 'Signing in' : 'Sign in'}
            </Button>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="space-y-4">
            <Input
              type="text"
              name="otp"
              label="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-[0.4em] font-mono"
              autoFocus
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={otp.length !== 6}
            >
              {loading ? 'Verifying' : 'Verify and sign in'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => {
                setStep('credentials');
                setOtp('');
                setError('');
              }}
            >
              Back to sign in
            </Button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

export default function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-base flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}