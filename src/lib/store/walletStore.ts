import { create } from 'zustand';
import { Wallet, Transaction } from '@/types';

interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  balance: number;
  setWallet: (wallet: Wallet) => void;
  setTransactions: (transactions: Transaction[]) => void;
  updateBalance: (balance: number) => void;
  addTransaction: (transaction: Transaction) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  transactions: [],
  balance: 0,
  setWallet: (wallet) => set({ 
    wallet, 
    balance: parseFloat(wallet.balance || '0')
  }),
  setTransactions: (transactions) => set({ transactions }),
  updateBalance: (balance) => set({ balance }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
}));
