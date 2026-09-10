'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';
import { isAdmin } from '@/lib/utils/admin';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication and admin role
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin
    if (!isAdmin()) {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  return <AdminLayout>{children}</AdminLayout>;
}

