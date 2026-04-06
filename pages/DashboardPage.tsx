import React, { useEffect, useState } from 'react';
import { Award, BookOpen, MessageSquare, PlayCircle, ArrowUpRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  user?: User;
}

const DashboardPage: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    lessonsWatched: 0,
    questionsAsked: 0,
    progressByCourse: [] as { courseId: string; courseTitle: string; completedLessons: number; totalLessons: number; progressPercent: number }[],
    recentActivity: [] as { type: string; title: string; at: string }[]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.getUserDashboard(user.email);
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.email]);

  const formatRelativeTime = (iso: string) => {
    const time = new Date(iso).getTime();
    if (!time || Number.isNaN(time)) return 'Agora';
    const diff = Date.now() - time;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `Há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Há ${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Ontem' : `Há ${days} dias`;
  };

  const statsCards = [
    { label: 'Cursos Inscritos', value: stats.totalCourses, icon: BookOpen, accent: 'bg-blue-50 text-blue-600' },
    { label: 'Cursos Concluídos', value: stats.completedCourses, icon: Award, accent: 'bg-rm-gold/20 text-rm-green' },
    { label: 'Aulas Assistidas', value: stats.lessonsWatched, icon: PlayCircle, accent: 'bg-green-50 text-green-600' },
    { label: 'Dúvidas Enviadas', value: stats.questionsAsked, icon: MessageSquare, accent: 'bg-purple-50 text-purple-600' }
  ];

  return (
    <div className="p-6 lg:p-8 animate-fade-in space-y-8 max-w-7xl mx-auto pb-24">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 shadow-xl p-8 md:p-10 bg-gradient-to-br from-rm-green to-[#0f241e] text-white">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rm-gold/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-rm-gold tracking-wider">
              <Sparkles size={14} className="text-rm-gold" />
              VISÃO GERAL
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-sm">
              Olá, {user?.name?.split(' ')[0] || 'Aluno'}!
            </h2>
            <p className="text-sm md:text-base text-gray-300 max-w-md font-light">
              Tudo pronto para mais um passo na sua jornada hoje? Explore seu painel e continue evoluindo na Academy.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate('/meus-cursos')} className="px-5 py-2.5 text-sm font-bold rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-rm-green transition-all shadow-md">
              Meus Cursos
            </button>
            <button onClick={() => navigate('/certificados')} className="px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-rm-gold to-yellow-500 text-rm-green hover:shadow-lg hover:scale-105 transition-all">
              Meus Certificados
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-800 tracking-tight">O que você já conquistou</h3>
          <p className="text-sm text-gray-500 mt-1">Estatísticas atualizadas em tempo real</p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-medium text-rm-green px-3 py-1 bg-rm-green/10 rounded-full animate-pulse">
            <div className="w-2 h-2 rounded-full bg-rm-green"></div> Atualizando
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsCards.map((stat, i) => (
          <div key={stat.label} className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 to-transparent opacity-50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110`}></div>
            <div className="flex items-start justify-between mb-4 relative z-10">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
              <div className={`p-2.5 rounded-xl ${stat.accent} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
                {isLoading ? <span className="text-gray-300 animate-pulse">...</span> : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress & Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Progress */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-md p-6 md:p-8 flex flex-col relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-gray-50 rounded-full pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h4 className="font-serif font-bold text-gray-800 text-xl md:text-2xl flex items-center gap-3">
                <PlayCircle className="text-rm-gold" size={24} />
                Progresso dos Cursos
              </h4>
              <p className="text-sm text-gray-500 mt-1">Acompanhe seu ritmo de estudos e aprendizado.</p>
            </div>
          </div>
          
          {stats.progressByCourse.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-300 mb-4 shadow-sm">
                <BookOpen size={32} />
              </div>
              <p className="text-gray-600 font-medium">Nenhum progresso registrado.</p>
              <p className="text-xs text-gray-400 mt-1">Comece a estudar para ver seus dados aqui.</p>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              {stats.progressByCourse.map(course => (
                <div key={course.courseId} className="group p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-800 group-hover:text-rm-green transition-colors text-sm md:text-base cursor-pointer" onClick={() => navigate('/meus-cursos')}>
                      {course.courseTitle}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {course.completedLessons} / {course.totalLessons} AULAS
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-rm-gold to-yellow-400 rounded-full relative" 
                        style={{ width: `${course.progressPercent}%`, transition: 'width 1s ease-out' }}>
                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 w-full h-full overflow-hidden" 
                             style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-12 text-right">{course.progressPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 md:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-serif font-bold text-gray-800 text-xl flex items-center gap-3">
              <Award className="text-blue-500" size={24} />
              Atividade Recente
            </h4>
          </div>
          
          {stats.recentActivity.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center py-10 text-gray-400 text-sm italic">
              Nenhuma atividade recente encontrada.
            </div>
          ) : (
            <div className="flex-1 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {stats.recentActivity.map((activity, idx) => {
                const isCert = activity.type === 'certificate';
                const Icon = isCert ? Award : MessageSquare;
                const iconColor = isCert ? 'text-rm-green' : 'text-blue-600';
                const bgColor = isCert ? 'bg-rm-gold/20' : 'bg-blue-100';
                
                return (
                  <div key={`${activity.title}-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110 group-hover:shadow-md">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor} ${iconColor}`}>
                        <Icon size={14} />
                      </div>
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm transition-all group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:bg-white group-hover:border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isCert ? 'text-rm-green' : 'text-blue-500'}`}>
                          {isCert ? 'Conquista' : 'Interação'}
                        </span>
                        <time className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{formatRelativeTime(activity.at)}</time>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">{activity.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <button className="mt-8 w-full py-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 hover:text-rm-green hover:border-gray-200 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
            Ver histórico completo <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
