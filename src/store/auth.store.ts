import { create } from 'zustand';
import { User } from '@/types/user.types';
import { userApi } from '@/api/user.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen for global unauthorized event
  if (typeof window !== 'undefined') {
    window.addEventListener('teamhub:unauthorized', () => {
      get().logout();
    });
  }

  return {
    user: null,
    token: localStorage.getItem('teamhub_token'),
    isAuthenticated: !!localStorage.getItem('teamhub_token'),
    isLoading: true,

    setAuth: (token: string, user: User) => {
      localStorage.setItem('teamhub_token', token);
      localStorage.setItem('teamhub_user', JSON.stringify(user));
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    },

    updateUser: (user: User) => {
      localStorage.setItem('teamhub_user', JSON.stringify(user));
      set({ user });
    },

    logout: () => {
      localStorage.removeItem('teamhub_token');
      localStorage.removeItem('teamhub_user');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    },

    initialize: async () => {
      const storedToken = localStorage.getItem('teamhub_token');
      const storedUser = localStorage.getItem('teamhub_user');

      if (!storedToken) {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Optimistically restore cached user while validating
      if (storedUser) {
        try {
          set({ user: JSON.parse(storedUser) });
        } catch {
          // ignore parsing error
        }
      }

      try {
        const currentUser = await userApi.getCurrentUser();
        localStorage.setItem('teamhub_user', JSON.stringify(currentUser));
        set({
          token: storedToken,
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        // Token is invalid/expired
        localStorage.removeItem('teamhub_token');
        localStorage.removeItem('teamhub_user');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },
  };
});
