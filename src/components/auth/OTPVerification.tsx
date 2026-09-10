'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OTPVerification() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Note: OTP verification is handled during registration
  // This page is kept for consistency but OTP is verified in the registration flow
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('OTP verification is handled during registration. Please use the registration page.');
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-4">Email Verification</h2>
      <p className="text-center text-gray-600 mb-8">
        OTP verification is included in the registration process.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="text-center space-y-4">
        <p className="text-gray-600">
          If you need to verify your email, please complete the registration process.
        </p>
        <Link
          href="/auth/register"
          className="inline-block w-full bg-indigo-600 text-primary py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
        >
          Go to Registration
        </Link>
        <Link
          href="/auth/login"
          className="inline-block w-full text-indigo-600 hover:text-indigo-700 text-center"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
