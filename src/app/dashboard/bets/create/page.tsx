import CreateBetForm from '@/components/bets/CreateBetForm';

export default function CreateBetPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Place New Bet</h1>
        <p className="text-secondary mt-1">Create a new trading bet</p>
      </div>
      <CreateBetForm />
    </div>
  );
}
