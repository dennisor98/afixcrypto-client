import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';

export const useWallet = () => {
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => userApi.getWallet().then(res => res.data),
  });

  return {
    wallet,
    balance: parseFloat(wallet?.balance || '0'),
    virtualBalance: parseFloat(wallet?.virtualBalance || '0'),
    isLoading,
  };
};
