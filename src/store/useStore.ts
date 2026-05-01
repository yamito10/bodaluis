import { create } from 'zustand';
import type { Payment } from '../types/payment';

interface StoreState {
  // Payment data
  payments: Payment[];
  loadingPayments: boolean;
  setPayments: (payments: Payment[]) => void;
  setLoadingPayments: (loading: boolean) => void;

  // Config data
  meta: number;
  fechaViaje: string;
  pin: string | null;
  loadingMeta: boolean;
  setMeta: (meta: number) => void;
  setFechaViaje: (fecha: string) => void;
  setPin: (pin: string | null) => void;
  setLoadingMeta: (loading: boolean) => void;

  // UI state
  darkMode: boolean;
  toggleDarkMode: () => void;
  editingPayment: Payment | null;
  setEditingPayment: (payment: Payment | null) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Payment data
  payments: [],
  loadingPayments: true,
  setPayments: (payments) => set({ payments, loadingPayments: false }),
  setLoadingPayments: (loading) => set({ loadingPayments: loading }),

  // Config data
  meta: 0,
  fechaViaje: '',
  pin: null,
  loadingMeta: true,
  setMeta: (meta) => set({ meta, loadingMeta: false }),
  setFechaViaje: (fechaViaje) => set({ fechaViaje }),
  setPin: (pin) => set({ pin }),
  setLoadingMeta: (loading) => set({ loadingMeta: loading }),

  // UI state
  darkMode: localStorage.getItem('darkMode') === 'true',
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      localStorage.setItem('darkMode', String(next));
      return { darkMode: next };
    }),
  editingPayment: null,
  setEditingPayment: (editingPayment) => set({ editingPayment }),
  isLocked: true,
  setIsLocked: (isLocked) => set({ isLocked }),
}));
