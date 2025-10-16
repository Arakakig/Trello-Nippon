'use client';

import { useState } from 'react';
import { useProjectsStore } from '@/store/projectsStore';

interface CreateProjectModalProps {
  onClose: () => void;
  project?: any;
}

const iconOptions = ['📋', '🚀', '💼', '🎯', '📊', '🎨', '💡', '⚡', '🔥', '⭐', '🌟', '🎉'];
const colorOptions = [
  { name: 'Azul', value: '#0ea5e9' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Índigo', value: '#6366f1' },
];

export default function CreateProjectModal({ onClose, project }: CreateProjectModalProps) {
  const { createProject, updateProject } = useProjectsStore();
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [icon, setIcon] = useState(project?.icon || '📋');
  const [color, setColor] = useState(project?.color || '#0ea5e9');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (project) {
        await updateProject(project._id, { name, description, icon, color });
      } else {
        await createProject({ name, description, icon, color });
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {project ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Projeto *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Desenvolvimento Web"
            />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Descreva o propósito do projeto..."
            />
          </div>

          {/* Ícone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map((iconOption) => (
                <button
                  key={iconOption}
                  type="button"
                  onClick={() => setIcon(iconOption)}
                  className={`p-3 text-2xl rounded-md border-2 transition-colors ${
                    icon === iconOption
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {iconOption}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`p-3 rounded-md border-2 transition-colors ${
                    color === colorOption.value
                      ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                >
                  {color === colorOption.value && (
                    <svg className="w-5 h-5 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Pré-visualização:</p>
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: color }}
              >
                {icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{name || 'Nome do Projeto'}</p>
                <p className="text-sm text-gray-600">{description || 'Descrição do projeto'}</p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : project ? 'Salvar' : 'Criar Projeto'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

