import * as XLSX from 'xlsx';

export interface ProcessedData {
  type: 'table' | 'chart' | 'summary';
  title: string;
  data: Record<string, unknown>[];
  columns?: string[];
  metadata?: {
    totalRows: number;
    totalColumns: number;
    fileType: string;
    fileName: string;
  };
}

export interface DashboardData {
  summary: ProcessedData[];
  charts: ProcessedData[];
  tables: ProcessedData[];
  metadata: {
    fileName: string;
    fileType: string;
    processedAt: Date;
    totalRecords: number;
  };
}

// Função para analisar dados e extrair insights
const analyzeData = (data: Record<string, unknown>[], columns: string[]) => {
  const insights: Array<{ metric: string; value: string | number }> = [];
  
  // Análise básica
  insights.push({ metric: 'Total de Registros', value: data.length });
  insights.push({ metric: 'Total de Campos', value: columns.length });
  
  // Análise de completude dos dados
  const completenessAnalysis = columns.map(col => {
    const filledValues = data.filter(row => 
      row[col] !== null && 
      row[col] !== undefined && 
      row[col] !== ''
    ).length;
    return {
      column: col,
      completeness: (filledValues / data.length) * 100
    };
  });
  
  const avgCompleteness = completenessAnalysis.reduce((sum, col) => sum + col.completeness, 0) / columns.length;
  insights.push({ 
    metric: 'Completude dos Dados', 
    value: `${avgCompleteness.toFixed(1)}%` 
  });
  
  // Identificar colunas numéricas e fazer análises estatísticas
  const numericColumns = columns.filter(col => {
    const numericValues = data
      .map(row => Number(row[col]))
      .filter(val => !isNaN(val) && val !== 0);
    return numericValues.length > data.length * 0.5; // Pelo menos 50% são números válidos
  });
  
  if (numericColumns.length > 0) {
    insights.push({ metric: 'Campos Numéricos', value: numericColumns.length });
    
    // Análise do primeiro campo numérico
    const firstNumericCol = numericColumns[0];
    const numericValues = data
      .map(row => Number(row[firstNumericCol]))
      .filter(val => !isNaN(val));
    
    if (numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const avg = sum / numericValues.length;
      const max = Math.max(...numericValues);
      const min = Math.min(...numericValues);
      
      insights.push({ 
        metric: `${firstNumericCol} (Média)`, 
        value: avg.toFixed(2) 
      });
      insights.push({ 
        metric: `${firstNumericCol} (Máximo)`, 
        value: max.toLocaleString('pt-BR') 
      });
      insights.push({ 
        metric: `${firstNumericCol} (Mínimo)`, 
        value: min.toLocaleString('pt-BR') 
      });
    }
  }
  
  // Análise de campos categóricos
  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));
  if (categoricalColumns.length > 0) {
    const firstCatCol = categoricalColumns[0];
    const uniqueValues = new Set(data.map(row => String(row[firstCatCol])).filter(val => val !== ''));
    insights.push({ 
      metric: `${firstCatCol} (Valores Únicos)`, 
      value: uniqueValues.size 
    });
    
    // Valor mais frequente
    const valueCounts: Record<string, number> = {};
    data.forEach(row => {
      const val = String(row[firstCatCol] || '');
      if (val !== '') {
        valueCounts[val] = (valueCounts[val] || 0) + 1;
      }
    });
    
    const mostFrequent = Object.entries(valueCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostFrequent) {
      insights.push({ 
        metric: `${firstCatCol} (Mais Frequente)`, 
        value: `${mostFrequent[0]} (${mostFrequent[1]}x)` 
      });
    }
  }
  
  // Detecção de padrões temporais
  const dateColumns = columns.filter(col => {
    return data.some(row => {
      const val = String(row[col] || '');
      return /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{1,2}-\d{1,2}/.test(val);
    });
  });
  
  if (dateColumns.length > 0) {
    insights.push({ 
      metric: 'Campos de Data Detectados', 
      value: dateColumns.length 
    });
  }
  
  return insights;
};
export const processExcelFile = async (file: File, selectedColumns?: string[]): Promise<DashboardData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const summary: ProcessedData[] = [];
        const charts: ProcessedData[] = [];
        const tables: ProcessedData[] = [];
        
        let totalRecords = 0;
        
        // Processar cada planilha
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
          
          if (jsonData.length === 0) return;
          
          const allHeaders = (jsonData[0] as unknown[]).map(h => String(h || ''));
          const rows = jsonData.slice(1) as unknown[][];
          
          // Filtrar colunas se selectedColumns foi fornecido
          let headers = allHeaders;
          let filteredRows = rows;
          
          if (selectedColumns && selectedColumns.length > 0) {
            const columnIndexes = selectedColumns
              .map(col => allHeaders.indexOf(col))
              .filter(index => index !== -1);
            
            headers = columnIndexes.map(index => allHeaders[index]);
            filteredRows = rows.map(row => 
              columnIndexes.map(index => row[index])
            );
          }
          
          totalRecords += filteredRows.length;
          
          // Criar dados da tabela
          const tableData: ProcessedData = {
            type: 'table',
            title: `Planilha: ${sheetName}`,
            data: filteredRows.map(row => {
              const obj: Record<string, unknown> = {};
              headers.forEach((header, i) => {
                obj[header || `Coluna ${i + 1}`] = row[i] || '';
              });
              return obj;
            }),
            columns: headers.map(h => h || 'Sem título'),
            metadata: {
              totalRows: filteredRows.length,
              totalColumns: headers.length,
              fileType: 'excel',
              fileName: file.name
            }
          };
          
          tables.push(tableData);
          
          // Gerar dados para gráficos se possível
          if (headers.length >= 2 && filteredRows.length > 0) {
            const numericColumns = headers.map((header, index) => ({
              header,
              index,
              isNumeric: filteredRows.every(row => 
                !row[index] || 
                row[index] === '' || 
                !isNaN(Number(row[index]))
              )
            })).filter(col => col.isNumeric && col.header);
            
            if (numericColumns.length >= 1) {
              const chartData = filteredRows
                .slice(0, 10) // Limitar a 10 itens para o gráfico
                .map(row => {
                  const obj: Record<string, unknown> = {};
                  headers.forEach((header, i) => {
                    obj[header || `col_${i}`] = isNaN(Number(row[i])) ? row[i] : Number(row[i]) || 0;
                  });
                  return obj;
                })
                .filter(item => Object.values(item).some(val => val !== '' && val !== null));
              
              if (chartData.length > 0) {
                charts.push({
                  type: 'chart',
                  title: `Gráfico: ${sheetName}`,
                  data: chartData,
                  columns: headers,
                  metadata: {
                    totalRows: chartData.length,
                    totalColumns: headers.length,
                    fileType: 'excel',
                    fileName: file.name
                  }
                });
              }
            }
          }
          
          // Criar resumo com análise detalhada
          const analysisResults = analyzeData(tableData.data, headers);
          summary.push({
            type: 'summary',
            title: `Análise: ${sheetName}`,
            data: analysisResults,
            metadata: {
              totalRows: filteredRows.length,
              totalColumns: headers.length,
              fileType: 'excel',
              fileName: file.name
            }
          });
        });
        
        resolve({
          summary,
          charts,
          tables,
          metadata: {
            fileName: file.name,
            fileType: 'excel',
            processedAt: new Date(),
            totalRecords
          }
        });
        
      } catch (error: unknown) {
        reject(new Error(`Erro ao processar arquivo Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Função para processar arquivos CSV
export const processCSVFile = async (file: File, selectedColumns?: string[]): Promise<DashboardData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          reject(new Error('Arquivo CSV vazio'));
          return;
        }
        
        const allHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const allRows = lines.slice(1).map(line => 
          line.split(',').map(cell => cell.trim().replace(/"/g, ''))
        );
        
        // Filtrar colunas se selectedColumns foi fornecido
        let headers = allHeaders;
        let rows = allRows;
        
        if (selectedColumns && selectedColumns.length > 0) {
          const columnIndexes = selectedColumns
            .map(col => allHeaders.indexOf(col))
            .filter(index => index !== -1);
          
          headers = columnIndexes.map(index => allHeaders[index]);
          rows = allRows.map(row => 
            columnIndexes.map(index => row[index] || '')
          );
        }
        
        const tableData: ProcessedData = {
          type: 'table',
          title: 'Dados CSV',
          data: rows.map(row => {
            const obj: Record<string, unknown> = {};
            headers.forEach((header, i) => {
              obj[header || `Coluna ${i + 1}`] = row[i] || '';
            });
            return obj;
          }),
          columns: headers,
          metadata: {
            totalRows: rows.length,
            totalColumns: headers.length,
            fileType: 'csv',
            fileName: file.name
          }
        };
        
        // Gerar dados para gráficos
        const chartData = rows
          .slice(0, 10)
          .map(row => {
            const obj: Record<string, unknown> = {};
            headers.forEach((header, i) => {
              obj[header] = isNaN(Number(row[i])) ? row[i] : Number(row[i]) || 0;
            });
            return obj;
          });
        
        const summary: ProcessedData = {
          type: 'summary',
          title: 'Análise Detalhada CSV',
          data: analyzeData(tableData.data, headers),
          metadata: {
            totalRows: rows.length,
            totalColumns: headers.length,
            fileType: 'csv',
            fileName: file.name
          }
        };
        
        resolve({
          summary: [summary],
          charts: chartData.length > 0 ? [{
            type: 'chart',
            title: 'Gráfico CSV',
            data: chartData,
            columns: headers,
            metadata: {
              totalRows: chartData.length,
              totalColumns: headers.length,
              fileType: 'csv',
              fileName: file.name
            }
          }] : [],
          tables: [tableData],
          metadata: {
            fileName: file.name,
            fileType: 'csv',
            processedAt: new Date(),
            totalRecords: rows.length
          }
        });
        
      } catch (error: unknown) {
        reject(new Error(`Erro ao processar arquivo CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`));
      }
    };
    
    reader.readAsText(file);
  });
};

// Função principal para processar qualquer arquivo
export const processFile = async (file: File, selectedColumns?: string[]): Promise<DashboardData> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  switch (fileExtension) {
    case 'xlsx':
    case 'xls':
      return await processExcelFile(file, selectedColumns);
    case 'csv':
      return await processCSVFile(file, selectedColumns);
    case 'pdf':
      // Por simplicidade, vamos criar dados fictícios para PDF
      return {
        summary: [{
          type: 'summary',
          title: 'Resumo PDF',
          data: [
            { metric: 'Tipo de Arquivo', value: 'PDF' },
            { metric: 'Tamanho', value: `${(file.size / 1024 / 1024).toFixed(2)} MB` }
          ],
          metadata: {
            totalRows: 0,
            totalColumns: 0,
            fileType: 'pdf',
            fileName: file.name
          }
        }],
        charts: [],
        tables: [{
          type: 'table',
          title: 'Informações do PDF',
          data: [
            { propriedade: 'Nome do Arquivo', valor: file.name },
            { propriedade: 'Tamanho', valor: `${(file.size / 1024 / 1024).toFixed(2)} MB` },
            { propriedade: 'Tipo', valor: 'PDF' }
          ],
          columns: ['propriedade', 'valor'],
          metadata: {
            totalRows: 3,
            totalColumns: 2,
            fileType: 'pdf',
            fileName: file.name
          }
        }],
        metadata: {
          fileName: file.name,
          fileType: 'pdf',
          processedAt: new Date(),
          totalRecords: 0
        }
      };
    default:
      throw new Error(`Tipo de arquivo não suportado: ${fileExtension}`);
  }
};