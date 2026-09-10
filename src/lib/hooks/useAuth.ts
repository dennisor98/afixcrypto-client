import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated via localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      logout();
    }
  }, [logout]);

  return { user, isAuthenticated, logout };
};
