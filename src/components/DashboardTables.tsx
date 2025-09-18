import React, { useState } from 'react';
import type { ProcessedData } from '../utils/fileProcessor';
import { ChevronLeft, ChevronRight, Search, Download, Table } from 'lucide-react';

interface DashboardTablesProps {
  data: ProcessedData[];
}

const DashboardTables: React.FC<DashboardTablesProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState<{ [key: number]: number }>({});
  const [searchTerms, setSearchTerms] = useState<{ [key: number]: string }>({});
  const [exportingStates, setExportingStates] = useState<{ [key: number]: boolean }>({});
  const itemsPerPage = 10;

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Table className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma tabela disponível</h3>
        <p className="text-slate-600">Os dados importados não possuem informações tabulares</p>
      </div>
    );
  }

  const handlePageChange = (tableIndex: number, newPage: number) => {
    setCurrentPage(prev => ({ ...prev, [tableIndex]: newPage }));
  };

  const handleSearch = (tableIndex: number, term: string) => {
    setSearchTerms(prev => ({ ...prev, [tableIndex]: term }));
    setCurrentPage(prev => ({ ...prev, [tableIndex]: 1 }));
  };

  const filterData = (tableData: Record<string, unknown>[], searchTerm: string, columns: string[]) => {
    if (!searchTerm) return tableData;
    
    return tableData.filter(row =>
      columns.some(col =>
        String(row[col] || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const exportToCSV = async (tableData: Record<string, unknown>[], columns: string[], title: string, tableIndex: number) => {
    setExportingStates(prev => ({ ...prev, [tableIndex]: true }));
    
    try {
      // Simular um pequeno delay para mostrar o feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Função para escapar valores CSV adequadamente
      const escapeCSVValue = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        
        const stringValue = String(value);
        
        // Se contém vírgula, aspas duplas ou quebra de linha, precisa ser escapado
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          // Duplicar aspas duplas internas e envolver com aspas duplas
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      };
      
      // Criar cabeçalho com encoding adequado
      const headers = columns.map(col => escapeCSVValue(col)).join(',');
      
      // Criar linhas de dados
      const rows = tableData.map(row =>
        columns.map(col => escapeCSVValue(row[col])).join(',')
      );
      
      // Combinar cabeçalho e dados
      const csvContent = [headers, ...rows].join('\n');
      
      // Adicionar BOM (Byte Order Mark) para suporte UTF-8 no Excel
      const bom = '\uFEFF';
      const csvWithBom = bom + csvContent;
      
      // Criar blob com encoding UTF-8
      const blob = new Blob([csvWithBom], { 
        type: 'text/csv;charset=utf-8' 
      });
      
      // Gerar nome de arquivo limpo
      const cleanTitle = title.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${cleanTitle}_${timestamp}.csv`;
      
      // Download do arquivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('Erro ao exportar arquivo. Tente novamente.');
    } finally {
      setExportingStates(prev => ({ ...prev, [tableIndex]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {data.map((table, tableIndex) => {
        const currentPageNum = currentPage[tableIndex] || 1;
        const searchTerm = searchTerms[tableIndex] || '';
        const { data: tableData, columns = [], title } = table;
        
        if (!tableData || tableData.length === 0 || columns.length === 0) {
          return null;
        }

        const filteredData = filterData(tableData, searchTerm, columns);
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        const startIndex = (currentPageNum - 1) * itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

        return (
          <div key={tableIndex} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {/* Cabeçalho da tabela simplificado */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">
                  {filteredData.length} registros
                </p>
              </div>
              
              <button
                onClick={() => exportToCSV(filteredData, columns, title, tableIndex)}
                disabled={exportingStates[tableIndex]}
                className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                  exportingStates[tableIndex]
                    ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {exportingStates[tableIndex] ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Exportando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </div>
                )}
              </button>
            </div>

            {/* Busca simplificada */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(tableIndex, e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {columns.map((column: string, colIndex: number) => (
                      <th
                        key={colIndex}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-50">
                      {columns.map((column: string, colIndex: number) => (
                        <td
                          key={colIndex}
                          className="px-4 py-3 text-sm text-slate-900"
                        >
                          {String(row[column] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação simplificada */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200">
                <span className="text-sm text-slate-600">
                  Página {currentPageNum} de {totalPages}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(tableIndex, currentPageNum - 1)}
                    disabled={currentPageNum === 1}
                    className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(tableIndex, currentPageNum + 1)}
                    disabled={currentPageNum === totalPages}
                    className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardTables;