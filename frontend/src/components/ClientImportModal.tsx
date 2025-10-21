'use client';

import { useState, useRef } from 'react';
import { useProjectsStore } from '@/store/projectsStore';
import { useClientsStore } from '@/store/clientsStore';
import api from '@/lib/api';
import * as XLSX from 'xlsx';

interface ClientImportModalProps {
  onClose: () => void;
}

interface ImportResult {
  success: boolean;
  data: any[];
  errors: any[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  error?: string;
}

export default function ClientImportModal({ onClose }: ClientImportModalProps) {
  const { selectedProject } = useProjectsStore();
  const { fetchClients } = useClientsStore();
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mapeamento padrão dos campos
  const defaultFieldLabels: Record<string, string> = {
    name: 'Nome',
    phone: 'Telefone',
    contract: 'Contrato',
    adhesionDate: 'Data da Adesão',
    contractDate: 'Data de Contrato',
    dueDate: 'Data de Vencimento',
    plan: 'Plano',
    observation: 'Observação',
    adhesionValue: 'Valor da Adesão',
    paymentMethod: 'Forma de Pagamento',
    confirmation: 'Confirmação',
    homeVisit: 'Visita à Casa',
    origin: 'Origem',
    vendor: 'Vendedor',
    listMonth: 'Lista Mensal',
    listYear: 'Ano da Lista',
    paid: 'Pago'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      const allowedExtensions = ['.csv', '.xls', '.xlsx'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(selectedFile.type) || allowedExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        setError('');
        setStep('mapping');
        // Detectar colunas do arquivo
        detectColumns(selectedFile);
      } else {
        setError('Apenas arquivos CSV e Excel são permitidos');
      }
    }
  };

  const detectColumns = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let columns: string[] = [];
        
        if (file.name.toLowerCase().endsWith('.csv')) {
          // Processar CSV
          const text = data as string;
          const lines = text.split('\n');
          if (lines.length > 0) {
            columns = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
          }
        } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
          // Processar Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length > 0) {
            columns = (jsonData[0] as string[]).filter(col => col && col.toString().trim() !== '');
          }
        }
        
        setAvailableColumns(columns);
      } catch (error) {
        console.error('Erro ao detectar colunas:', error);
        // Fallback para colunas comuns
        const commonColumns = [
          'Nome', 'nome', 'NOME', 'Cliente', 'cliente',
          'Telefone', 'telefone', 'TELEFONE', 'Fone', 'fone',
          'Contrato', 'contrato', 'CONTRATO', 'Número', 'numero',
          'Data Adesão', 'data_adesao', 'DataAdesao', 'Adesão',
          'Data Contrato', 'data_contrato', 'DataContrato',
          'Data Vencimento', 'data_vencimento', 'DataVencimento', 'Vencimento',
          'Plano', 'plano', 'PLANO', 'Tipo', 'tipo',
          'Valor', 'valor', 'VALOR', 'Preço', 'preco',
          'Pagamento', 'pagamento', 'PAGAMENTO', 'Forma Pagamento',
          'Confirmação', 'confirmacao', 'CONFIRMACAO',
          'Origem', 'origem', 'ORIGEM', 'Como Conheceu',
          'Vendedor', 'vendedor', 'VENDEDOR', 'Responsável'
        ];
        setAvailableColumns(commonColumns);
      }
    };
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleMappingChange = (field: string, column: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: column
    }));
  };

  const handlePreview = async () => {
    if (!file || !selectedProject) return;

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('columnMapping', JSON.stringify(columnMapping));

      const response = await api.post('/clients/import/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResult(response.data);
      setStep('preview');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !selectedProject || !importResult) return;

    setIsLoading(true);
    setStep('importing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('columnMapping', JSON.stringify(columnMapping));
      formData.append('projectId', selectedProject._id);

      const response = await api.post('/clients/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Atualizar lista de clientes
      await fetchClients(selectedProject._id);
      
      // Mostrar resultado detalhado
      const { summary, invalidClients } = response.data;
      let message = `${summary.imported} clientes importados com sucesso!`;
      
      if (summary.skipped > 0) {
        message += `\n\n${summary.skipped} clientes foram ignorados por não terem nome ou telefone.`;
      }
      
      if (summary.errors > 0) {
        message += `\n\n${summary.errors} linhas tiveram erros de validação.`;
      }
      
      alert(message);
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao importar clientes');
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setColumnMapping({});
    setAvailableColumns([]);
    setImportResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Importar Clientes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Selecione um arquivo CSV ou Excel com os dados dos clientes
        </p>
      </div>

      <div className="mt-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
      </div>

      <div className="text-xs text-gray-500">
        <p><strong>Formatos suportados:</strong> CSV, XLS, XLSX</p>
        <p><strong>Tamanho máximo:</strong> 10MB</p>
        <p><strong>Primeira linha deve conter os cabeçalhos das colunas</strong></p>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Mapear Colunas</h3>
        <p className="text-sm text-gray-500">
          Selecione qual coluna do arquivo corresponde a cada campo do sistema
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {Object.entries(defaultFieldLabels).map(([field, label]) => (
          <div key={field} className="flex items-center space-x-3">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
            </div>
            <div className="w-2/3">
              <select
                value={columnMapping[field] || ''}
                onChange={(e) => handleMappingChange(field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione a coluna...</option>
                {availableColumns.map(column => (
                  <option key={column} value={column}>{column}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={resetModal}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={handlePreview}
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Processando...' : 'Visualizar'}
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Preview da Importação</h3>
        <p className="text-sm text-gray-500">
          Revise os dados antes de importar
        </p>
      </div>

      {importResult && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total de linhas:</span> {importResult.totalRows}
            </div>
            <div>
              <span className="font-medium">Válidas:</span> {importResult.validRows}
            </div>
            <div>
              <span className="font-medium">Inválidas:</span> {importResult.invalidRows}
            </div>
            <div>
              <span className="font-medium">Taxa de sucesso:</span> {importResult.totalRows > 0 ? Math.round((importResult.validRows / importResult.totalRows) * 100) : 0}%
            </div>
          </div>
        </div>
      )}

      {importResult?.errors && importResult.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Erros encontrados:</h4>
          <div className="max-h-32 overflow-y-auto text-sm text-red-700">
            {importResult.errors.slice(0, 10).map((error: any, index: number) => (
              <div key={index} className="mb-1">
                <strong>Linha {error.row}:</strong> {error.errors.join(', ')}
              </div>
            ))}
            {importResult.errors.length > 10 && (
              <div className="text-red-600">... e mais {importResult.errors.length - 10} erros</div>
            )}
          </div>
        </div>
      )}

      {importResult?.data && importResult.data.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Dados válidos (primeiros 3 registros):</h4>
          <div className="text-sm text-green-700">
            {importResult.data.slice(0, 3).map((client: any, index: number) => (
              <div key={index} className="mb-2 p-2 bg-white rounded border">
                <strong>{client.name}</strong> - {client.phone} - {client.plan}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => setStep('mapping')}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={handleImport}
          disabled={isLoading || (importResult?.validRows || 0) === 0}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Importando...' : 'Importar Clientes'}
        </button>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <h3 className="text-lg font-medium text-gray-900">Importando Clientes</h3>
      <p className="text-sm text-gray-500">
        Por favor, aguarde enquanto processamos os dados...
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Importar Clientes</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {step === 'upload' && renderUploadStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
        </div>
      </div>
    </div>
  );
}
