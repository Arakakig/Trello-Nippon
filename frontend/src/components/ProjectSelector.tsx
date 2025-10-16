'use client';

import { useState, useEffect } from 'react';
import { useProjectsStore } from '@/store/projectsStore';
import CreateProjectModal from './CreateProjectModal';

export default function ProjectSelector() {
  const { projects, selectedProject, setSelectedProject, fetchProjects } = useProjectsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-2xl">{selectedProject?.icon || '📋'}</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">
              {selectedProject?.name || 'Selecione um projeto'}
            </p>
            {selectedProject && (
              <p className="text-xs text-gray-500">
                {selectedProject.members.length} membro{selectedProject.members.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
              <div className="p-2 max-h-96 overflow-y-auto">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Seus Projetos
                </div>
                
                {projects.length === 0 ? (
                  <div className="px-3 py-6 text-center text-gray-500 text-sm">
                    Nenhum projeto encontrado
                  </div>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project._id}
                      onClick={() => handleSelectProject(project)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                        selectedProject?._id === project._id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <span className="text-2xl">{project.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{project.name}</p>
                        {project.description && (
                          <p className="text-xs text-gray-500 truncate">{project.description}</p>
                        )}
                      </div>
                      {selectedProject?._id === project._id && (
                        <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))
                )}

                <div className="border-t border-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setShowCreateModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">Novo Projeto</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
}

