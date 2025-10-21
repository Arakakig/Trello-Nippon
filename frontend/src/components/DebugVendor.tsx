'use client';

import { useState } from 'react';
import { useVendorsStore } from '@/store/vendorsStore';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

export default function DebugVendor() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { linkVendorsToUsers } = useVendorsStore();

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cold-lists/debug/user-vendor');
      setDebugData(response.data);
    } catch (error) {
      console.error('Erro ao buscar debug:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkVendors = async () => {
    try {
      const result = await linkVendorsToUsers();
      toast.success(result.message);
      // Recarregar dados de debug
      await fetchDebugData();
    } catch (error) {
      toast.error('Erro ao vincular vendedores');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Debug - Vendedor</h2>
      
      <div className="flex space-x-3">
        <button
          onClick={fetchDebugData}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Verificar Status do Vendedor'}
        </button>
        
        <button
          onClick={handleLinkVendors}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          Vincular Vendedores aos Usuários
        </button>
      </div>

      {debugData && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Informações do Usuário</h3>
            <p><strong>ID:</strong> {debugData.userId}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Vendedores Vinculados</h3>
            {debugData.userVendors.length > 0 ? (
              <div className="space-y-2">
                {debugData.userVendors.map((vendor: any) => (
                  <div key={vendor.id} className="bg-white p-3 rounded border">
                    <p><strong>Nome:</strong> {vendor.name}</p>
                    <p><strong>Email:</strong> {vendor.email}</p>
                    <p><strong>ID:</strong> {vendor.id}</p>
                    <p><strong>User ID:</strong> {vendor.user}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600">Nenhum vendedor vinculado ao seu usuário!</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Listas Atribuídas</h3>
            {debugData.assignedLists.length > 0 ? (
              <div className="space-y-2">
                {debugData.assignedLists.map((list: any) => (
                  <div key={list.id} className="bg-white p-3 rounded border">
                    <p><strong>Nome:</strong> {list.name}</p>
                    <p><strong>Status:</strong> {list.status}</p>
                    <p><strong>Vendedores Selecionados:</strong></p>
                    <ul className="ml-4">
                      {list.selectedVendors.map((vendor: any) => (
                        <li key={vendor.id} className="text-sm">
                          {vendor.name} (ID: {vendor.id}, User: {vendor.user || 'Não vinculado'})
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-600">Nenhuma lista atribuída!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
