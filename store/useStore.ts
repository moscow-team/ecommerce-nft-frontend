import { create } from 'zustand';
import { User, I18nTexts } from '@/types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  dipBalance: string;
  setDipBalance: (balance: string) => void;
  pendingWithdrawals: string;
  setPendingWithdrawals: (amount: string) => void;
  i18nTexts: I18nTexts;
  setI18nTexts: (texts: I18nTexts) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  dipBalance: '0',
  setDipBalance: (dipBalance) => set({ dipBalance }),
  pendingWithdrawals: '0',
  setPendingWithdrawals: (pendingWithdrawals) => set({ pendingWithdrawals }),
  i18nTexts: {},
  setI18nTexts: (i18nTexts) => set({ i18nTexts }),
  loading: false,
  setLoading: (loading) => set({ loading }),
}));