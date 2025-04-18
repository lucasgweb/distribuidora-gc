import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { UserDTO } from '../dtos/user.dto';

export type AuthStore = {
  user: UserDTO | null;
  token: string | null;
  actions: {

    setToken: (token: string) => void;
    setUser: (user: UserDTO) => void;
    clear: () => void;
  };
};

export const useAuthStore = createStore<AuthStore>()(
  persist(
    (set) => ({
      actions: {
        setToken: (token) => set({ token }),
        setUser: (user) => set({ user }),
        clear: () => set({ user: null, token: null }),
      },
      user: null,
      token: null,
      companies: [],
      memberCompany: null,
      currentCompany: null,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);