import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Location } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  currentLocation: Location | null;
  agencySlug: string;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setCurrentLocation: (loc: Location) => void;
  setAgencySlug: (slug: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      currentLocation: null,
      agencySlug: 'default_agency',
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setCurrentLocation: (loc) => set({ currentLocation: loc }),
      setAgencySlug: (slug) => set({ agencySlug: slug }),
      logout: () => set({ token: null, user: null, currentLocation: null }),
    }),
    { name: 'patrolrms-auth' }
  )
);
