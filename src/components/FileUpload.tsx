import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, File, X, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }

      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const onDropRejected = useCallback(() => {
    setError('Formato de arquivo não suportado. Use Excel (.xlsx, .xls), CSV ou PDF.');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isLoading
  });

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-slate-600" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <File className="w-6 h-6 text-slate-600" />;
      default:
        return <File className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!uploadedFile ? (
        <div>
          <div
            {...getRootProps()}
            className={`upload-zone ${isDragActive ? 'dragover' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              {isLoading ? (
                <div className="relative mx-auto mb-6 w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-2 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
              ) : (
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              )}
              
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {isLoading ? 'Processando arquivo...' : 
                 isDragActive ? 'Solte o arquivo aqui' : 'Faça upload do seu arquivo'}
              </h3>
              
              {!isLoading && (
                <>
                  <p className="text-slate-600 mb-4">
                    Arraste e solte ou clique para selecionar
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center text-xs text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded">Excel (.xlsx, .xls)</span>
                    <span className="px-2 py-1 bg-slate-100 rounded">CSV</span>
                    <span className="px-2 py-1 bg-slate-100 rounded">PDF</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-2">Máximo: 10MB</p>
                </>
              )}
              
              {isLoading && (
                <p className="text-blue-600 mb-4">
                  Analisando estrutura de dados...
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-error rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getFileIcon(uploadedFile.name)}
              <div>
                <p className="font-medium text-slate-900">{uploadedFile.name}</p>
                <p className="text-sm text-slate-600">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isLoading && (
              <button
                onClick={removeFile}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {isLoading && (
            <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-4">
                {/* Spinner moderno */}
                <div className="relative">
                  <div className="w-10 h-10 border-4 border-blue-200 rounded-full animate-spin"></div>
                  <div className="absolute top-0 left-0 w-10 h-10 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 mb-1">Processando arquivo...</p>
                  <p className="text-sm text-blue-700">Analisando estrutura de dados e gerando insights</p>
                  
                  {/* Barra de progresso simulada */}
                  <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
                
                {/* Ícone de status */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
              
              {/* Etapas do processamento */}
              <div className="mt-4 flex justify-between text-xs text-blue-600">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Lendo arquivo</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Analisando dados</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span>Gerando dashboard</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;