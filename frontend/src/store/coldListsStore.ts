import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { ColdList } from '@/types';

interface DailyContactData {
  coldList: {
    _id: string;
    name: string;
    description: string;
  };
  date: string;
  clients: any[];
  stats: {
    totalClients: number;
    contactedClients: number;
    contactPercentage: number;
    vendorStats?: any[];
  };
}

interface DailySummaryData {
  date: string;
  summary: any[];
  overallStats: {
    totalClients: number;
    contactedClients: number;
    contactPercentage: number;
  };
}

interface ColdListsState {
  coldLists: ColdList[];
  isLoading: boolean;
  selectedColdList: ColdList | null;
  dailyContactData: DailyContactData | null;
  dailySummaryData: DailySummaryData | null;
  vendorContactsStats: any | null;
  
  // Actions
  fetchColdLists: (projectId?: string) => Promise<void>;
  createColdList: (data: Partial<ColdList>) => Promise<void>;
  updateColdList: (id: string, data: Partial<ColdList>) => Promise<void>;
  deleteColdList: (id: string) => Promise<void>;
  uploadColdListFile: (id: string, file: File) => Promise<any>;
  previewColdListFile: (id: string, file: File) => Promise<any>;
  importColdListFile: (id: string, columnMapping: any, file: File) => Promise<any>;
  generateTasks: (id: string) => Promise<any>;
  setSelectedColdList: (coldList: ColdList | null) => void;
  
  // Daily contact actions
  fetchDailyContacts: (coldListId: string, date?: string) => Promise<void>;
  updateClientContact: (coldListId: string, clientIndex: number, contacted: boolean) => Promise<void>;
  fetchDailySummary: (date?: string) => Promise<void>;
  redistributeClients: (coldListId: string) => Promise<any>;
  fetchVendorContactsStats: (date?: string) => Promise<any>;
}

export const useColdListsStore = create<ColdListsState>((set, get) => ({
  coldLists: [],
  isLoading: false,
  selectedColdList: null,
  dailyContactData: null,
  dailySummaryData: null,
  vendorContactsStats: null,

  fetchColdLists: async (projectId?: string) => {
    set({ isLoading: true });
    try {
      const params: any = {};
      if (projectId) params.projectId = projectId;
      
      const response = await api.get('/cold-lists', { params });
      set({ coldLists: response.data, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar listas de clientes frios:', error);
      set({ isLoading: false });
    }
  },

  createColdList: async (data: Partial<ColdList>) => {
    try {
      const response = await api.post('/cold-lists', data);
      set({ coldLists: [...get().coldLists, response.data] });
      toast.success('Lista de clientes frios criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar lista:', error);
      toast.error('Erro ao criar lista de clientes frios');
      throw error;
    }
  },

  updateColdList: async (id: string, data: Partial<ColdList>) => {
    try {
      const response = await api.put(`/cold-lists/${id}`, data);
      const coldLists = get().coldLists.map((coldList) =>
        coldList._id === id ? response.data : coldList
      );
      set({ coldLists });
      
      // Atualizar lista selecionada se for a mesma
      if (get().selectedColdList?._id === id) {
        set({ selectedColdList: response.data });
      }
      
      toast.success('Lista atualizada!');
    } catch (error: any) {
      console.error('Erro ao atualizar lista:', error);
      toast.error('Erro ao atualizar lista');
      throw error;
    }
  },

  deleteColdList: async (id: string) => {
    try {
      await api.delete(`/cold-lists/${id}`);
      const coldLists = get().coldLists.filter((coldList) => coldList._id !== id);
      set({ coldLists });
      
      // Limpar seleção se a lista deletada estava selecionada
      if (get().selectedColdList?._id === id) {
        set({ selectedColdList: null });
      }
      
      toast.success('Lista deletada!');
    } catch (error: any) {
      console.error('Erro ao deletar lista:', error);
      toast.error('Erro ao deletar lista');
      throw error;
    }
  },

  uploadColdListFile: async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/cold-lists/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success(response.data.message);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do arquivo');
      throw error;
    }
  },

  previewColdListFile: async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/cold-lists/${id}/preview`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao fazer preview:', error);
      toast.error('Erro ao fazer preview do arquivo');
      throw error;
    }
  },

  importColdListFile: async (id: string, columnMapping: any, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('columnMapping', JSON.stringify(columnMapping));
      
      const response = await api.post(`/cold-lists/${id}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success(response.data.message);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao importar:', error);
      toast.error('Erro ao importar clientes');
      throw error;
    }
  },

  generateTasks: async (id: string) => {
    try {
      const response = await api.post(`/cold-lists/${id}/generate-tasks`);
      
      // Atualizar a lista para refletir o novo status
      await get().fetchColdLists();
      
      toast.success(response.data.message);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao gerar tarefas:', error);
      toast.error('Erro ao gerar tarefas');
      throw error;
    }
  },

  setSelectedColdList: (coldList: ColdList | null) => {
    set({ selectedColdList: coldList });
  },

  fetchDailyContacts: async (coldListId: string, date?: string) => {
    set({ isLoading: true });
    try {
      const params: any = {};
      if (date) params.date = date;
      
      const response = await api.get(`/cold-lists/${coldListId}/daily-contacts`, { params });
      set({ dailyContactData: response.data, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar contatos diários:', error);
      set({ isLoading: false });
      toast.error('Erro ao carregar contatos do dia');
    }
  },

  updateClientContact: async (coldListId: string, clientIndex: number, contacted: boolean) => {
    // Atualização otimista - atualizar interface imediatamente
    const currentData = get().dailyContactData;
    if (currentData) {
      const updatedClients = [...currentData.clients];
      const originalClient = updatedClients[clientIndex];
      
      // Salvar estado original para reverter se necessário
      const originalState = {
        contacted: originalClient.contacted,
        contactDate: originalClient.contactDate,
        contactedBy: originalClient.contactedBy
      };
      
      // Atualizar imediatamente na interface
      updatedClients[clientIndex] = {
        ...originalClient,
        contacted,
        contactDate: contacted ? new Date().toISOString() : null,
        contactedBy: contacted ? 'current-user' : null // Placeholder, será atualizado pelo servidor
      };
      
      const contactedClients = updatedClients.filter(client => client.contacted).length;
      const contactPercentage = updatedClients.length > 0 ? Math.round((contactedClients / updatedClients.length) * 100) : 0;
      
      set({
        dailyContactData: {
          ...currentData,
          clients: updatedClients,
          stats: {
            ...currentData.stats,
            contactedClients,
            contactPercentage
          }
        }
      });
    }
    
    // Enviar para o servidor em background (sem aguardar resposta)
    api.put(`/cold-lists/${coldListId}/contact-client`, {
      clientIndex,
      contacted
    }).then(response => {
      // Atualizar com dados reais do servidor (silenciosamente)
      const currentData = get().dailyContactData;
      if (currentData) {
        const updatedClients = [...currentData.clients];
        updatedClients[clientIndex] = response.data.client;
        
        const contactedClients = updatedClients.filter(client => client.contacted).length;
        const contactPercentage = updatedClients.length > 0 ? Math.round((contactedClients / updatedClients.length) * 100) : 0;
        
        set({
          dailyContactData: {
            ...currentData,
            clients: updatedClients,
            stats: {
              ...currentData.stats,
              contactedClients,
              contactPercentage
            }
          }
        });
      }
    }).catch(error => {
      console.error('Erro ao sincronizar com servidor:', error);
      
      // Reverter mudanças em caso de erro
      const currentData = get().dailyContactData;
      if (currentData) {
        const updatedClients = [...currentData.clients];
        const originalClient = updatedClients[clientIndex];
        
        // Reverter para estado original
        updatedClients[clientIndex] = {
          ...originalClient,
          contacted: !contacted, // Reverter o estado
          contactDate: originalClient.contacted ? originalClient.contactDate : null,
          contactedBy: originalClient.contacted ? originalClient.contactedBy : null
        };
        
        const contactedClients = updatedClients.filter(client => client.contacted).length;
        const contactPercentage = updatedClients.length > 0 ? Math.round((contactedClients / updatedClients.length) * 100) : 0;
        
        set({
          dailyContactData: {
            ...currentData,
            clients: updatedClients,
            stats: {
              ...currentData.stats,
              contactedClients,
              contactPercentage
            }
          }
        });
        
        toast.error('Erro ao salvar. Mudanças revertidas.');
      }
    });
  },

  fetchDailySummary: async (date?: string) => {
    set({ isLoading: true });
    try {
      const params: any = {};
      if (date) params.date = date;
      
      const response = await api.get('/cold-lists/assigned/daily-summary', { params });
      set({ dailySummaryData: response.data, isLoading: false });
    } catch (error) {
      console.error('Erro ao buscar resumo diário:', error);
      set({ isLoading: false });
      toast.error('Erro ao carregar resumo diário');
    }
  },

  redistributeClients: async (coldListId: string) => {
    try {
      const response = await api.post(`/cold-lists/${coldListId}/redistribute`);
      toast.success(response.data.message);
      // Recarregar listas para mostrar as mudanças
      await get().fetchColdLists();
      return response.data;
    } catch (error: any) {
      console.error('Erro ao redistribuir clientes:', error);
      toast.error('Erro ao redistribuir clientes');
      throw error;
    }
  },

  fetchVendorContactsStats: async (date?: string) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (date) {
        params.append('date', date);
      }

      const response = await api.get(`/cold-lists/vendor-contacts-stats?${params.toString()}`);
      
      set({
        vendorContactsStats: response.data,
        isLoading: false
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas de vendedores:', error);
      set({ isLoading: false });
      toast.error('Erro ao carregar estatísticas de vendedores');
      throw error;
    }
  }
}));
