'use client';

import { useState, useEffect } from 'react';
import { useColdListsStore } from '@/store/coldListsStore';
import { useVendorsStore } from '@/store/vendorsStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useAuthStore } from '@/store/authStore';
import { ColdList, Vendor, User } from '@/types';
import ColdListImportModal from './ColdListImportModal';

export default function ColdListsManager() {
  const { coldLists, isLoading, fetchColdLists, createColdList, deleteColdList, generateTasks, uploadColdListFile, redistributeClients } = useColdListsStore();
  const { vendors, fetchVendors } = useVendorsStore();
  const { selectedProject } = useProjectsStore();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingColdList, setEditingColdList] = useState<ColdList | null>(null);
  const [selectedColdList, setSelectedColdList] = useState<ColdList | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'assigned'>('all');
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientsPerDay: 10,
    clientsPerVendor: 5,
    selectedVendors: [] as string[],
    startDate: '',
    endDate: '',
    assignedUserId: user?.id || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedProject) {
      fetchColdLists(selectedProject._id);
      fetchVendors();
    }
  }, [selectedProject, fetchColdLists, fetchVendors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'clientsPerDay' || name === 'clientsPerVendor' ? parseInt(value) || 0 : value
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleVendorToggle = (vendorId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedVendors: prev.selectedVendors.includes(vendorId)
        ? prev.selectedVendors.filter(id => id !== vendorId)
        : [...prev.selectedVendors, vendorId]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da lista é obrigatório';
    }
    if (formData.clientsPerDay < 1) {
      newErrors.clientsPerDay = 'Deve ser pelo menos 1';
    }
    if (formData.clientsPerVendor < 1) {
      newErrors.clientsPerVendor = 'Deve ser pelo menos 1';
    }
    if (formData.selectedVendors.length === 0) {
      newErrors.selectedVendors = 'Selecione pelo menos um vendedor';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'Data de fim deve ser posterior à data de início';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedProject) return;

    try {
      const coldListData = {
        name: formData.name,
        description: formData.description,
        clientsPerDay: formData.clientsPerDay,
        clientsPerVendor: formData.clientsPerVendor,
        selectedVendors: formData.selectedVendors as any,
        startDate: formData.startDate,
        endDate: formData.endDate,
        projectId: selectedProject._id,
        assignedUserId: formData.assignedUserId || user?.id
      };

      if (editingColdList) {
        // await updateColdList(editingColdList._id, coldListData);
      } else {
        await createColdList(coldListData);
      }

      resetForm();
    } catch (error) {
      console.error('Erro ao salvar lista:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      clientsPerDay: 10,
      clientsPerVendor: 5,
      selectedVendors: [],
      startDate: '',
      endDate: '',
      assignedUserId: user?.id || ''
    });
    setErrors({});
    setShowForm(false);
    setEditingColdList(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta lista?')) {
      try {
        await deleteColdList(id);
      } catch (error) {
        console.error('Erro ao deletar lista:', error);
      }
    }
  };

  const handleGenerateTasks = async (id: string) => {
    if (confirm('Gerar tarefas para todos os vendedores? Esta ação não pode ser desfeita.')) {
      try {
        await generateTasks(id);
      } catch (error) {
        console.error('Erro ao gerar tarefas:', error);
      }
    }
  };

  const handleRedistributeClients = async (id: string) => {
    if (confirm('Redistribuir clientes da lista? Esta ação irá limpar todas as marcações de contato existentes.')) {
      try {
        await redistributeClients(id);
      } catch (error) {
        console.error('Erro ao redistribuir clientes:', error);
      }
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getFilteredColdLists = () => {
    if (!user) return coldLists;
    
    switch (activeTab) {
      case 'my':
        return coldLists.filter(list => {
          // Listas que eu criei OU que foram atribuídas para mim
          const assignedUserId = typeof list.assignedUser === 'string' ? list.assignedUser : list.assignedUser?.id;
          return list.owner === user.id || assignedUserId === user.id;
        });
      case 'assigned':
        return coldLists.filter(list => {
          // Listas que foram atribuídas para mim (incluindo as que eu mesmo criei)
          const assignedUserId = typeof list.assignedUser === 'string' ? list.assignedUser : list.assignedUser?.id;
          return assignedUserId === user.id;
        });
      case 'all':
      default:
        return coldLists;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Listas de Clientes Frios</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Lista
        </button>
      </div>

      {/* Abas */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Todas as Listas
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Minhas Listas
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assigned'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Listas Atribuídas
            </button>
          </nav>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingColdList ? 'Editar Lista' : 'Nova Lista de Clientes Frios'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Lista *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Lista Janeiro 2024"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Descrição da lista..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clientes por Dia *
                    </label>
                    <input
                      type="number"
                      name="clientsPerDay"
                      value={formData.clientsPerDay}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.clientsPerDay ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.clientsPerDay && <p className="text-red-500 text-xs mt-1">{errors.clientsPerDay}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clientes por Vendedor *
                    </label>
                    <input
                      type="number"
                      name="clientsPerVendor"
                      value={formData.clientsPerVendor}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.clientsPerVendor ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.clientsPerVendor && <p className="text-red-500 text-xs mt-1">{errors.clientsPerVendor}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendedores *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {vendors.map((vendor) => (
                      <label key={vendor._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.selectedVendors.includes(vendor._id)}
                          onChange={() => handleVendorToggle(vendor._id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{vendor.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.selectedVendors && <p className="text-red-500 text-xs mt-1">{errors.selectedVendors}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atribuir para usuário específico (opcional)
                  </label>
                  <select
                    name="assignedUserId"
                    value={formData.assignedUserId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={user?.id || ''}>Eu mesmo ({user?.name || 'Usuário'})</option>
                    {vendors.filter(vendor => vendor.user).map((vendor) => (
                      <option key={vendor._id} value={vendor.user}>
                        {vendor.name} ({vendor.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Selecione para quem a lista será atribuída
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {editingColdList ? 'Atualizar' : 'Criar Lista'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Listas */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Carregando listas...</p>
        </div>
      ) : getFilteredColdLists().length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma lista encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">Comece criando uma nova lista de clientes frios.</p>
        </div>
      ) : (
        <>
          {/* Resumo das listas */}
        {activeTab === 'assigned' && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Resumo das Listas Atribuídas</h3>
                <p className="text-sm text-blue-600">
                  {getFilteredColdLists().length} lista(s) atribuída(s) para você
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-800">
                  {getFilteredColdLists().reduce((total, list) => 
                    total + (list.importedClients ? list.importedClients.length : 0), 0
                  )}
                </div>
                <div className="text-sm text-blue-600">clientes importados</div>
              </div>
            </div>
          </div>
        )}
          
          <div className="grid gap-4">
          {getFilteredColdLists().map((coldList) => (
            <div key={coldList._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{coldList.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(coldList.status)}`}>
                      {getStatusLabel(coldList.status)}
                    </span>
                    {coldList.assignedUser && typeof coldList.assignedUser === 'object' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Para: {coldList.assignedUser.name}
                      </span>
                    )}
                    {coldList.importedClients && coldList.importedClients.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        📋 {coldList.importedClients.length} clientes
                      </span>
                    )}
                  </div>
                  
                  {coldList.description && (
                    <p className="text-sm text-gray-600 mt-1">{coldList.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Clientes/Dia:</span>
                      <span className="ml-1 font-medium">{coldList.clientsPerDay}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Por Vendedor:</span>
                      <span className="ml-1 font-medium">{coldList.clientsPerVendor}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Vendedores:</span>
                      <span className="ml-1 font-medium">{coldList.selectedVendors.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Clientes:</span>
                      <span className="ml-1 font-medium">{coldList.totalClients}</span>
                    </div>
                  </div>
                  
                  {coldList.importedClients && coldList.importedClients.length > 0 && (
                    <div className="mt-3">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {coldList.importedClients.length} clientes importados
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Período: {new Date(coldList.startDate).toLocaleDateString('pt-BR')} - {new Date(coldList.endDate).toLocaleDateString('pt-BR')}</span>
                    {coldList.tasksGenerated > 0 && (
                      <span className="ml-4">Tarefas: {coldList.tasksGenerated}</span>
                    )}
                  </div>
                  
                  {coldList.importedClients.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          Clientes Importados ({coldList.importedClients.length})
                        </p>
                        <button
                          onClick={() => setExpandedList(expandedList === coldList._id ? null : coldList._id)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>{expandedList === coldList._id ? 'Ocultar' : 'Ver Todos'}</span>
                          <svg 
                            className={`w-4 h-4 transition-transform ${expandedList === coldList._id ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      
                      {expandedList === coldList._id ? (
                        <div className="max-h-96 overflow-y-auto bg-gray-50 p-3 rounded border">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                            {coldList.importedClients.map((client, index) => (
                              <div key={index} className="bg-white p-2 rounded border flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate" title={client.name}>
                                    {client.name}
                                  </div>
                                  <div className="text-gray-500 truncate" title={client.phone}>
                                    {client.phone}
                                  </div>
                                </div>
                                <a
                                  href={`https://wa.me/55${client.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-green-600 hover:text-green-800 flex-shrink-0"
                                  title="Abrir WhatsApp"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                  </svg>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                          {coldList.importedClients.slice(0, 10).map((client, index) => (
                            <div key={index} className="flex justify-between py-1">
                              <span>{client.name}</span>
                              <span className="text-gray-500">{client.phone}</span>
                            </div>
                          ))}
                          {coldList.importedClients.length > 10 && (
                            <p className="text-gray-500 text-center py-1">
                              ... e mais {coldList.importedClients.length - 10} clientes
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
        {coldList.status === 'pending' && coldList.importedClients.length === 0 && (
          <button
            onClick={() => {
              setSelectedColdList(coldList);
              setShowImportModal(true);
            }}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Upload Excel
          </button>
        )}
                  {coldList.status === 'pending' && coldList.importedClients.length > 0 && (
                    <button
                      onClick={() => handleGenerateTasks(coldList._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Gerar Tarefas
                    </button>
                  )}
                  {coldList.status === 'completed' && coldList.importedClients.length > 0 && (
                    <button
                      onClick={() => handleRedistributeClients(coldList._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Redistribuir
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(coldList._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </>
      )}


      {/* Modal de Importação */}
      {showImportModal && selectedColdList && (
        <ColdListImportModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setSelectedColdList(null);
          }}
          coldListId={selectedColdList._id}
          coldListName={selectedColdList.name}
        />
      )}
    </div>
  );
}
