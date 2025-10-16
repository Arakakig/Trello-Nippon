import { create } from 'zustand';
import { AuthState } from '@/types';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true });
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ name, email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true });
      toast.success('Conta criada com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      toast.error(message);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
    toast.success('Logout realizado com sucesso!');
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },
}));

