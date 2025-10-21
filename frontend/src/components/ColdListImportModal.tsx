'use client';

import { useState } from 'react';
import { useColdListsStore } from '@/store/coldListsStore';

interface ColdListImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  coldListId: string;
  coldListName: string;
}

interface PreviewData {
  success: boolean;
  totalRows: number;
  columns: string[];
  preview: any[];
  errors: string[];
}

export default function ColdListImportModal({ isOpen, onClose, coldListId, coldListName }: ColdListImportModalProps) {
  const { previewColdListFile, importColdListFile, fetchColdLists } = useColdListsStore();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    name: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing'>('upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handlePreview = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const data = await previewColdListFile(coldListId, file);
      setPreviewData(data);
      setStep('mapping');
    } catch (error) {
      console.error('Erro ao fazer preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!previewData || !file) return;

    setIsLoading(true);
    setStep('importing');
    try {
      // Enviar arquivo com mapeamento de colunas
      await importColdListFile(coldListId, columnMapping, file);
      await fetchColdLists();
      onClose();
      resetModal();
    } catch (error) {
      console.error('Erro ao importar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setPreviewData(null);
    setColumnMapping({ name: '', phone: '' });
    setStep('upload');
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Importar Planilha - {coldListName}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {step === 'upload' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arquivo Excel (XLS/XLSX)
                </label>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A planilha deve conter as colunas: Nome e Telefone
                </p>
              </div>

              {file && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Arquivo selecionado:</strong> {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handlePreview}
                  disabled={!file || isLoading}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Processando...' : 'Fazer Preview'}
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {step === 'mapping' && previewData && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Preview da Planilha</h3>
                <p className="text-sm text-blue-700">
                  Total de linhas: {previewData.totalRows} | Colunas encontradas: {previewData.columns.length}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  📊 {previewData.totalRows} registros serão processados na importação
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mapear Colunas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Cliente *
                    </label>
                    <select
                      value={columnMapping.name}
                      onChange={(e) => setColumnMapping(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Selecione a coluna</option>
                      {previewData.columns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <select
                      value={columnMapping.phone}
                      onChange={(e) => setColumnMapping(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Selecione a coluna</option>
                      {previewData.columns.map((column) => (
                        <option key={column} value={column}>
                          {column}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preview dos Dados</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Telefone
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.preview.map((row, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {columnMapping.name ? row[columnMapping.name] || '-' : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {columnMapping.phone ? row[columnMapping.phone] || '-' : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleImport}
                  disabled={!columnMapping.name || !columnMapping.phone || isLoading}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Importando...' : 'Importar Clientes'}
                </button>
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Importando clientes...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
