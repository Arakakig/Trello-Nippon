'use client';

import { useState, useEffect } from 'react';
import { useProjectsStore } from '@/store/projectsStore';
import { authApi } from '@/lib/api';
import { User } from '@/types';
import CreateProjectModal from './CreateProjectModal';
import toast from 'react-hot-toast';

interface ProjectSettingsProps {
  onClose: () => void;
}

const roleLabels = {
  owner: 'Dono',
  admin: 'Administrador',
  member: 'Editor',
  viewer: 'Leitor',
};

const roleDescriptions = {
  admin: 'Pode gerenciar membros e todas as tarefas',
  member: 'Pode criar e editar tarefas',
  viewer: 'Pode apenas visualizar tarefas',
};

export default function ProjectSettings({ onClose }: ProjectSettingsProps) {
  const { selectedProject, addMember, removeMember, updateMemberRole, deleteProject } = useProjectsStore();
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleAddMemberByEmail = async () => {
    if (!inviteEmail.trim() || !selectedProject) return;
    
    setIsSearching(true);
    setSearchError('');

    try {
      const response = await authApi.getUserByEmail(inviteEmail.trim());
      
      if (!response.data.found) {
        setSearchError('Nenhum usuário encontrado com este email. A pessoa precisa criar uma conta primeiro.');
        setIsSearching(false);
        return;
      }

      const user = response.data.user;
      
      const isMember = selectedProject.members.some(m => m.user?.id === user.id);
      if (isMember) {
        setSearchError('Este usuário já é membro do projeto.');
        setIsSearching(false);
        return;
      }

      await addMember(selectedProject._id, user.id, selectedRole);
      
      setInviteEmail('');
      setSelectedRole('member');
      setSearchError('');
      toast.success(`${user.name} foi adicionado ao projeto!`);
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error);
      if (error.response?.status === 404) {
        setSearchError('Nenhum usuário encontrado com este email. A pessoa precisa criar uma conta primeiro.');
      } else {
        setSearchError('Erro ao buscar usuário. Tente novamente.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedProject) return;
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      await removeMember(selectedProject._id, userId);
      toast.success('Membro removido!');
    } catch (error) {
      console.error('Erro ao remover membro:', error);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!selectedProject) return;

    try {
      await updateMemberRole(selectedProject._id, userId, newRole);
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!confirm(`Tem certeza que deseja deletar o projeto "${selectedProject.name}"? Todas as tarefas serão removidas permanentemente!`)) return;

    try {
      await deleteProject(selectedProject._id);
      onClose();
      toast.success('Projeto deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
    }
  };

  if (!selectedProject) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: selectedProject.color }}
              >
                {selectedProject.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                <p className="text-sm text-gray-600">{selectedProject.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Campo de Compartilhamento - SEMPRE VISÍVEL para debug */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🔗 Compartilhar Projeto por Email
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Digite o email da pessoa que deseja adicionar. Ela precisará ter uma conta no sistema.
              </p>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setSearchError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMemberByEmail();
                      }
                    }}
                    placeholder="email@exemplo.com"
                    className="flex-1 border border-gray-300 rounded-md p-2 text-sm"
                  />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="member">📝 Editor</option>
                    <option value="admin">⚙️ Administrador</option>
                    <option value="viewer">👁️ Leitor</option>
                  </select>
                  <button
                    onClick={handleAddMemberByEmail}
                    disabled={!inviteEmail.trim() || isSearching}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isSearching ? 'Buscando...' : 'Adicionar'}
                  </button>
                </div>

                {searchError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    {searchError}
                  </div>
                )}

                <div className="bg-white border border-blue-200 rounded-md p-3 text-xs">
                  <p className="font-semibold text-blue-900 mb-2">Níveis de Permissão:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li><strong>📝 Editor:</strong> Pode criar e editar tarefas</li>
                    <li><strong>⚙️ Administrador:</strong> Pode gerenciar membros e todas as tarefas</li>
                    <li><strong>👁️ Leitor:</strong> Pode apenas visualizar tarefas (sem edição)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Lista de Membros */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Membros do Projeto ({selectedProject.members.length})
              </h3>

              <div className="space-y-2">
                {selectedProject.members.map((member) => {
                  if (!member.user || !member.user.name) return null;
                  
                  return (
                    <div
                      key={member.user.id || member._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
                          {member.user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.user.name}</p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                          <span className="text-xs text-gray-400">{roleLabels[member.role]}</span>
                        </div>
                      </div>

                      {member.role !== 'owner' && (
                        <div className="flex items-center space-x-2">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.user.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                          >
                            <option value="admin">⚙️ Administrador</option>
                            <option value="member">📝 Editor</option>
                            <option value="viewer">👁️ Leitor</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(member.user.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Remover"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ações */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Editar Projeto
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Deletar Projeto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <CreateProjectModal
          onClose={() => setShowEditModal(false)}
          project={selectedProject}
        />
      )}
    </>
  );
}

