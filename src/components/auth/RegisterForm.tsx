'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth.api';
import { setAuth } from '@/lib/api/api';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import AuthShell from './AuthShell';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const registerSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  userName: z.string().min(3, 'Username must be at least 3 characters').max(30),
  emailCode: z.string().length(6, 'The code is six digits'),
  referralCode: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const email = watch('email');
  const password = watch('password') || '';

  const sendOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address first');
      return;
    }
    setIsSendingOTP(true);
    setError(null);
    try {
      await authApi.sendOTP(email);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not send the verification code');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!otpSent) {
      setError('Verify your email address first');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      const { token, ...user } = response.data;
      if (!token) {
        setError('Registration failed, no token received');
        return;
      }
      setAuth(token, user);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : msg || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Verify your email, then start trading"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/auth/login" className="text-accent hover:text-accent-hover font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        {otpSent && !error && (
          <Alert tone="success">
            Verification code sent. Check your inbox, and your spam folder if it does
            not arrive.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('userName')}
            label="Username"
            placeholder="Choose a username"
            autoComplete="username"
            error={errors.userName?.message}
          />

          <div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  {...register('email')}
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={sendOTP}
                loading={isSendingOTP}
                disabled={!email}
                className={errors.email ? 'mb-6' : ''}
              >
                {otpSent ? 'Resend' : 'Send code'}
              </Button>
            </div>
          </div>

          <Input
            {...register('emailCode')}
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="tracking-[0.3em] font-mono"
            error={errors.emailCode?.message}
          />

          <div>
            <Input
              {...register('password')}
              type="password"
              label="Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
              error={errors.password?.message}
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <Input
            {...register('referralCode')}
            label="Referral code"
            hint="Optional"
            placeholder="Enter a code if you have one"
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isLoading}
            disabled={!otpSent}
          >
            {isLoading ? 'Creating account' : 'Create account'}
          </Button>

          <p className="text-xs text-ink-faint text-center leading-relaxed">
            By creating an account you agree to the{' '}
            <Link href="/terms" className="text-ink-muted hover:text-ink underline">
              terms of service
            </Link>{' '}
            and confirm you have read the{' '}
            <Link href="/risk" className="text-ink-muted hover:text-ink underline">
              risk disclosure
            </Link>
            .
          </p>
        </form>
      </div>
    </AuthShell>
  );
}