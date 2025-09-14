import React from 'react';
import type { ProcessedData } from '../utils/fileProcessor';
import { TrendingUp, Users, FileText, BarChart3, Database, Layers } from 'lucide-react';

interface DashboardSummaryProps {
  data: ProcessedData[];
  metadata: {
    fileName: string;
    fileType: string;
    processedAt: Date;
    totalRecords: number;
  };
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ data, metadata }) => {
  const getSummaryIcon = (index: number) => {
    const icons = [TrendingUp, Users, FileText, BarChart3, Database, Layers];
    const Icon = icons[index % icons.length];
    return <Icon className="w-4 h-4 text-slate-600" />;
  };

  const formatValue = (value: unknown): string => {
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR');
    }
    return String(value);
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
          <Database className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum resumo disponível</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Os dados importados não possuem informações de resumo para exibir
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header melhorado */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-full mb-6">
          <FileText className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">{metadata.fileName}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-700 mb-6">Métricas principais dos seus dados de consumo</h1>
      </div>

      {/* Métricas principais com design igual à imagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mb-2">
            <p className="text-2xl font-bold text-slate-900">{formatValue(metadata.totalRecords)}</p>
            <p className="text-sm text-slate-600">Total de Produtos</p>
          </div>
          <p className="text-xs text-slate-500">Produtos únicos na planilha</p>
        </div>

        {/* Buscar dados do primeiro dataset para métricas específicas */}
        {data.length > 0 && (() => {
          const firstDataset = data[0];
          const numericColumns = firstDataset.columns?.filter(col => 
            firstDataset.data.every(row => 
              !row[col] || row[col] === '' || !isNaN(Number(row[col]))
            )
          ) || [];
          
          // Calcular soma total se houver coluna numérica
          let totalSum = 0;
          if (numericColumns.length > 0) {
            const firstNumericCol = numericColumns[0];
            totalSum = firstDataset.data.reduce((sum, row) => {
              const val = Number(row[firstNumericCol]) || 0;
              return sum + val;
            }, 0);
          }

          // Calcular média
          const avgValue = firstDataset.data.length > 0 ? totalSum / firstDataset.data.length : 0;

          // Encontrar produto mais consumido (primeira coluna categórica)
          const categoricalColumns = firstDataset.columns?.filter(col => !numericColumns.includes(col)) || [];
          let mostConsumed = 'N/A';
          if (categoricalColumns.length > 0) {
            const firstCatCol = categoricalColumns[0];
            const valueCounts: Record<string, number> = {};
            firstDataset.data.forEach(row => {
              const val = String(row[firstCatCol] || '');
              if (val !== '') {
                valueCounts[val] = (valueCounts[val] || 0) + 1;
              }
            });
            const mostFrequent = Object.entries(valueCounts)
              .sort(([,a], [,b]) => b - a)[0];
            if (mostFrequent) {
              mostConsumed = mostFrequent[0].length > 20 
                ? mostFrequent[0].substring(0, 20) + '...' 
                : mostFrequent[0];
            }
          }

          return (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold text-slate-900">{totalSum.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-sm text-slate-600">Consumo Mensal Total</p>
                </div>
                <p className="text-xs text-slate-500">Soma de todos os consumos mensais</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold text-slate-900">{avgValue.toFixed(0)}</p>
                  <p className="text-sm text-slate-600">Média Mensal por Produto</p>
                </div>
                <p className="text-xs text-slate-500">Consumo médio mensal por produto</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-lg font-bold text-slate-900 leading-tight">{mostConsumed}</p>
                  <p className="text-sm text-slate-600">Produto Mais Consumido</p>
                </div>
                <p className="text-xs text-slate-500">Produto com maior frequência</p>
              </div>
            </>
          );
        })()}
      </div>

      {/* Análise detalhada melhorada */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Análise Detalhada</h2>
          <div className="text-sm text-slate-500">
            {data.length} {data.length === 1 ? 'dataset' : 'datasets'} analisados
          </div>
        </div>
        
        <div className="space-y-6">
          {data.map((summaryItem, index) => (
            <div key={index} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Header do dataset */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{summaryItem.title}</h3>
                    <p className="text-sm text-slate-600">
                      {summaryItem.data.length} insights descobertos
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Grid de métricas */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summaryItem.data.map((item: Record<string, unknown>, itemIndex: number) => (
                    <div key={itemIndex} className="group relative">
                      <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-shadow flex-shrink-0 mt-1">
                            {getSummaryIcon(itemIndex)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 mb-1 leading-tight">
                              {String(item.metric || item.propriedade || 'Métrica')}
                            </p>
                            <p className="text-lg font-bold text-slate-900 leading-tight">
                              {formatValue(item.value || item.valor || '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé com informações do processamento */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Processamento Concluído</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatValue(metadata.totalRecords)}</p>
              <p className="text-sm text-slate-600 mt-1">Registros Processados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{data.length}</p>
              <p className="text-sm text-slate-600 mt-1">Análises Geradas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{metadata.fileType.toUpperCase()}</p>
              <p className="text-sm text-slate-600 mt-1">Formato do Arquivo</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Processado em {metadata.processedAt.toLocaleDateString('pt-BR')} às {metadata.processedAt.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;