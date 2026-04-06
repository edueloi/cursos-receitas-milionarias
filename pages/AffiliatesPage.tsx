import React, { useState } from 'react';
import { Affiliate } from '../types';
import { Search, ShieldCheck, Clock, Ban, Users, DollarSign, TrendingUp, Percent, UserPlus, Mail, Calendar, ArrowUpRight, Filter, ChevronDown } from 'lucide-react';

const MOCK_AFFILIATES: Affiliate[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', totalSales: 15400, commissionRate: 50, status: 'active', joinDate: '12/08/2023' },
  { id: '2', name: 'Maria Oliveira', email: 'maria@email.com', totalSales: 8200, commissionRate: 40, status: 'active', joinDate: '05/09/2023' },
  { id: '3', name: 'Pedro Santos', email: 'pedro@email.com', totalSales: 0, commissionRate: 30, status: 'pending', joinDate: '01/10/2023' },
];

const AffiliatesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_AFFILIATES.filter(a => {
    const matchSearch = !search.trim() || 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSales = MOCK_AFFILIATES.reduce((acc, a) => acc + a.totalSales, 0);
  const activeCount = MOCK_AFFILIATES.filter(a => a.status === 'active').length;
  const pendingCount = MOCK_AFFILIATES.filter(a => a.status === 'pending').length;
  const avgCommission = MOCK_AFFILIATES.length > 0 
    ? Math.round(MOCK_AFFILIATES.reduce((acc, a) => acc + a.commissionRate, 0) / MOCK_AFFILIATES.length) 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] sm:text-xs font-bold border border-emerald-100"><ShieldCheck size={12}/> Ativo</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] sm:text-xs font-bold border border-amber-100"><Clock size={12}/> Pendente</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[10px] sm:text-xs font-bold border border-red-100"><Ban size={12}/> Bloqueado</span>;
    }
  };

  const statCards = [
    { label: 'Total Afiliados', value: MOCK_AFFILIATES.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
    { label: 'Afiliados Ativos', value: activeCount, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    { label: 'Vendas Totais', value: `R$ ${(totalSales / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-rm-gold', bg: 'bg-amber-50', ring: 'ring-amber-100' },
    { label: 'Comissão Média', value: `${avgCommission}%`, icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 max-w-[1400px] mx-auto w-full">
      
      {/* Header */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-rm-green/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-rm-green/10 rounded-xl text-rm-green">
                  <Users size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 tracking-tight">Afiliados</h2>
              </div>
              <p className="text-sm text-gray-500">Gerencie sua equipe de vendas e acompanhe comissões.</p>
            </div>
            <button className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-rm-green to-[#0f241e] text-white rounded-xl text-sm font-bold shadow-md shadow-rm-green/15 hover:shadow-lg hover:-translate-y-0.5 transition-all shrink-0">
              <UserPlus size={18} /> Convidar Afiliado
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {statCards.map((card, idx) => (
          <div key={idx} className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-4 sm:p-5 transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 ${card.bg} rounded-xl ring-1 ${card.ring} ${card.color}`}>
                <card.icon size={18} />
              </div>
              <ArrowUpRight size={14} className="text-gray-300 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Search */}
          <div className="relative flex-1 border-b sm:border-b-0 sm:border-r border-gray-100">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 text-sm outline-none bg-transparent placeholder-gray-400 focus:bg-gray-50 transition-colors"
            />
          </div>
          {/* Status Filter - Desktop */}
          <div className="hidden sm:flex items-center gap-2 px-4">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Ativos' },
              { id: 'pending', label: 'Pendentes' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setStatusFilter(opt.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  statusFilter === opt.id 
                    ? 'bg-rm-green text-white shadow-sm' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Filter Toggle - Mobile */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-gray-600 border-t border-gray-100 hover:bg-gray-50"
          >
            <Filter size={14} /> Filtrar <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showFilters && (
          <div className="sm:hidden flex gap-2 px-4 py-3 border-t border-gray-100 animate-fade-in">
            {['all', 'active', 'pending'].map(opt => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  statusFilter === opt ? 'bg-rm-green text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {opt === 'all' ? 'Todos' : opt === 'active' ? 'Ativos' : 'Pendentes'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Affiliates - Card layout for mobile, table for desktop */}
      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map(affiliate => (
          <div key={affiliate.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rm-green to-[#0f241e] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {affiliate.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{affiliate.name}</p>
                <p className="text-xs text-gray-400 truncate">{affiliate.email}</p>
              </div>
              {getStatusBadge(affiliate.status)}
            </div>
            
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50">
              <div className="text-center p-2 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-700">R$ {affiliate.totalSales.toLocaleString()}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">Vendas</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-rm-green">{affiliate.commissionRate}%</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">Comissão</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-700">{affiliate.joinDate}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">Entrada</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 lg:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Afiliado</th>
                <th className="px-5 lg:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendas Totais</th>
                <th className="px-5 lg:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comissão</th>
                <th className="px-5 lg:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-5 lg:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data Entrada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 lg:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-rm-green to-[#0f241e] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                        {affiliate.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{affiliate.name}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Mail size={10} /> {affiliate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-4">
                    <p className="font-bold text-gray-800">R$ {affiliate.totalSales.toLocaleString()}</p>
                  </td>
                  <td className="px-5 lg:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rm-green rounded-full" style={{ width: `${affiliate.commissionRate}%` }} />
                      </div>
                      <span className="text-sm font-bold text-rm-green">{affiliate.commissionRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-4">{getStatusBadge(affiliate.status)}</td>
                  <td className="px-5 lg:px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar size={13} className="text-gray-400" />
                      {affiliate.joinDate}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
              <Search size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500">Nenhum afiliado encontrado</p>
            <p className="text-xs text-gray-400 mt-1">Tente ajustar os filtros de busca.</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 lg:px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Mostrando {filtered.length} de {MOCK_AFFILIATES.length} afiliados</span>
          <div className="flex gap-1.5">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30" disabled>Anterior</button>
            <button className="px-3 py-1.5 bg-rm-green text-white rounded-lg text-xs font-bold">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors">Próximo</button>
          </div>
        </div>
      </div>

      {/* Mobile Empty State */}
      {filtered.length === 0 && (
        <div className="sm:hidden text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 mt-3">
          <Search size={28} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-bold text-gray-600">Nenhum afiliado encontrado</p>
          <p className="text-xs text-gray-400 mt-1">Ajuste os filtros ou convide novos afiliados.</p>
        </div>
      )}
    </div>
  );
};

export default AffiliatesPage;