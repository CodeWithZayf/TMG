import { create } from 'zustand';
import type { Role } from '@/utils/auth';

interface AuthState {
  userId: string | null;
  name: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  setUser: (userId: string, name: string, role: Role) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  name: null,
  role: null,
  isAuthenticated: false,

  setUser: (userId, name, role) =>
    set({ userId, name, role, isAuthenticated: true }),

  clear: () =>
    set({ userId: null, name: null, role: null, isAuthenticated: false }),
}));
