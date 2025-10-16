'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTasksStore } from '@/store/tasksStore';
import { useProjectsStore } from '@/store/projectsStore';
import Navbar from '@/components/Navbar';
import KanbanBoard from '@/components/KanbanBoard';
import CalendarView from '@/components/CalendarView';
import TaskModal from '@/components/TaskModal';
import CreateTaskForm from '@/components/CreateTaskForm';
import ProjectSelector from '@/components/ProjectSelector';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();
  const { selectedTask } = useTasksStore();
  const { selectedProject, fetchProjects, createDefaultProject } = useProjectsStore();
  const [view, setView] = useState<'kanban' | 'calendar'>('kanban');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const initializeProjects = async () => {
      if (isAuthenticated) {
        await fetchProjects();
        // Se não tiver projetos, cria um padrão
        const storedProjects = await fetchProjects();
        if (storedProjects === undefined || (Array.isArray(storedProjects) && (storedProjects as never[]).length === 0)) {
          await createDefaultProject();
        }
      }
    };
    initializeProjects();
  }, [isAuthenticated, fetchProjects, createDefaultProject]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Banner de verificação de email */}
      <EmailVerificationBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with view switcher */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">Minhas Tarefas</h1>
            <ProjectSelector />
          </div>

          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1">
              <button
                onClick={() => setView('kanban')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'kanban'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Kanban
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendário
              </button>
            </div>

            {/* Create Task Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nova Tarefa</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {view === 'kanban' ? <KanbanBoard /> : <CalendarView />}
        </div>
      </div>

      {/* Modals */}
      {selectedTask && <TaskModal />}
      {showCreateForm && <CreateTaskForm onClose={() => setShowCreateForm(false)} />}
    </div>
  );
}

