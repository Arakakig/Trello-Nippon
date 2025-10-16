import { create } from 'zustand';
import { ProjectsState, Project } from '@/types';
import { projectsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  selectedProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const response = await projectsApi.getAll(false);
      const projects = response.data;
      
      set({ projects, isLoading: false });
      
      // Se não tem projeto selecionado, tenta restaurar do localStorage
      if (!get().selectedProject && projects.length > 0) {
        const savedProjectId = localStorage.getItem('selectedProjectId');
        let projectToSelect = null;
        
        // Tentar encontrar o projeto que estava selecionado anteriormente
        if (savedProjectId) {
          projectToSelect = projects.find((p: Project) => p._id === savedProjectId);
          if (projectToSelect) {
            console.log('🔄 Restaurando projeto anterior:', projectToSelect.name);
          }
        }
        
        // Se não encontrou, usar o padrão ou o primeiro
        if (!projectToSelect) {
          projectToSelect = projects.find((p: Project) => p.isDefault) || projects[0];
          console.log('📋 Selecionando projeto padrão:', projectToSelect?.name);
        }
        
        set({ selectedProject: projectToSelect });
      }
    } catch (error: any) {
      console.error('Erro ao buscar projetos:', error);
      toast.error('Erro ao carregar projetos');
      set({ isLoading: false });
    }
  },

  createProject: async (data: Partial<Project>) => {
    try {
      const response = await projectsApi.create(data);
      set({ projects: [...get().projects, response.data] });
      toast.success('Projeto criado com sucesso!');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      toast.error('Erro ao criar projeto');
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    try {
      const response = await projectsApi.update(id, data);
      const projects = get().projects.map((project) =>
        project._id === id ? response.data : project
      );
      set({ projects });
      
      // Atualizar projeto selecionado se for o mesmo
      if (get().selectedProject?._id === id) {
        set({ selectedProject: response.data });
      }
      
      toast.success('Projeto atualizado!');
    } catch (error: any) {
      console.error('Erro ao atualizar projeto:', error);
      toast.error('Erro ao atualizar projeto');
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      await projectsApi.delete(id);
      const projects = get().projects.filter((project) => project._id !== id);
      set({ projects });
      
      // Se era o projeto selecionado, seleciona outro
      if (get().selectedProject?._id === id) {
        set({ selectedProject: projects[0] || null });
      }
      
      toast.success('Projeto deletado!');
    } catch (error: any) {
      console.error('Erro ao deletar projeto:', error);
      toast.error('Erro ao deletar projeto');
      throw error;
    }
  },

  setSelectedProject: (project: Project | null) => {
    set({ selectedProject: project });
    // Salvar no localStorage para lembrar qual projeto estava aberto
    if (project) {
      localStorage.setItem('selectedProjectId', project._id);
      console.log('💾 Projeto salvo no localStorage:', project.name);
    } else {
      localStorage.removeItem('selectedProjectId');
    }
  },

  addMember: async (projectId: string, userId: string, role?: string) => {
    try {
      const response = await projectsApi.addMember(projectId, userId, role);
      const projects = get().projects.map((project) =>
        project._id === projectId ? response.data : project
      );
      set({ projects });
      
      if (get().selectedProject?._id === projectId) {
        set({ selectedProject: response.data });
      }
      
      toast.success('Membro adicionado!');
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar membro');
      throw error;
    }
  },

  removeMember: async (projectId: string, userId: string) => {
    try {
      const response = await projectsApi.removeMember(projectId, userId);
      const projects = get().projects.map((project) =>
        project._id === projectId ? response.data : project
      );
      set({ projects });
      
      if (get().selectedProject?._id === projectId) {
        set({ selectedProject: response.data });
      }
      
      toast.success('Membro removido!');
    } catch (error: any) {
      console.error('Erro ao remover membro:', error);
      toast.error(error.response?.data?.message || 'Erro ao remover membro');
      throw error;
    }
  },

  updateMemberRole: async (projectId: string, userId: string, role: string) => {
    try {
      const response = await projectsApi.updateMemberRole(projectId, userId, role);
      const projects = get().projects.map((project) =>
        project._id === projectId ? response.data : project
      );
      set({ projects });
      
      if (get().selectedProject?._id === projectId) {
        set({ selectedProject: response.data });
      }
      
      toast.success('Permissão atualizada!');
    } catch (error: any) {
      console.error('Erro ao atualizar permissão:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar permissão');
      throw error;
    }
  },

  createDefaultProject: async () => {
    try {
      const response = await projectsApi.createDefault();
      const existingProject = get().projects.find(p => p._id === response.data._id);
      
      if (!existingProject) {
        set({ projects: [...get().projects, response.data] });
      }
      
      set({ selectedProject: response.data });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar projeto padrão:', error);
      throw error;
    }
  },
}));

