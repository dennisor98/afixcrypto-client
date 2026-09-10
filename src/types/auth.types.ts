export interface User {
  id: string;
  email: string;
  userName: string;
  role?: 'user' | 'admin';
  roles?: string; // Backend uses 'roles' field
  isEmailConfirmed: boolean;
  address: string;
  referralCode: string;
  hasMadeFirstDeposit: boolean;
  isblocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  userName: string;
  emailCode: string;
  referralCode?: string;
}

export interface OTPVerifyDto {
  email: string;
  otp: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  userName: string;
  token: string;
  referralCode: string;
  address?: string;
}

