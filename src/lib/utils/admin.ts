/**
 * Check if the current user is an admin
 */
export function isAdmin(): boolean {
  if (typeof window === 'undefined') return false;

  const userStr = localStorage.getItem('user');
  if (!userStr) return false;

  try {
    const user = JSON.parse(userStr);
    return user.roles === 'admin' || user.roles === 'super_admin';
  } catch {
    return false;
  }
}

export function isSuperAdmin(): boolean {
  if (typeof window === 'undefined') return false;

  const userStr = localStorage.getItem('user');
  if (!userStr) return false;

  try {
    const user = JSON.parse(userStr);
    return user.roles === 'super_admin';
  } catch {
    return false;
  }
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): any | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

