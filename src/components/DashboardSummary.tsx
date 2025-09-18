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
  tablesData?: ProcessedData[];
}

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ data, metadata, tablesData }) => {
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
        {/* Buscar dados do primeiro dataset para métricas específicas */}
        {data.length > 0 && (() => {
          // Usar dados das tabelas se disponível, senão usar dados do summary
          const datasetToAnalyze = (tablesData && tablesData.length > 0) ? tablesData[0] : data[0];
          
          // Verificar se temos dados válidos para análise
          if (!datasetToAnalyze.data || !Array.isArray(datasetToAnalyze.data) || datasetToAnalyze.data.length === 0) {
            return (
              <div className="col-span-full text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">Não foi possível calcular métricas: dados insuficientes</p>
                <p className="text-yellow-600 text-sm mt-2">
                  Dataset: {datasetToAnalyze.type} | 
                  Linhas: {datasetToAnalyze.data?.length || 0} | 
                  Colunas: {datasetToAnalyze.columns?.length || 0}
                </p>
                <p className="text-yellow-600 text-sm">
                  Fonte: {tablesData && tablesData.length > 0 ? 'tablesData' : 'summaryData'}
                </p>
              </div>
            );
          }
          
          // Melhorar identificação de colunas
          const numericColumns = datasetToAnalyze.columns?.filter(col => {
            const numericValues = datasetToAnalyze.data.filter(row => {
              const val = row[col];
              const numVal = Number(val);
              return val !== null && val !== undefined && val !== '' && !isNaN(numVal) && numVal !== 0;
            });
            return numericValues.length > Math.max(1, datasetToAnalyze.data.length * 0.1); // Pelo menos 10% ou 1 valor
          }) || [];
          
          const categoricalColumns = datasetToAnalyze.columns?.filter(col => !numericColumns.includes(col)) || [];
          
          // Identificar coluna de consumo (geralmente a primeira numérica ou que contenha palavras-chave)
          const consumptionColumn = numericColumns.find(col => 
            col.toLowerCase().includes('consumo') || 
            col.toLowerCase().includes('quantidade') ||
            col.toLowerCase().includes('total') ||
            col.toLowerCase().includes('valor')
          ) || numericColumns[0];
          
          // Identificar coluna de produto (geralmente a primeira categórica)
          const productColumn = categoricalColumns.find(col =>
            col.toLowerCase().includes('produto') ||
            col.toLowerCase().includes('item') ||
            col.toLowerCase().includes('medicamento') ||
            col.toLowerCase().includes('material')
          ) || categoricalColumns[0];
          
          // Calcular Total de Produtos Únicos
          let totalProducts = 0;
          if (productColumn) {
            const uniqueProducts = new Set(
              datasetToAnalyze.data
                .map(row => String(row[productColumn] || ''))
                .filter(val => val !== '' && val !== 'undefined' && val !== 'null')
            );
            totalProducts = uniqueProducts.size;
          }
          
          // Calcular Consumo Mensal Total
          let totalConsumption = 0;
          if (consumptionColumn) {
            totalConsumption = datasetToAnalyze.data.reduce((sum, row) => {
              const val = Number(row[consumptionColumn]) || 0;
              return sum + val;
            }, 0);
          }
          
          // Calcular Média Mensal por Produto
          let avgConsumption = 0;
          if (totalProducts > 0 && totalConsumption > 0) {
            avgConsumption = totalConsumption / totalProducts;
          }
          
          // Encontrar Produto Mais Consumido
          let mostConsumedProduct = 'N/A';
          if (productColumn && consumptionColumn) {
            const productConsumption: Record<string, number> = {};
            
            datasetToAnalyze.data.forEach(row => {
              const product = String(row[productColumn] || '');
              const consumption = Number(row[consumptionColumn]) || 0;
              
              if (product !== '' && product !== 'undefined' && product !== 'null') {
                productConsumption[product] = (productConsumption[product] || 0) + consumption;
              }
            });
            
            const sortedProducts = Object.entries(productConsumption)
              .sort(([,a], [,b]) => b - a);
            
            if (sortedProducts.length > 0) {
              const topProduct = sortedProducts[0][0];
              mostConsumedProduct = topProduct.length > 25 
                ? topProduct.substring(0, 22) + '...' 
                : topProduct;
            }
          }

          return (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
                  <p className="text-sm text-slate-600">Total de Produtos</p>
                </div>
                <p className="text-xs text-slate-500">
                  {productColumn ? `Produtos únicos em ${productColumn}` : 'Produtos únicos na planilha'}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold text-slate-900">{totalConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-slate-600">Consumo Mensal Total</p>
                </div>
                <p className="text-xs text-slate-500">
                  {consumptionColumn ? `Soma de ${consumptionColumn}` : 'Soma de todos os consumos mensais'}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold text-slate-900">{avgConsumption.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-slate-600">Média Mensal por Produto</p>
                </div>
                <p className="text-xs text-slate-500">Consumo médio entre {totalProducts} produtos</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-lg font-bold text-slate-900 leading-tight">{mostConsumedProduct}</p>
                  <p className="text-sm text-slate-600">Produto Mais Consumido</p>
                </div>
                <p className="text-xs text-slate-500">Maior consumo total no período</p>
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