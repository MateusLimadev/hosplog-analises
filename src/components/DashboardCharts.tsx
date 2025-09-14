import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import type { ProcessedData } from '../utils/fileProcessor';
import { 
  BarChart3, TrendingUp, PieChart as PieChartIcon, Activity
} from 'lucide-react';

interface DashboardChartsProps {
  data: ProcessedData[];
}

// Cores profissionais para gráficos
const chartColors = {
  primary: ['#0ea5e9', '#1d4ed8', '#3b82f6', '#6366f1', '#8b5cf6'],
  success: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  neutral: ['#64748b', '#475569', '#334155', '#1e293b', '#0f172a']
};

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data }) => {
  const [selectedChartTypes, setSelectedChartTypes] = useState<Record<string, string>>({});

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-12 border border-slate-200">
          <BarChart3 className="w-20 h-20 text-slate-400 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-slate-900 mb-3">Nenhum gráfico disponível</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Os dados importados não possuem informações suficientes para gerar visualizações. 
            Certifique-se de que há dados numéricos no arquivo.
          </p>
        </div>
      </div>
    );
  }

  // Funções auxiliares para análise inteligente de dados
  const analyzeDataStructure = (chartData: ProcessedData) => {
    const { data: points, columns } = chartData;
    if (!points || !columns) return null;

    const numericColumns = columns.filter(col => 
      points.slice(0, 10).every(point => {
        const value = point[col];
        return value === undefined || value === '' || !isNaN(Number(value));
      })
    );

    const textColumns = columns.filter(col => !numericColumns.includes(col));
    const dateColumns = columns.filter(col => 
      points.slice(0, 10).some(point => {
        const value = point[col];
        return value && !isNaN(Date.parse(String(value)));
      })
    );

    return {
      numericColumns,
      textColumns,
      dateColumns,
      totalRows: points.length,
      sampleData: points.slice(0, 15)
    };
  };

  const getChartIcon = (type: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      bar: BarChart3,
      line: TrendingUp,
      pie: PieChartIcon,
      area: Activity
    };
    const IconComponent = iconMap[type] || Activity;
    return <IconComponent className="w-5 h-5" />;
  };

  const renderAdvancedChart = (chartData: ProcessedData, index: number) => {
    const { data: chartPoints, columns, title } = chartData;
    
    if (!chartPoints || chartPoints.length === 0 || !columns) return null;

    const analysis = analyzeDataStructure(chartData);
    if (!analysis) return null;

    const { numericColumns, textColumns, dateColumns, sampleData } = analysis;
    const colors = chartColors.primary;
    const chartKey = `chart-${index}`;
    const currentChartType = selectedChartTypes[chartKey] || 'auto';

    // Preparar dados para diferentes tipos de gráfico
    const prepareBarChartData = () => {
      if (textColumns.length === 0 || numericColumns.length === 0) return null;
      
      const categoryCol = textColumns[0];
      const dataMap = new Map();
      
      sampleData.forEach(point => {
        const category = String(point[categoryCol] || 'Outros');
        const existing = dataMap.get(category) || { [categoryCol]: category };
        
        numericColumns.forEach(col => {
          const value = Number(point[col]) || 0;
          existing[col] = (existing[col] || 0) + value;
        });
        
        dataMap.set(category, existing);
      });
      
      return Array.from(dataMap.values()).slice(0, 12);
    };

    const prepareLineChartData = () => {
      if (numericColumns.length === 0) return null;
      
      return sampleData.map((point, idx) => ({
        index: idx + 1,
        ...numericColumns.reduce((acc, col) => ({
          ...acc,
          [col]: Number(point[col]) || 0
        }), {})
      }));
    };

    const preparePieChartData = () => {
      if (numericColumns.length < 2) return null;
      
      return numericColumns.slice(0, 6).map((col, idx) => ({
        name: col.length > 15 ? col.substring(0, 12) + '...' : col,
        value: sampleData.reduce((sum, point) => sum + (Number(point[col]) || 0), 0),
        fill: colors[idx % colors.length]
      })).filter(item => item.value > 0);
    };

    const prepareAreaChartData = () => {
      if (numericColumns.length === 0) return null;
      
      return sampleData.slice(0, 20).map((point, idx) => {
        const result: Record<string, number> = { index: idx + 1 };
        let cumulative = 0;
        
        numericColumns.forEach(col => {
          const value = Number(point[col]) || 0;
          cumulative += value;
          result[col] = cumulative;
        });
        
        return result;
      });
    };

    // Dados preparados
    const barData = prepareBarChartData();
    const lineData = prepareLineChartData();
    const pieData = preparePieChartData();
    const areaData = prepareAreaChartData();

    // Determinar tipo de gráfico automaticamente se necessário
    let chartType = currentChartType;
    if (chartType === 'auto') {
      if (dateColumns.length > 0 && numericColumns.length > 0) chartType = 'line';
      else if (textColumns.length > 0 && numericColumns.length > 0) chartType = 'bar';
      else if (numericColumns.length >= 2) chartType = 'pie';
      else chartType = 'area';
    }

    // Função para trocar tipo de gráfico
    const switchChartType = (newType: string) => {
      setSelectedChartTypes(prev => ({
        ...prev,
        [chartKey]: newType
      }));
    };

    // Renderizar controles do gráfico
    const renderChartControls = () => (
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getChartIcon(chartType)}
            <div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500">
                {chartPoints.length} registros • {numericColumns.length} colunas numéricas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Botões para trocar tipo de gráfico */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              {[
                { 
                  type: 'bar', 
                  icon: BarChart3, 
                  available: !!barData,
                  title: 'Gráfico de Barras',
                  description: 'Ideal para comparar categorias e valores'
                },
                { 
                  type: 'line', 
                  icon: TrendingUp, 
                  available: !!lineData,
                  title: 'Gráfico de Linha',
                  description: 'Mostra tendências e evolução ao longo do tempo'
                },
                { 
                  type: 'pie', 
                  icon: PieChartIcon, 
                  available: !!pieData,
                  title: 'Gráfico de Pizza',
                  description: 'Visualiza proporções e distribuição percentual'
                },
                { 
                  type: 'area', 
                  icon: Activity, 
                  available: !!areaData,
                  title: 'Gráfico de Área',
                  description: 'Exibe acumulação e crescimento de valores'
                }
              ].map(({ type, icon: Icon, available, title: buttonTitle, description }) => (
                <div key={type} className="relative group">
                  <button
                    onClick={() => switchChartType(type)}
                    disabled={!available}
                    className={`p-2 rounded-md transition-all ${
                      chartType === type
                        ? 'bg-white shadow-sm text-blue-600'
                        : available
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                  {/* Tooltip explicativo */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{buttonTitle}</div>
                      <div className="text-slate-300 mt-1">{description}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Descrição do gráfico atual */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              {getChartIcon(chartType)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                {chartType === 'bar' && 'Gráfico de Barras'}
                {chartType === 'line' && 'Gráfico de Linha'}
                {chartType === 'pie' && 'Gráfico de Pizza'}
                {chartType === 'area' && 'Gráfico de Área'}
              </h4>
              <p className="text-sm text-blue-700">
                {chartType === 'bar' && 'Compara valores entre diferentes categorias. Ideal para ver qual categoria tem maior/menor valor e identificar padrões de distribuição.'}
                {chartType === 'line' && 'Mostra a evolução e tendências dos dados ao longo do tempo ou sequência. Perfeito para identificar crescimento, declínio ou padrões sazonais.'}
                {chartType === 'pie' && 'Visualiza a proporção de cada categoria em relação ao total. Útil para entender a participação percentual de cada elemento no conjunto.'}
                {chartType === 'area' && 'Demonstra o acúmulo progressivo de valores, ideal para ver crescimento cumulativo e contribuição de cada série ao total.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );

    // Renderizar gráfico baseado no tipo selecionado
    const renderChart = () => {
      const commonProps = {
        width: "100%",
        height: "100%"
      };

      switch (chartType) {
        case 'bar':
          if (!barData) return <div className="text-center text-slate-500 py-8">Dados insuficientes para gráfico de barras</div>;
          return (
            <ResponsiveContainer {...commonProps}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey={textColumns[0]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                {numericColumns.slice(0, 4).map((col, colIndex) => (
                  <Bar
                    key={col}
                    dataKey={col}
                    fill={colors[colIndex % colors.length]}
                    radius={[2, 2, 0, 0]}
                    name={col.length > 20 ? col.substring(0, 17) + '...' : col}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          );

        case 'line':
          if (!lineData) return <div className="text-center text-slate-500 py-8">Dados insuficientes para gráfico de linha</div>;
          return (
            <ResponsiveContainer {...commonProps}>
              <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="index"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Registros', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: '12px', fill: '#64748b' } }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                {numericColumns.slice(0, 4).map((col, colIndex) => (
                  <Line
                    key={col}
                    type="monotone"
                    dataKey={col}
                    stroke={colors[colIndex % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name={col.length > 20 ? col.substring(0, 17) + '...' : col}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          );

        case 'pie':
          if (!pieData) return <div className="text-center text-slate-500 py-8">Dados insuficientes para gráfico de pizza</div>;
          return (
            <ResponsiveContainer {...commonProps}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  dataKey="value"
                  label={(entry: { name?: string }) => entry.name || ''}
                >
                  {pieData.map((entry, entryIndex) => (
                    <Cell key={`cell-${entryIndex}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [value.toLocaleString(), 'Valor']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          );

        case 'area':
          if (!areaData) return <div className="text-center text-slate-500 py-8">Dados insuficientes para gráfico de área</div>;
          return (
            <ResponsiveContainer {...commonProps}>
              <AreaChart data={areaData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="index"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Registros', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: '12px', fill: '#64748b' } }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                {numericColumns.slice(0, 3).map((col, colIndex) => (
                  <Area
                    key={col}
                    type="monotone"
                    dataKey={col}
                    stackId="1"
                    stroke={colors[colIndex % colors.length]}
                    fill={colors[colIndex % colors.length]}
                    fillOpacity={0.6}
                    name={col.length > 20 ? col.substring(0, 17) + '...' : col}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          );

        default:
          return <div className="text-center text-slate-500 py-8">Tipo de gráfico não suportado</div>;
      }
    };

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow max-w-none">
        <div className="p-8">
          {renderChartControls()}
          <div className="h-[600px] bg-slate-50 rounded-lg p-6">
            {renderChart()}
          </div>
          
          {/* Informações adicionais */}
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Colunas: {columns.join(', ').substring(0, 60)}...</span>
              <span>{chartPoints.length} registros</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header da seção */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Visualizações Inteligentes</h2>
        <p className="text-slate-600 max-w-2xl mx-auto mb-8">
          Gráficos gerados automaticamente com análise inteligente dos seus dados. 
          Clique nos ícones para alternar entre diferentes tipos de visualização.
        </p>
        
        {/* Guia dos tipos de gráfico */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Guia dos Tipos de Gráfico</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">Barras</h4>
              <p className="text-xs text-slate-600">Compara valores entre categorias diferentes</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">Linha</h4>
              <p className="text-xs text-slate-600">Mostra tendências e evolução temporal</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <PieChartIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">Pizza</h4>
              <p className="text-xs text-slate-600">Visualiza proporções e percentuais</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">Área</h4>
              <p className="text-xs text-slate-600">Exibe acumulação e crescimento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de gráficos - largura aumentada */}
      <div className="space-y-8">
        {data.map((chartData, index) => renderAdvancedChart(chartData, index))}
      </div>

      
    </div>
  );
};

export default DashboardCharts;