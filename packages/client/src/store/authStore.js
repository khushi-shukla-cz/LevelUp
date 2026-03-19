// packages/client/src/store/authStore.js
import { create } from 'zustand';
import api from '@/lib/api';

const TOKEN_KEY = 'levelup_token';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  isLoading: true,
  isAuthenticated: false,

  // ── Initialize from storage ───────────────────────────────────────────────
  init: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return set({ isLoading: false, isAuthenticated: false });
    try {
      const { data } = await api.get('/api/auth/me');
      set({ user: data.user, token, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  // ── Register ──────────────────────────────────────────────────────────────
  register: async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
    return data;
  },

  // ── Login ─────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
    return data;
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  // ── Complete onboarding ───────────────────────────────────────────────────
  completeOnboarding: async (payload) => {
    const { data } = await api.patch('/api/auth/onboarding', payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    set({ user: data.user, token: data.token });
    return data;
  },

  // ── Update user locally (after XP/level changes) ──────────────────────────
  updateUser: (updates) => {
    set((state) => ({ user: state.user ? { ...state.user, ...updates } : state.user }));
  },

  // ── Refresh user from server ──────────────────────────────────────────────
  refreshUser: async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      set({ user: data.user });
    } catch { /* silent */ }
  },
}));
