import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  getUserByEmail: (email: string) => api.get(`/auth/users/by-email/${email}`),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
};

// Projects API
export const projectsApi = {
  getAll: (includeArchived?: boolean) => 
    api.get('/projects', { params: { includeArchived } }),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (projectId: string, userId: string, role?: string) =>
    api.post(`/projects/${projectId}/members`, { userId, role }),
  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
  updateMemberRole: (projectId: string, userId: string, role: string) =>
    api.put(`/projects/${projectId}/members/${userId}`, { role }),
  createDefault: () => api.post('/projects/create-default'),
};

// Tasks API
export const tasksApi = {
  getAll: (projectId?: string) => 
    api.get('/tasks', { params: { projectId } }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  reorder: (tasks: any[]) => api.post('/tasks/reorder', { tasks }),
  uploadAttachment: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/tasks/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteAttachment: (taskId: string, attachmentId: string) =>
    api.delete(`/tasks/${taskId}/attachments/${attachmentId}`),
  downloadAttachment: (taskId: string, attachmentId: string) =>
    `${API_URL}/tasks/${taskId}/attachments/${attachmentId}/download`,
};

// Comments API
export const commentsApi = {
  getByTask: (taskId: string) => api.get(`/comments/task/${taskId}`),
  create: (data: { taskId: string; text: string }) => api.post('/comments', data),
  update: (id: string, data: { text: string }) => api.put(`/comments/${id}`, data),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

