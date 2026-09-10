import { create } from 'zustand';

// Placeholder bet store - can be extended as needed
interface BetState {
    activeBets: any[];
    setActiveBets: (bets: any[]) => void;
}

export const useBetStore = create<BetState>((set) => ({
    activeBets: [],
    setActiveBets: (bets) => set({ activeBets: bets }),
}));
