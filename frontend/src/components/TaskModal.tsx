'use client';

import { useState, useEffect } from 'react';
import { useTasksStore } from '@/store/tasksStore';
import { commentsApi, authApi } from '@/lib/api';
import { Comment, User } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import AttachmentsSection from './AttachmentsSection';

const statusOptions = [
  { value: 'todo', label: 'A Fazer' },
  { value: 'in_progress', label: 'Em Progresso' },
  { value: 'review', label: 'Em Revisão' },
  { value: 'done', label: 'Concluído' },
];

const priorityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

export default function TaskModal() {
  const { selectedTask, setSelectedTask, updateTask, deleteTask } = useTasksStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(selectedTask);

  useEffect(() => {
    if (selectedTask) {
      setEditedTask(selectedTask);
      fetchComments();
      fetchUsers();
    }
  }, [selectedTask]);

  const fetchComments = async () => {
    if (!selectedTask) return;
    try {
      const response = await commentsApi.getByTask(selectedTask._id);
      setComments(response.data);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    try {
      const response = await commentsApi.create({
        taskId: selectedTask._id,
        text: newComment,
      });
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.delete(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success('Comentário removido!');
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
    }
  };

  const handleSaveTask = async () => {
    if (!selectedTask || !editedTask) return;

    try {
      await updateTask(selectedTask._id, {
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        priority: editedTask.priority,
        dueDate: editedTask.dueDate,
        assignedTo: editedTask.assignedTo.map((u) => u.id) as any
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

    try {
      await deleteTask(selectedTask._id);
      setSelectedTask(null);
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  const toggleAssignee = (user: User) => {
    if (!editedTask) return;
    const isAssigned = editedTask.assignedTo.some((u) => u.id === user.id);
    const newAssignees = isAssigned
      ? editedTask.assignedTo.filter((u) => u.id !== user.id)
      : [...editedTask.assignedTo, user];
    setEditedTask({ ...editedTask, assignedTo: newAssignees });
  };

  if (!selectedTask || !editedTask) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-2xl font-bold w-full border-b-2 border-primary-500 focus:outline-none"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
            )}
          </div>
          <button
            onClick={() => setSelectedTask(null)}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Actions */}
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveTask}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTask(selectedTask);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Editar
              </button>
            )}
            <button
              onClick={handleDeleteTask}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Deletar
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Descrição</h3>
            {isEditing ? (
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Adicione uma descrição..."
              />
            ) : (
              <p className="text-gray-600">
                {selectedTask.description || 'Sem descrição'}
              </p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
              {isEditing ? (
                <select
                  value={editedTask.status}
                  onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-600">
                  {statusOptions.find((o) => o.value === selectedTask.status)?.label}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Prioridade</h3>
              {isEditing ? (
                <select
                  value={editedTask.priority}
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-600">
                  {priorityOptions.find((o) => o.value === selectedTask.priority)?.label}
                </p>
              )}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Data de Vencimento</h3>
            {isEditing ? (
              <input
                type="date"
                value={editedTask.dueDate ? editedTask.dueDate.split('T')[0] : ''}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value || null })}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-gray-600">
                {selectedTask.dueDate
                  ? format(new Date(selectedTask.dueDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : 'Sem data de vencimento'}
              </p>
            )}
          </div>

          {/* Assigned Users */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Atribuído a</h3>
            {isEditing ? (
              <div className="space-y-2">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editedTask.assignedTo.some((u) => u.id === user.id)}
                      onChange={() => toggleAssignee(user)}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">{user.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedTask.assignedTo.length > 0 ? (
                  selectedTask.assignedTo.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 bg-primary-100 text-primary-800 px-3 py-1 rounded-full"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhum usuário atribuído</p>
                )}
              </div>
            )}
          </div>

          {/* Attachments */}
          <AttachmentsSection task={selectedTask} />

          {/* Comments */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Comentários</h3>
            
            <form onSubmit={handleAddComment} className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Adicione um comentário..."
                rows={3}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comentar
              </button>
            </form>

            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-white text-sm flex items-center justify-center">
                        {comment.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{comment.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(comment.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                  <p className="mt-2 text-gray-700">{comment.text}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nenhum comentário ainda</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

