import WithdrawalForm from '@/components/wallet/WithdrawalForm';

export default function WithdrawPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Withdraw Funds</h1>
        <p className="text-secondary mt-1">Request a withdrawal to your TRON wallet</p>
      </div>
      <WithdrawalForm />
    </div>
  );
}
