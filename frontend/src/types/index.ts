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
  isMonthlyProject: boolean;
  projectMonth: string;
  projectYear: number;
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
  isRecurring: boolean;
  recurringType: 'weekly' | 'monthly' | 'yearly' | null;
  recurringDays: number[];
  recurringEndDate: string | null;
  parentTask: string | null;
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

export interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  owner: User;
  user?: string; // Referência ao usuário vinculado
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: string;
  name: string;
  phone: string;
  contract: string;
  adhesionDate: string;
  contractDate: string;
  dueDate: string;
  plan: string;
  observation: string;
  adhesionValue: number;
  paymentMethod: string;
  confirmation: string;
  homeVisit: boolean;
  origin: string;
  paid: boolean;
  vendor: Vendor | string | null;
  listMonth: string;
  listYear: number;
  owner: User;
  project: Project | string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientsState {
  clients: Client[];
  selectedClient: Client | null;
  isLoading: boolean;
  fetchClients: (projectId?: string, filters?: { startDate?: string; endDate?: string }) => Promise<void>;
  createClient: (data: Partial<Client>) => Promise<void>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  setSelectedClient: (client: Client | null) => void;
}

export interface VendorsState {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  isLoading: boolean;
  fetchVendors: () => Promise<void>;
  createVendor: (data: Partial<Vendor>) => Promise<void>;
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  setSelectedVendor: (vendor: Vendor | null) => void;
  linkVendorsToUsers: () => Promise<any>;
}

export interface AnalyticsData {
  monthlyClients: { month: string; year: number; count: number; totalValue: number }[];
  clientsByPlan: { plan: string; count: number; totalValue: number }[];
  clientsByVendor: { vendor: string; count: number; totalValue: number }[];
  clientsByOrigin: { origin: string; count: number }[];
  clientsByPaymentMethod: { method: string; count: number; totalValue: number }[];
  confirmedVsUnconfirmed: { confirmed: number; unconfirmed: number };
  homeVisits: { withVisit: number; withoutVisit: number };
  totalClients: number;
  totalValue: number;
  averageValue: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  vendorId?: string;
  plan?: string;
  origin?: string;
  paymentMethod?: string;
  confirmed?: boolean;
  homeVisit?: boolean;
}

export interface ImportedClient {
  name: string;
  phone: string;
  assignedVendor?: string;
  assignedDate?: string;
}

export interface ColdList {
  _id: string;
  name: string;
  description: string;
  clientsPerDay: number;
  clientsPerVendor: number;
  selectedVendors: Vendor[];
  totalClients: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  tasksGenerated: number;
  owner: string;
  assignedUser?: User | string; // Usuário específico para quem a lista é destinada
  project: Project | string;
  importedClients: ImportedClient[];
  createdAt: string;
  updatedAt: string;
}

