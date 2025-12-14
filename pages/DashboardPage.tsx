import React from 'react';
import { DollarSign, Users, ShoppingBag, TrendingUp, ArrowUpRight, Award, PlayCircle, Sparkles } from 'lucide-react';
import { User } from '../types';

interface DashboardProps {
  user?: User;
}

const DashboardPage: React.FC<DashboardProps> = ({ user }) => {
  // Mock Data
  const stats = [
    { label: 'Ganhos Estimados', value: 'R$ 1.250,00', change: '+12% este mês', icon: DollarSign, bg: 'bg-gradient-to-br from-rm-green to-[#142923]', text: 'text-white' },
    { label: 'Cursos Concluídos', value: '2', change: 'Continue assim!', icon: Award, bg: 'bg-gradient-to-br from-rm-gold to-[#B08D2B]', text: 'text-white' },
    { label: 'Aulas Assistidas', value: '24', change: '+3 hoje', icon: PlayCircle, bg: 'bg-white', text: 'text-rm-green' },
  ];

  const recentActivities = [
    { id: 1, title: 'Assistiu: Como precificar corretamente', type: 'lesson', time: 'Há 5 min' },
    { id: 2, title: 'Concluiu Módulo: Mindset Milionário', type: 'milestone', time: 'Há 2h' },
    { id: 3, title: 'Baixou Ebook: Receitas de Páscoa', type: 'download', time: 'Ontem' },
  ];

  return (
    <div className="p-6 lg:p-10 animate-fade-in space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-rm-green text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rm-gold rounded-full filter blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full filter blur-[60px] opacity-10 transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-rm-gold mb-2">
                <Sparkles size={12} /> ÁREA DO ALUNO & AFILIADO
             </div>
             <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
               Olá, {user?.name.split(' ')[0] || 'Afiliado'}!
             </h2>
             <p className="text-gray-200 max-w-lg">
               Seu painel de aprendizado está pronto. Acesse seus cursos, veja materiais e acompanhe sua evolução para vender mais.
             </p>
          </div>
          <div className="flex gap-4">
             <a href="https://dashboard.receitasmilionarias.com.br" target="_blank" className="px-6 py-3 bg-rm-gold hover:bg-white hover:text-rm-green text-white font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 text-sm">
                Ver Meus Ganhos
             </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-rm-green mb-1">Visão Geral</h2>
          <p className="text-sm text-gray-500">Resumo da sua atividade na Academy.</p>
        </div>
        <div className="text-xs text-gray-400 font-medium">
           Dados atualizados automaticamente
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`rounded-2xl shadow-lg p-6 flex flex-col justify-between h-36 transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group ${stat.bg === 'bg-white' ? 'bg-white border border-gray-100' : stat.bg}`}>
            {/* Background Decorations */}
            {stat.bg !== 'bg-white' && (
               <div className="absolute -right-6 -top-6 text-white opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                  <stat.icon size={100} />
               </div>
            )}
            
            <div className={`relative z-10 flex justify-between items-start ${stat.bg === 'bg-white' ? 'text-gray-800' : 'text-white'}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-80`}>{stat.label}</p>
                <h3 className="text-3xl font-serif font-bold">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg === 'bg-white' ? 'bg-gray-50 text-rm-green' : 'bg-white/20 text-white backdrop-blur-sm'}`}>
                <stat.icon size={20} />
              </div>
            </div>
            
            <div className={`relative z-10 mt-auto flex items-center gap-2 text-xs font-bold ${stat.bg === 'bg-white' ? 'text-gray-400' : 'text-white/80'}`}>
               <TrendingUp size={14} /> {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="font-serif font-bold text-rm-green text-lg">Seu Ritmo de Estudos</h3>
               <p className="text-xs text-gray-400">Aulas assistidas nos últimos 7 dias</p>
             </div>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 px-4 h-48 border-b border-gray-50 pb-2">
            {[2, 5, 3, 8, 4, 6, 7].map((val, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                <div 
                  className="w-full max-w-[40px] bg-gray-100 rounded-t-lg relative group-hover:bg-rm-gold/80 transition-all duration-300" 
                  style={{ height: `${val * 10}%` }}
                >
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif font-bold text-rm-green text-lg">Atividade Recente</h3>
          </div>
          
          <div className="relative pl-2">
            {/* Timeline Line */}
            <div className="absolute top-2 left-[19px] bottom-0 w-0.5 bg-gray-100"></div>

            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="relative flex items-start gap-4 group">
                  <div className={`
                    relative z-10 h-10 w-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm shrink-0
                    ${activity.type === 'lesson' ? 'bg-blue-100 text-blue-600' : 
                      activity.type === 'milestone' ? 'bg-rm-gold text-white' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {activity.type === 'lesson' && <PlayCircle size={16} />}
                    {activity.type === 'milestone' && <Award size={16} />}
                    {activity.type === 'download' && <ArrowUpRight size={16} />}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-rm-green transition-colors">{activity.title}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-8 w-full py-2 text-center text-xs font-bold text-rm-gold uppercase tracking-wider hover:underline">
               Ver Histórico Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;