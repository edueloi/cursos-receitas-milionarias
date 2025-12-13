import React from 'react';
import { DollarSign, Users, ShoppingBag, TrendingUp, ArrowUpRight, Award } from 'lucide-react';

const DashboardPage: React.FC = () => {
  // Mock Data
  const stats = [
    { label: 'Faturamento Total', value: 'R$ 124.590,00', change: '+12%', icon: DollarSign, bg: 'bg-rm-gold', text: 'text-white' },
    { label: 'Afiliados Ativos', value: '1,234', change: '+5%', icon: Users, bg: 'bg-rm-green', text: 'text-white' },
    { label: 'Vendas no Mês', value: '843', change: '+18%', icon: ShoppingBag, bg: 'bg-white', text: 'text-rm-green' },
  ];

  const recentSales = [
    { id: 1, product: 'Curso Confeitaria 2.0', affiliate: 'Maria Silva', value: 'R$ 97,00', time: 'Há 5 min' },
    { id: 2, product: 'Mestre das Vendas', affiliate: 'João Souza', value: 'R$ 197,00', time: 'Há 12 min' },
    { id: 3, product: 'Curso Confeitaria 2.0', affiliate: 'Ana Paula', value: 'R$ 97,00', time: 'Há 35 min' },
    { id: 4, product: 'Mindset Milionário', affiliate: 'Carlos Beto', value: 'R$ 497,00', time: 'Há 1h' },
  ];

  return (
    <div className="p-6 lg:p-10 animate-fade-in space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-rm-green mb-1">Painel Geral</h2>
          <p className="text-gray-600">Visão geral do desempenho do seu negócio digital.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-sm font-medium text-gray-600">
           Última atualização: <span className="text-rm-green font-bold">Hoje, 14:30</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`rounded-xl shadow-lg p-6 flex items-start justify-between transform hover:scale-[1.02] transition-transform duration-300 ${stat.bg === 'bg-white' ? 'bg-white border border-gray-100' : stat.bg}`}>
            <div className={stat.bg === 'bg-white' ? 'text-gray-800' : 'text-white'}>
              <p className={`text-sm font-medium mb-1 opacity-90`}>{stat.label}</p>
              <h3 className="text-2xl lg:text-3xl font-serif font-bold mb-3">{stat.value}</h3>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit ${stat.bg === 'bg-white' ? 'bg-green-50 text-green-700' : 'bg-white/20 text-white'}`}>
                <TrendingUp size={12} />
                <span>{stat.change}</span>
              </div>
            </div>
            <div className={`p-3 rounded-lg shadow-md ${stat.bg === 'bg-white' ? 'bg-rm-green text-white' : 'bg-white/20 text-white'}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="font-serif font-bold text-rm-green text-lg">Receita Mensal</h3>
               <p className="text-xs text-gray-400">Comparativo do primeiro semestre</p>
            </div>
            <select className="text-sm bg-gray-50 border-gray-200 rounded-lg px-3 py-1.5 focus:border-rm-gold focus:ring-1 focus:ring-rm-gold outline-none">
              <option>Últimos 6 meses</option>
              <option>Este Ano</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 px-2">
            {[35, 55, 40, 70, 60, 85].map((height, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-3 group cursor-pointer h-full justify-end">
                <div 
                  className="w-full max-w-[40px] bg-gradient-to-t from-rm-green to-teal-700 rounded-t-full relative hover:from-rm-gold hover:to-yellow-500 transition-all duration-500 shadow-sm" 
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    R$ {height}k
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-bold text-rm-green text-lg">Vendas Recentes</h3>
            <button className="text-rm-gold text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
              Ver tudo <ArrowUpRight size={14} />
            </button>
          </div>
          
          <div className="space-y-6">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-rm-green font-bold text-xs group-hover:bg-rm-gold group-hover:text-white transition-colors">
                    <Award size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{sale.product}</p>
                    <p className="text-xs text-gray-400">{sale.affiliate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-rm-green">{sale.value}</p>
                  <p className="text-xs text-gray-400">{sale.time}</p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-50">
               <button className="w-full py-2 text-center text-sm text-gray-500 hover:text-rm-green transition-colors">Carregar mais...</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;