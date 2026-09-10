import api from './client';

export const authApi = {
  register: (data: any) => api.post('/user/signUp', data),

  login: (data: { email: string; password: string }) => api.post('/user/login', data),
  verifyLoginOtp: (data: { email: string; password: string; otp: string }) =>
      api.post('/user/verify-login-otp', data),

  logout: () => api.post('/user/logout'),
  refresh: () => api.post('/user/refresh'),

  sendOTP: (email: string) => api.post('/verification/send-email', { email }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/user/change-password', data),
  toggle2fa: (enabled: boolean) => api.post('/user/toggle-2fa', { enabled }),
  getSecurity: () => api.get('/user/security'),

  forgotPassword: (email: string) => api.post('/user/forgot-password', { email }),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
      api.post('/user/reset-password', data),
};