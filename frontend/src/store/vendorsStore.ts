import { create } from 'zustand';
import { Vendor, VendorsState } from '@/types';
import api from '@/lib/api';

export const useVendorsStore = create<VendorsState>((set, get) => ({
  vendors: [],
  selectedVendor: null,
  isLoading: false,

  fetchVendors: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/vendors');
      set({ vendors: response.data, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar vendedores:', error);
      set({ isLoading: false });
    }
  },

  createVendor: async (data: Partial<Vendor>) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/vendors', data);
      const newVendor = response.data;
      set(state => ({
        vendors: [...state.vendors, newVendor].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false
      }));
      return newVendor;
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateVendor: async (id: string, data: Partial<Vendor>) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/vendors/${id}`, data);
      const updatedVendor = response.data;
      set(state => ({
        vendors: state.vendors.map(vendor =>
          vendor._id === id ? updatedVendor : vendor
        ).sort((a, b) => a.name.localeCompare(b.name)),
        selectedVendor: state.selectedVendor?._id === id ? updatedVendor : state.selectedVendor,
        isLoading: false
      }));
      return updatedVendor;
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  deleteVendor: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/vendors/${id}`);
      set(state => ({
        vendors: state.vendors.filter(vendor => vendor._id !== id),
        selectedVendor: state.selectedVendor?._id === id ? null : state.selectedVendor,
        isLoading: false
      }));
    } catch (error) {
      console.error('Erro ao deletar vendedor:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  setSelectedVendor: (vendor: Vendor | null) => {
    set({ selectedVendor: vendor });
  },

  linkVendorsToUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await api.post('/vendors/link-users');
      // Recarregar vendedores para mostrar as vinculações
      await get().fetchVendors();
      return response.data;
    } catch (error) {
      console.error('Erro ao vincular vendedores:', error);
      set({ isLoading: false });
      throw error;
    }
  }
}));
