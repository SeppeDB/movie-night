import { create } from "zustand";
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  onAuthChange,
  signUp as signUpService,
  updateName as updateNameService,
} from "../services/authService";
import type { User } from "../types/User";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  init: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  init: () => {
    getCurrentUser().then((user) => {
      set({ user, isAuthenticated: user !== null, isInitialized: true });
    });
    return onAuthChange((user) => set({ user, isAuthenticated: user !== null }));
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const user = await loginService(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const user = await signUpService(name, email, password);
      set({ user, isAuthenticated: user !== null, isLoading: false });
      return user !== null;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    await logoutService();
    set({ user: null, isAuthenticated: false });
  },
  updateName: async (name) => {
    const user = await updateNameService(name);
    set({ user });
  },
}));
