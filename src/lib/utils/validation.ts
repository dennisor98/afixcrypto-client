export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && !isNaN(amount);
};

// src/lib/utils/constants.ts
export const APP_NAME = 'Crypto Betting Platform';
export const MIN_BET_AMOUNT = 1;
export const MAX_BET_AMOUNT = 10000;
export const MIN_WITHDRAW_AMOUNT = 10;
export const NETWORK = 'TRON';

export const BET_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export const TRANSACTION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};