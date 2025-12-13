import React from 'react';
import { Affiliate } from '../types';
import { Search, MoreVertical, ShieldCheck, Clock, Ban } from 'lucide-react';
import Button from '../components/ui/Button';

const MOCK_AFFILIATES: Affiliate[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', totalSales: 15400, commissionRate: 50, status: 'active', joinDate: '12/08/2023' },
  { id: '2', name: 'Maria Oliveira', email: 'maria@email.com', totalSales: 8200, commissionRate: 40, status: 'active', joinDate: '05/09/2023' },
  { id: '3', name: 'Pedro Santos', email: 'pedro@email.com', totalSales: 0, commissionRate: 30, status: 'pending', joinDate: '01/10/2023' },
];

const AffiliatesPage: React.FC = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><ShieldCheck size={12}/> Ativo</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> Pendente</span>;
      default:
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Ban size={12}/> Bloqueado</span>;
    }
  };

  return (
    <div className="p-6 lg:p-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-rm-green mb-2">Afiliados</h2>
          <p className="text-gray-600">Gerencie sua equipe de vendas e comissões.</p>
        </div>
        <Button>Convidar Afiliado</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="relative max-w-sm w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rm-gold focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select className="text-sm border-gray-300 rounded-lg px-3 py-2 text-gray-600 outline-none">
              <option>Todos os Status</option>
              <option>Ativos</option>
              <option>Pendentes</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-serif font-bold uppercase text-xs tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Afiliado</th>
                <th className="px-6 py-4">Vendas Totais</th>
                <th className="px-6 py-4">Comissão</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data Entrada</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_AFFILIATES.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-rm-green text-white flex items-center justify-center font-bold text-xs">
                        {affiliate.name.substring(0,1)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{affiliate.name}</p>
                        <p className="text-xs text-gray-400">{affiliate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">R$ {affiliate.totalSales.toLocaleString()}</td>
                  <td className="px-6 py-4 text-rm-green font-bold">{affiliate.commissionRate}%</td>
                  <td className="px-6 py-4">{getStatusBadge(affiliate.status)}</td>
                  <td className="px-6 py-4 text-gray-500">{affiliate.joinDate}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-rm-gold transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Mostrando 3 de 145 afiliados</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatesPage;