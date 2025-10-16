export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  emailVerified?: boolean;
}

export interface ProjectMember {
  user: User;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  addedAt: string;
  _id?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  owner: User;
  members: ProjectMember[];
  isDefault: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  assignedTo: User[];
  createdBy: User;
  project: Project | string;
  projectId: string;
  attachments: Attachment[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  task: string;
  user: User;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  fetchTasks: (projectId?: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (tasks: any[]) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  uploadAttachment: (taskId: string, file: File) => Promise<void>;
  deleteAttachment: (taskId: string, attachmentId: string) => Promise<void>;
}

export interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  addMember: (projectId: string, userId: string, role?: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  updateMemberRole: (projectId: string, userId: string, role: string) => Promise<void>;
  createDefaultProject: () => Promise<void>;
}

