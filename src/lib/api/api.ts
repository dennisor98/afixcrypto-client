const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export function setAuth(token: string, user: object) {
  // localStorage — for client reads
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  // Cookie — for middleware server-side protection
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser<T = any>(): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}