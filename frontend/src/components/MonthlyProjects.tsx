'use client';

import { useState, useEffect } from 'react';
import { useProjectsStore } from '@/store/projectsStore';
import api from '@/lib/api';

export default function MonthlyProjects() {
  const { projects, fetchProjects, createProject } = useProjectsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    projectMonth: '',
    projectYear: new Date().getFullYear(),
    color: '#0ea5e9',
    icon: '📅'
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const monthlyProjects = projects.filter(project => project.isMonthlyProject);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.projectMonth) return;

    setIsLoading(true);
    try {
      await createProject({
        ...newProject,
        isMonthlyProject: true,
        description: newProject.description || `Projeto para ${newProject.projectMonth} ${newProject.projectYear}`
      });
      
      setNewProject({
        name: '',
        description: '',
        projectMonth: '',
        projectYear: new Date().getFullYear(),
        color: '#0ea5e9',
        icon: '📅'
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Erro ao criar projeto mensal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMonthName = (month: string) => {
    const months = {
      'janeiro': 'Janeiro',
      'fevereiro': 'Fevereiro',
      'março': 'Março',
      'abril': 'Abril',
      'maio': 'Maio',
      'junho': 'Junho',
      'julho': 'Julho',
      'agosto': 'Agosto',
      'setembro': 'Setembro',
      'outubro': 'Outubro',
      'novembro': 'Novembro',
      'dezembro': 'Dezembro'
    };
    return months[month as keyof typeof months] || month;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projetos Mensais</h2>
          <p className="text-gray-600">Organize seus clientes por projetos mensais</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Projeto Mensal</span>
        </button>
      </div>

      {/* Lista de Projetos Mensais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {monthlyProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">Nenhum projeto mensal criado ainda</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Criar seu primeiro projeto mensal
            </button>
          </div>
        ) : (
          monthlyProjects
            .sort((a, b) => {
              if (a.projectYear !== b.projectYear) return b.projectYear - a.projectYear;
              const monthOrder = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                                'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
              return monthOrder.indexOf(b.projectMonth) - monthOrder.indexOf(a.projectMonth);
            })
            .map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getMonthName(project.projectMonth)} {project.projectYear}
                      </h3>
                      <p className="text-sm text-gray-600">{project.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descrição:</span>
                    <span className="text-gray-900">{project.description || 'Sem descrição'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Criado em:</span>
                    <span className="text-gray-900">
                      {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Gerenciar Clientes →
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Modal de Criação */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Novo Projeto Mensal</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Projeto
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Lista Janeiro 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mês
                  </label>
                  <select
                    value={newProject.projectMonth}
                    onChange={(e) => setNewProject(prev => ({ ...prev, projectMonth: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Selecione o mês...</option>
                    <option value="janeiro">Janeiro</option>
                    <option value="fevereiro">Fevereiro</option>
                    <option value="março">Março</option>
                    <option value="abril">Abril</option>
                    <option value="maio">Maio</option>
                    <option value="junho">Junho</option>
                    <option value="julho">Julho</option>
                    <option value="agosto">Agosto</option>
                    <option value="setembro">Setembro</option>
                    <option value="outubro">Outubro</option>
                    <option value="novembro">Novembro</option>
                    <option value="dezembro">Dezembro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ano
                  </label>
                  <input
                    type="number"
                    value={newProject.projectYear}
                    onChange={(e) => setNewProject(prev => ({ ...prev, projectYear: parseInt(e.target.value) }))}
                    min="2020"
                    max="2030"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Descrição do projeto mensal..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Criando...' : 'Criar Projeto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
