'use client';

import { useState, useEffect } from 'react';
import { useClientsStore } from '@/store/clientsStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useVendorsStore } from '@/store/vendorsStore';
import { Client } from '@/types';

interface ClientFormProps {
  onClose: () => void;
  client?: Client;
  isEditing?: boolean;
}

export default function ClientForm({ onClose, client, isEditing = false }: ClientFormProps) {
  const { createClient, updateClient } = useClientsStore();
  const { selectedProject } = useProjectsStore();
  const { vendors, fetchVendors } = useVendorsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    contract: client?.contract || '',
    adhesionDate: client?.adhesionDate ? client.adhesionDate.split('T')[0] : '',
    contractDate: client?.contractDate ? client.contractDate.split('T')[0] : '',
    dueDate: client?.dueDate ? client.dueDate.split('T')[0] : '',
    plan: client?.plan || '',
    observation: client?.observation || '',
    adhesionValue: client?.adhesionValue || 0,
    paymentMethod: client?.paymentMethod || '',
    confirmation: client?.confirmation || '',
    homeVisit: client?.homeVisit || false,
    origin: client?.origin || '',
    paid: client?.paid || false,
    vendor: client?.vendor ? (typeof client.vendor === 'string' ? client.vendor : client.vendor._id) : '',
    listMonth: client?.listMonth || new Date().toLocaleDateString('pt-BR', { month: 'long' }),
    listYear: client?.listYear || new Date().getFullYear()
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Apenas validações de formato, sem campos obrigatórios
    if (formData.adhesionValue && formData.adhesionValue < 0) {
      newErrors.adhesionValue = 'Valor da Adesão deve ser maior ou igual a zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!selectedProject) {
      setErrors({ project: 'Nenhum projeto selecionado' });
      return;
    }

    setIsSubmitting(true);
    try {
      const clientData = {
        ...formData,
        projectId: selectedProject._id,
        adhesionValue: parseFloat(formData.adhesionValue.toString()),
        vendor: formData.vendor || null
      };

      if (isEditing && client) {
        await updateClient(client._id, clientData);
      } else {
        await createClient(clientData);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nome completo"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Contrato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contrato
                </label>
                <input
                  type="text"
                  name="contract"
                  value={formData.contract}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.contract ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Número do contrato"
                />
                {errors.contract && <p className="text-red-500 text-xs mt-1">{errors.contract}</p>}
              </div>

              {/* Data da Adesão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data da Adesão
                </label>
                <input
                  type="date"
                  name="adhesionDate"
                  value={formData.adhesionDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.adhesionDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.adhesionDate && <p className="text-red-500 text-xs mt-1">{errors.adhesionDate}</p>}
              </div>

              {/* Data de Contrato */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Contrato
                </label>
                <input
                  type="date"
                  name="contractDate"
                  value={formData.contractDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.contractDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.contractDate && <p className="text-red-500 text-xs mt-1">{errors.contractDate}</p>}
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
              </div>

              {/* Plano */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plano
                </label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.plan ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione o plano...</option>
                  <option value="1GAVETA">1GAVETA</option>
                  <option value="2GAVETAS">2GAVETAS</option>
                  <option value="3GAVETAS">3GAVETAS</option>
                  <option value="TAXA ADM">TAXA ADM</option>
                  <option value="CASSEMS">CASSEMS</option>
                </select>
                {errors.plan && <p className="text-red-500 text-xs mt-1">{errors.plan}</p>}
              </div>

              {/* Valor da Adesão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Adesão
                </label>
                <input
                  type="number"
                  name="adhesionValue"
                  value={formData.adhesionValue}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.adhesionValue ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.adhesionValue && <p className="text-red-500 text-xs mt-1">{errors.adhesionValue}</p>}
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pagamento
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione...</option>
                  <option value="Cobrador">Cobrador</option>
                  <option value="PIX">PIX</option>
                  <option value="BOLETO">BOLETO</option>
                  <option value="DÉBITO">DÉBITO</option>
                  <option value="CRÉDITO">CRÉDITO</option>
                  <option value="DINHEIRO">DINHEIRO</option>
                  <option value="DESCONTO EM FOLHA">DESCONTO EM FOLHA</option>
                </select>
                {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
              </div>

              {/* Confirmação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmação
                </label>
                <input
                  type="text"
                  name="confirmation"
                  value={formData.confirmation}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.confirmation ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Código de confirmação"
                />
                {errors.confirmation && <p className="text-red-500 text-xs mt-1">{errors.confirmation}</p>}
              </div>

              {/* Origem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origem
                </label>
                <select
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.origin ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione a origem...</option>
                  <option value="INDICAÇÃO CLIENTE">INDICAÇÃO CLIENTE</option>
                  <option value="INDICAÇÃO PARCEIRO">INDICAÇÃO PARCEIRO</option>
                  <option value="ANUNCIO">ANUNCIO</option>
                  <option value="LIGAÇÃO">LIGAÇÃO</option>
                  <option value="LISTA FRIA">LISTA FRIA</option>
                  <option value="EVENTO EXTERNO">EVENTO EXTERNO</option>
                  <option value="PRESENCIAL">PRESENCIAL</option>
                  <option value="REATIVAÇÃO">REATIVAÇÃO</option>
                </select>
                {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin}</p>}
              </div>

              {/* Vendedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendedor
                </label>
                <select
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione um vendedor...</option>
                  {vendors.filter(vendor => vendor.active).map(vendor => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lista Mensal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lista Mensal
                </label>
                <select
                  name="listMonth"
                  value={formData.listMonth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
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

              {/* Ano */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano
                </label>
                <input
                  type="number"
                  name="listYear"
                  value={formData.listYear}
                  onChange={handleInputChange}
                  min="2020"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observação
              </label>
              <textarea
                name="observation"
                value={formData.observation}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Observações adicionais..."
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="homeVisit"
                  checked={formData.homeVisit}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Visita à Casa</span>
              </label>
            </div>

            {/* Pago */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="paid"
                  checked={formData.paid}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Pago</span>
              </label>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Cliente')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
