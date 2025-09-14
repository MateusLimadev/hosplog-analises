import { useState } from 'react';
import FileUpload from './components/FileUpload';
import DashboardSummary from './components/DashboardSummary';
import DashboardCharts from './components/DashboardCharts';
import DashboardTables from './components/DashboardTables';
import { processFile } from './utils/fileProcessor';
import type { DashboardData } from './utils/fileProcessor';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'summary' | 'charts' | 'tables'>('upload');

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setDashboardData(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data = await processFile(file);
      setDashboardData(data);
      setActiveTab('summary');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDashboard = () => {
    setDashboardData(null);
    setError(null);
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simples - sem abas */}
      <header className="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FileText className="w-7 h-7 text-slate-900" />
              <h1 className="text-xl font-semibold text-slate-900">HospLog Analytics</h1>
            </div>
            {dashboardData && (
              <button 
                onClick={resetDashboard}
                className="btn-secondary"
              >
                Novo arquivo
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado inicial - Upload */}
        {(!dashboardData && !error) && (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              {!isLoading && (
                <>
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Analise seus dados
                  </h2>
                  <p className="text-lg text-slate-600 mb-8">
                    Importe arquivos Excel, CSV ou PDF para gerar análises e visualizações automáticas
                  </p>
                </>
              )}
              {isLoading && (
                <>
                  <div className="w-16 h-16 mx-auto mb-6 relative">
                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    Processando arquivo
                  </h2>
                  <p className="text-lg text-slate-600 mb-8">
                    Analisando dados e gerando insights automáticos...
                  </p>
                </>
              )}
              <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            </div>
          </div>
        )}

        {/* Estado de erro */}
        {error && (
          <div className="max-w-md mx-auto">
            <div className="card bg-error text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Erro no processamento</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={resetDashboard} className="btn-primary">
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {dashboardData && (
          <div className="space-y-6">
            {/* Indicador de sucesso */}
            <div className="card bg-success">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Arquivo processado: {dashboardData.metadata.fileName}
                  </p>
                  <p className="text-green-700 text-sm">
                    {dashboardData.metadata.totalRecords} registros analisados
                  </p>
                </div>
              </div>
            </div>

            {/* Abas de navegação com sublinhado */}
            <div className="border-b border-slate-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'summary'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Resumo
                </button>
                <button
                  onClick={() => setActiveTab('charts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'charts'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Gráficos
                </button>
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'tables'
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  Dados
                </button>
              </nav>
            </div>

            {/* Conteúdo das abas */}
            <div className="pt-6">
              {activeTab === 'summary' && (
                <DashboardSummary data={dashboardData.summary} metadata={dashboardData.metadata} />
              )}
              {activeTab === 'charts' && (
                <DashboardCharts data={dashboardData.charts} />
              )}
              {activeTab === 'tables' && (
                <DashboardTables data={dashboardData.tables} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
