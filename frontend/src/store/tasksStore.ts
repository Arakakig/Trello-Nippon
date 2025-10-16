import { create } from 'zustand';
import { TasksState, Task } from '@/types';
import { tasksApi } from '@/lib/api';
import toast from 'react-hot-toast';

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  isLoading: false,

  fetchTasks: async (projectId?: string) => {
    set({ isLoading: true });
    try {
      const response = await tasksApi.getAll(projectId);
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Erro ao buscar tarefas:', error);
      toast.error('Erro ao carregar tarefas');
      set({ isLoading: false });
    }
  },

  createTask: async (data: Partial<Task>) => {
    try {
      const response = await tasksApi.create(data);
      set({ tasks: [...get().tasks, response.data] });
      toast.success('Tarefa criada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa');
      throw error;
    }
  },

  updateTask: async (id: string, data: Partial<Task>) => {
    try {
      const response = await tasksApi.update(id, data);
      const tasks = get().tasks.map((task) =>
        task._id === id ? response.data : task
      );
      set({ tasks });
      
      // Atualizar tarefa selecionada se for a mesma
      if (get().selectedTask?._id === id) {
        set({ selectedTask: response.data });
      }
      
      toast.success('Tarefa atualizada!');
    } catch (error: any) {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa');
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    try {
      await tasksApi.delete(id);
      const tasks = get().tasks.filter((task) => task._id !== id);
      set({ tasks, selectedTask: null });
      toast.success('Tarefa deletada!');
    } catch (error: any) {
      console.error('Erro ao deletar tarefa:', error);
      toast.error('Erro ao deletar tarefa');
      throw error;
    }
  },

  reorderTasks: async (tasksToReorder: any[]) => {
    try {
      const response = await tasksApi.reorder(tasksToReorder);
      set({ tasks: response.data });
    } catch (error: any) {
      console.error('Erro ao reordenar tarefas:', error);
      toast.error('Erro ao reordenar tarefas');
      throw error;
    }
  },

  setSelectedTask: (task: Task | null) => {
    set({ selectedTask: task });
  },

  uploadAttachment: async (taskId: string, file: File) => {
    try {
      const response = await tasksApi.uploadAttachment(taskId, file);
      const tasks = get().tasks.map((task) =>
        task._id === taskId ? response.data : task
      );
      set({ tasks });
      
      if (get().selectedTask?._id === taskId) {
        set({ selectedTask: response.data });
      }
      
      toast.success('Arquivo enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar arquivo:', error);
      toast.error('Erro ao enviar arquivo');
      throw error;
    }
  },

  deleteAttachment: async (taskId: string, attachmentId: string) => {
    try {
      const response = await tasksApi.deleteAttachment(taskId, attachmentId);
      const tasks = get().tasks.map((task) =>
        task._id === taskId ? response.data : task
      );
      set({ tasks });
      
      if (get().selectedTask?._id === taskId) {
        set({ selectedTask: response.data });
      }
      
      toast.success('Arquivo removido!');
    } catch (error: any) {
      console.error('Erro ao remover arquivo:', error);
      toast.error('Erro ao remover arquivo');
      throw error;
    }
  },
}));

