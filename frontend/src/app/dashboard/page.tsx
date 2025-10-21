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
import ClientsList from '@/components/ClientsList';
import VendorsManagement from '@/components/VendorsManagement';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ColdListsManager from '@/components/ColdListsManager';
import DailyContactsManager from '@/components/DailyContactsManager';
import VendorContactsTable from '@/components/VendorContactsTable';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();
  const { selectedTask } = useTasksStore();
  const { selectedProject, fetchProjects, createDefaultProject } = useProjectsStore();
  const [view, setView] = useState<'kanban' | 'calendar' | 'clients' | 'vendors' | 'analytics' | 'cold-lists' | 'daily-contacts' | 'overview'>('kanban');
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
            <h1 className="text-3xl font-bold text-gray-900">
              {view === 'clients' ? 'Clientes' : 
               view === 'vendors' ? 'Vendedores' : 
               view === 'analytics' ? 'Dashboard' : 
               view === 'cold-lists' ? 'Listas de Clientes Frios' :
               view === 'daily-contacts' ? 'Contatos Diários' :
               view === 'overview' ? 'Contatos por Vendedor' :
               'Minhas Tarefas'}
            </h1>
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
              <button
                onClick={() => setView('clients')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'clients'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Clientes
              </button>
              <button
                onClick={() => setView('vendors')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'vendors'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Vendedores
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'analytics'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => setView('cold-lists')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'cold-lists'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Clientes Frios
              </button>
              <button
                onClick={() => setView('daily-contacts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'daily-contacts'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contatos Diários
              </button>
              <button
                onClick={() => setView('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'overview'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Contatos/Vendedor
              </button>
            </div>

            {/* Create Task Button - only show for kanban/calendar views */}
            {view !== 'clients' && view !== 'vendors' && view !== 'analytics' && view !== 'cold-lists' && view !== 'daily-contacts' && view !== 'overview' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nova Tarefa</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {view === 'kanban' ? (
            <KanbanBoard />
          ) : view === 'calendar' ? (
            <CalendarView />
          ) : view === 'clients' ? (
            <div className="p-6">
              <ClientsList />
            </div>
          ) : view === 'vendors' ? (
            <div className="p-6">
              <VendorsManagement />
            </div>
          ) : view === 'analytics' ? (
            <div className="p-6">
              <AnalyticsDashboard />
            </div>
          ) : view === 'cold-lists' ? (
            <div className="p-6">
              <ColdListsManager />
            </div>
          ) : view === 'daily-contacts' ? (
            <div className="p-6">
              <DailyContactsManager />
            </div>
          ) : ( // view === 'overview'
            <div className="p-6">
              <VendorContactsTable />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedTask && <TaskModal />}
      {showCreateForm && <CreateTaskForm onClose={() => setShowCreateForm(false)} />}
    </div>
  );
}

