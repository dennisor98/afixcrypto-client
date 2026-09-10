export interface Wallet {
  id: string;
  userId: string;
  balance: string;
  virtualBalance: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId?: string;
  user?: {
    id: string;
    userName: string;
    email: string;
  };
  amount: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  txId?: string; // Transaction ID (nullable in DB)
  createdAt: string;
  updatedAt: string;
}

export interface Deposit {
  id: string;
  userId?: string;
  user?: {
    id: string;
    userName: string;
    email: string;
  };
  amount: number; // Number in DB, not string
  name: string;
  from_address?: string;
  to_address?: string;
  transaction_id: string; // Unique in DB
  block_timestamp?: string;
  transferType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'refund';
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  hash?: string;
  createdAt: string;
}

export interface WithdrawWalletDto {
  amount: string;
  address: string;
}

export interface ApproveWithdrawalDto {
  withdrawalId: string;
  status: 'approved' | 'rejected';
}