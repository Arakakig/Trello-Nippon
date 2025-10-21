import { create } from 'zustand';
import { Client, ClientsState } from '@/types';
import api from '@/lib/api';

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  selectedClient: null,
  isLoading: false,

  fetchClients: async (projectId?: string, filters?: { startDate?: string; endDate?: string }) => {
    set({ isLoading: true });
    try {
      const params: any = {};
      if (projectId) params.projectId = projectId;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      
      const response = await api.get('/clients', { params });
      set({ clients: response.data, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      set({ isLoading: false });
    }
  },

  createClient: async (data: Partial<Client>) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/clients', data);
      const newClient = response.data;
      set(state => ({
        clients: [newClient, ...state.clients],
        isLoading: false
      }));
      return newClient;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateClient: async (id: string, data: Partial<Client>) => {
    set({ isLoading: true });
    try {
      const response = await api.put(`/clients/${id}`, data);
      const updatedClient = response.data;
      set(state => ({
        clients: state.clients.map(client =>
          client._id === id ? updatedClient : client
        ),
        selectedClient: state.selectedClient?._id === id ? updatedClient : state.selectedClient,
        isLoading: false
      }));
      return updatedClient;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  deleteClient: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/clients/${id}`);
      set(state => ({
        clients: state.clients.filter(client => client._id !== id),
        selectedClient: state.selectedClient?._id === id ? null : state.selectedClient,
        isLoading: false
      }));
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  setSelectedClient: (client: Client | null) => {
    set({ selectedClient: client });
  }
}));
