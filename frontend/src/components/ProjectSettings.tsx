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
  const [users, setUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleAddMemberByEmail = async () => {
    if (!inviteEmail.trim() || !selectedProject) return;
    
    setIsSearching(true);
    setSearchError('');

    try {
      // Buscar usuário pelo email
      const response = await authApi.getUserByEmail(inviteEmail.trim());
      
      if (!response.data.found) {
        setSearchError('Nenhum usuário encontrado com este email. A pessoa precisa criar uma conta primeiro.');
        setIsSearching(false);
        return;
      }

      const user = response.data.user;
      
      // Verificar se já é membro
      const isMember = selectedProject.members.some(m => m.user.id === user.id);
      if (isMember) {
        setSearchError('Este usuário já é membro do projeto.');
        setIsSearching(false);
        return;
      }

      // Adicionar ao projeto
      await addMember(selectedProject._id, user.id, selectedRole);
      
      // Limpar formulário
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

  // Filtrar usuários que não são membros (com verificação de segurança)
  const availableUsers = users.filter(
    user => !selectedProject.members.some(member => member.user?.id === user.id)
  );

  // Verificar se é owner ou admin
  let currentUserId = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      currentUserId = userData.id;
    }
  } catch (error) {
    console.error('Erro ao obter user do localStorage:', error);
  }

  // Verificar se é owner - comparação mais robusta
  const ownerIdToCompare = selectedProject.owner?.id || selectedProject.owner?.id || selectedProject.owner;
  const isOwnerByOwnerId = String(ownerIdToCompare) === String(currentUserId);
  
  const isOwnerByRole = selectedProject.members.some(m => {
    const memberId = m.user?.id || m.user?.id;
    return m.role === 'owner' && String(memberId) === String(currentUserId);
  });

  const isOwner = isOwnerByOwnerId || isOwnerByRole;

  // Também permitir que admins compartilhem
  const isAdmin = selectedProject.members.some(m => {
    const memberId = m.user?.id || m.user?.id;
    return m.role === 'admin' && String(memberId) === String(currentUserId);
  });

  // TEMPORÁRIO: Sempre permitir compartilhar (remover depois)
  const canManageMembers = true; // isOwner || isAdmin;

  // Debug
  console.log('Debug ProjectSettings:', {
    currentUserId,
    ownerId: selectedProject.owner?.id || selectedProject.owner?.id,
    isOwner,
    isAdmin,
    canManageMembers,
    members: selectedProject.members
  });

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
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
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Ações do Projeto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ações do Projeto</h3>
              <div className="flex space-x-3">
                {canManageMembers && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Editar Projeto
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleDeleteProject}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Deletar Projeto
                  </button>
                )}
              </div>
            </div>

            {/* Membros */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Membros ({selectedProject.members.length})
              </h3>

              <div className="space-y-2 mb-4">
                {selectedProject.members.map((member) => {
                  // Verificação de segurança
                  if (!member.user || !member.user.name) {
                    return null;
                  }
                  
                  return (
                    <div
                      key={member.user.id || member._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center">
                          {member.user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.user.name}</p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                      </div>

                    <div className="flex items-center space-x-3">
                      {member.role === 'owner' ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          {roleLabels[member.role]}
                        </span>
                      ) : (
                        <>
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.user.id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                            disabled={!canManageMembers}
                            title={roleDescriptions[member.role as keyof typeof roleDescriptions] || ''}
                          >
                            <option value="admin">⚙️ Administrador</option>
                            <option value="member">📝 Editor</option>
                            <option value="viewer">👁️ Leitor</option>
                          </select>
                          {canManageMembers && (
                            <button
                              onClick={() => handleRemoveMember(member.user.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Remover membro"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </>
                      )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Compartilhar Projeto por Email */}
              {canManageMembers && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    🔗 Compartilhar Projeto
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
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
                        title={roleDescriptions[selectedRole as keyof typeof roleDescriptions]}
                      >
                        <option value="member">📝 Editor</option>
                        <option value="admin">⚙️ Administrador</option>
                        <option value="viewer">👁️ Leitor</option>
                      </select>
                      <button
                        onClick={handleAddMemberByEmail}
                        disabled={!inviteEmail.trim() || isSearching}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                      >
                        {isSearching ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Buscando...</span>
                          </>
                        ) : (
                          <span>Adicionar</span>
                        )}
                      </button>
                    </div>

                    {searchError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                        {searchError}
                      </div>
                    )}

                    {/* Descrição das permissões */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs">
                      <p className="font-semibold text-blue-900 mb-2">Níveis de Permissão:</p>
                      <ul className="space-y-1 text-blue-800">
                        <li><strong>📝 Editor:</strong> Pode criar e editar tarefas</li>
                        <li><strong>⚙️ Administrador:</strong> Pode gerenciar membros e todas as tarefas</li>
                        <li><strong>👁️ Leitor:</strong> Pode apenas visualizar tarefas (sem edição)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
              <p>Projeto criado em {new Date(selectedProject.createdAt).toLocaleDateString('pt-BR')}</p>
              <p className="mt-1">
                <strong>Níveis de Permissão:</strong>
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>👑 Dono:</strong> Controle total do projeto (criar, editar, deletar, gerenciar membros)</li>
                <li><strong>⚙️ Administrador:</strong> Pode gerenciar membros e todas as tarefas</li>
                <li><strong>📝 Editor:</strong> Pode criar e editar tarefas do projeto</li>
                <li><strong>👁️ Leitor:</strong> Pode apenas visualizar tarefas (sem permissão de edição)</li>
              </ul>
              
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <strong>💡 Dica:</strong> Para compartilhar este projeto, adicione pessoas usando o email delas. Elas precisam ter uma conta criada no sistema.
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

