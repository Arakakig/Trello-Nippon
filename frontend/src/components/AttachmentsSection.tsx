'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTasksStore } from '@/store/tasksStore';
import { Task } from '@/types';
import toast from 'react-hot-toast';

interface AttachmentsSectionProps {
  task: Task;
}

export default function AttachmentsSection({ task }: AttachmentsSectionProps) {
  const { uploadAttachment, deleteAttachment } = useTasksStore();
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Apenas imagens e PDFs são aceitos.');
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setUploading(true);
    try {
      await uploadAttachment(task._id, file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Tem certeza que deseja remover este anexo?')) return;
    try {
      await deleteAttachment(task._id, attachmentId);
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
    }
  };

  const handlePreview = (attachment: any) => {
    const apiUrl = 'https://trello-nippon.onrender.com/api';
    const fileUrl = `${apiUrl.replace('/api', '')}/${attachment.path}`;
    
    if (attachment.mimetype.startsWith('image/')) {
      setPreviewFile(fileUrl);
    } else if (attachment.mimetype === 'application/pdf') {
      window.open(fileUrl, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Anexos</h3>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        {uploading ? (
          <p className="text-gray-600">Enviando arquivo...</p>
        ) : isDragActive ? (
          <p className="text-primary-600">Solte o arquivo aqui...</p>
        ) : (
          <div>
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Arraste e solte um arquivo aqui, ou clique para selecionar
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Imagens (JPEG, PNG, GIF, WebP) ou PDFs até 10MB
            </p>
          </div>
        )}
      </div>

      {/* List of attachments */}
      {task.attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          {task.attachments.map((attachment) => (
            <div
              key={attachment._id}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {attachment.mimetype.startsWith('image/') ? (
                  <svg className="w-8 h-8 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.size)} • {attachment.uploadedBy.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={() => handlePreview(attachment)}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Ver
                </button>
                <button
                  onClick={() => handleDeleteAttachment(attachment._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={previewFile}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

