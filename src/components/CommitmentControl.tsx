 import React, { useState } from 'react';
import { 
  FileCheck, 
  Search, 
  Calendar, 
  DollarSign, 
  Building, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Eye,
  Edit,
  Filter,
  TrendingUp
} from 'lucide-react';

interface Commitment {
  id: string;
  number: string;
  description: string;
  supplier: string;
  issueDate: string;
  dueDate: string;
  value: number;
  usedValue: number;
  status: 'active' | 'partial' | 'completed' | 'cancelled';
  category: string;
  department: string;
}

const CommitmentControl: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Commitment['status']>('all');

  // Dados de demonstração
  const [commitments] = useState<Commitment[]>([
    {
      id: '1',
      number: 'EMP001/2025',
      description: 'Aquisição de medicamentos para UTI',
      supplier: 'Distribuidora Farmacêutica Alpha',
      issueDate: '2025-09-01',
      dueDate: '2025-12-31',
      value: 150000.00,
      usedValue: 87500.00,
      status: 'partial',
      category: 'Medicamentos',
      department: 'UTI'
    },
    {
      id: '2',
      number: 'EMP002/2025',
      description: 'Equipamentos de diagnóstico por imagem',
      supplier: 'Tecnologia Médica Beta',
      issueDate: '2025-08-15',
      dueDate: '2025-11-30',
      value: 85000.00,
      usedValue: 0.00,
      status: 'active',
      category: 'Equipamentos',
      department: 'Radiologia'
    },
    {
      id: '3',
      number: 'EMP003/2025',
      description: 'Materiais cirúrgicos descartáveis',
      supplier: 'Cirúrgica Especializada Gamma',
      issueDate: '2025-07-20',
      dueDate: '2025-10-31',
      value: 45000.00,
      usedValue: 45000.00,
      status: 'completed',
      category: 'Materiais Cirúrgicos',
      department: 'Centro Cirúrgico'
    },
    {
      id: '4',
      number: 'EMP004/2025',
      description: 'Insumos para laboratório de análises',
      supplier: 'Laboratório Suprimentos Delta',
      issueDate: '2025-09-10',
      dueDate: '2025-12-15',
      value: 32000.00,
      usedValue: 12800.00,
      status: 'partial',
      category: 'Insumos Laboratoriais',
      department: 'Laboratório'
    },
    {
      id: '5',
      number: 'EMP005/2025',
      description: 'Sistema de monitoramento cardíaco',
      supplier: 'Equipamentos Hospitalares Epsilon',
      issueDate: '2025-08-01',
      dueDate: '2025-10-01',
      value: 75000.00,
      usedValue: 0.00,
      status: 'cancelled',
      category: 'Equipamentos',
      department: 'Cardiologia'
    }
  ]);

  const getStatusIcon = (status: Commitment['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'partial':
        return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: Commitment['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusText = (status: Commitment['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'partial':
        return 'Parcialmente Usado';
      case 'completed':
        return 'Finalizado';
      case 'cancelled':
        return 'Cancelado';
    }
  };

  const getUsagePercentage = (used: number, total: number) => {
    return total > 0 ? (used / total) * 100 : 0;
  };

  const filteredCommitments = commitments.filter(commitment => {
    const matchesSearch = 
      commitment.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commitment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commitment.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commitment.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || commitment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalValue = commitments.reduce((sum, commitment) => sum + commitment.value, 0);
  const usedValue = commitments.reduce((sum, commitment) => sum + commitment.usedValue, 0);
  const activeCount = commitments.filter(com => com.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Controle de Empenhos</h1>
          <p className="text-slate-600 mt-1">Gestão e acompanhamento de empenhos orçamentários</p>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total de Empenhos</p>
              <p className="text-2xl font-bold text-slate-900">{commitments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Ativos</p>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Valor Total</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">% Utilizado</p>
              <p className="text-2xl font-bold text-slate-900">
                {((usedValue / totalValue) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número, descrição, fornecedor ou departamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="partial">Parcialmente Usados</option>
              <option value="completed">Finalizados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Empenhos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Empenho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Utilização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredCommitments.map((commitment) => {
                const usagePercentage = getUsagePercentage(commitment.usedValue, commitment.value);
                return (
                  <tr key={commitment.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{commitment.number}</p>
                        <p className="text-sm text-slate-500">{commitment.description}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                          {commitment.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">{commitment.supplier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-900">{commitment.department}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-slate-900">
                        {commitment.value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">
                            {commitment.usedValue.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </span>
                          <span className="text-xs text-slate-600">
                            {usagePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(commitment.status)}`}>
                        {getStatusIcon(commitment.status)}
                        <span>{getStatusText(commitment.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900">
                          {new Date(commitment.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className="text-green-600 hover:text-green-700 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-slate-600 hover:text-slate-700 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCommitments.length === 0 && (
          <div className="text-center py-12">
            <FileCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum empenho encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitmentControl;