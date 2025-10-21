'use client';

import { useState, useEffect } from 'react';
import { useColdListsStore } from '@/store/coldListsStore';
import { useAuthStore } from '@/store/authStore';

export default function DailyContactsManager() {
  const { 
    dailyContactData, 
    dailySummaryData, 
    isLoading, 
    fetchDailyContacts, 
    updateClientContact, 
    fetchDailySummary 
  } = useColdListsStore();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedColdListId, setSelectedColdListId] = useState<string | null>(null);
  const [syncingClients, setSyncingClients] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (selectedDate) {
      fetchDailySummary(selectedDate);
    }
  }, [selectedDate, fetchDailySummary]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    if (selectedColdListId) {
      fetchDailyContacts(selectedColdListId, date);
    }
  };

  const handleColdListSelect = (coldListId: string) => {
    setSelectedColdListId(coldListId);
    fetchDailyContacts(coldListId, selectedDate);
  };

  const handleContactToggle = (clientIndex: number, contacted: boolean) => {
    if (!selectedColdListId) return;
    
    // Adicionar cliente à lista de sincronização
    setSyncingClients(prev => new Set(prev).add(clientIndex));
    
    // Chamar a função sem await - a atualização é otimista
    updateClientContact(selectedColdListId, clientIndex, contacted).finally(() => {
      // Remover cliente da lista de sincronização após um delay
      setTimeout(() => {
        setSyncingClients(prev => {
          const newSet = new Set(prev);
          newSet.delete(clientIndex);
          return newSet;
        });
      }, 1000); // 1 segundo de delay para mostrar o indicador
    });
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    // Adiciona o código do país se não tiver
    return cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Contatos Diários</h2>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Resumo Geral */}
      {dailySummaryData && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            Resumo do Dia - {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {dailySummaryData.overallStats.totalClients}
              </div>
              <div className="text-sm text-blue-600">Total de Clientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dailySummaryData.overallStats.contactedClients}
              </div>
              <div className="text-sm text-blue-600">Contatados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">
                {dailySummaryData.overallStats.contactPercentage}%
              </div>
              <div className="text-sm text-blue-600">Taxa de Contato</div>
            </div>
          </div>
          
          {/* Barra de Progresso Geral */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-blue-600 mb-1">
              <span>Progresso Geral</span>
              <span>{dailySummaryData.overallStats.contactedClients}/{dailySummaryData.overallStats.totalClients}</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(dailySummaryData.overallStats.contactPercentage)}`}
                style={{ width: `${dailySummaryData.overallStats.contactPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Listas com Clientes do Dia */}
      {dailySummaryData && dailySummaryData.summary.length > 0 ? (
        <div className="space-y-4">
          {dailySummaryData.summary.map((listSummary) => (
            <div key={listSummary.coldListId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {listSummary.coldListName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vendedor: {listSummary.vendorName}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Progresso</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(listSummary.contactPercentage)}`}
                        style={{ width: `${listSummary.contactPercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {listSummary.contactPercentage}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {listSummary.contactedClients}/{listSummary.totalClients} contatados
                  </div>
                </div>
              </div>

              {/* Botão para ver detalhes */}
              <button
                onClick={() => handleColdListSelect(listSummary.coldListId)}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
              >
                Ver Lista de Clientes
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente para hoje</h3>
          <p className="mt-1 text-sm text-gray-500">
            Não há clientes atribuídos para contato na data selecionada.
          </p>
        </div>
      )}

      {/* Modal com Lista Detalhada de Clientes */}
      {selectedColdListId && dailyContactData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {dailyContactData.coldList.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedColdListId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Estatísticas da Lista */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {dailyContactData.stats.totalClients}
                    </div>
                    <div className="text-sm text-gray-600">Total de Clientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {dailyContactData.stats.contactedClients}
                    </div>
                    <div className="text-sm text-gray-600">Contatados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dailyContactData.stats.contactPercentage}%
                    </div>
                    <div className="text-sm text-gray-600">Taxa de Contato</div>
                  </div>
                </div>
                
                {/* Barra de Progresso */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{dailyContactData.stats.contactedClients}/{dailyContactData.stats.totalClients}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(dailyContactData.stats.contactPercentage)}`}
                      style={{ width: `${dailyContactData.stats.contactPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Lista de Clientes */}
              <div className="space-y-3">
                {dailyContactData.clients.map((client, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 transition-colors ${
                      client.contacted 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={client.contacted}
                              onChange={(e) => handleContactToggle(index, e.target.checked)}
                              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            {syncingClients.has(index) && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{client.name}</h4>
                            <p className="text-sm text-gray-600">{client.phone}</p>
                          </div>
                        </div>
                        {client.contacted && client.contactDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Contatado em: {new Date(client.contactDate).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <a
                        href={`https://wa.me/${formatPhoneForWhatsApp(client.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {dailyContactData.clients.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum cliente encontrado para esta data.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="text-gray-700">Carregando...</span>
          </div>
        </div>
      )}
    </div>
  );
}
