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
    <div className="p-6 lg:p-10 animate-fade-in space-y-8 max-w-7xl mx-auto pb-20">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-xs font-bold text-rm-green mb-2">
            <Sparkles size={12} /> VISÃO GERAL
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-rm-green">
            Olá, {user?.name?.split(' ')[0] || 'Aluno'}!
          </h2>
          <p className="text-sm text-gray-500">Resumo da sua atividade na Academy.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/meus-cursos')} className="px-4 py-2 text-sm font-bold rounded-lg border border-gray-200 text-gray-700 hover:border-rm-gold hover:text-rm-green">
            Meus Cursos
          </button>
          <button onClick={() => navigate('/certificados')} className="px-4 py-2 text-sm font-bold rounded-lg bg-rm-green text-white hover:bg-[#0f241e]">
            Certificados
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-serif font-bold text-rm-green">Visão Geral</h3>
          <p className="text-sm text-gray-500">Dados atualizados automaticamente</p>
        </div>
        <div className="text-xs text-gray-400">{isLoading ? 'Atualizando...' : 'Pronto'}</div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.accent}`}><stat.icon size={18} /></div>
            </div>
            <div className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-serif font-bold text-rm-green text-lg">Progresso por curso</h4>
              <p className="text-xs text-gray-400">Acompanhe seu ritmo de estudos</p>
            </div>
          </div>
          {stats.progressByCourse.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhum curso inscrito ainda.</div>
          ) : (
            <div className="space-y-4">
              {stats.progressByCourse.map(course => (
                <div key={course.courseId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-800">{course.courseTitle}</span>
                    <span className="text-gray-500">{course.completedLessons}/{course.totalLessons}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-rm-gold" style={{ width: `${course.progressPercent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-serif font-bold text-rm-green text-lg">Atividade recente</h4>
          </div>
          {stats.recentActivity.length === 0 ? (
            <div className="text-sm text-gray-500">Sem atividades recentes.</div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, idx) => (
                <div key={`${activity.title}-${idx}`} className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${activity.type === 'certificate' ? 'bg-rm-gold/20 text-rm-green' : 'bg-blue-50 text-blue-600'}`}>
                    {activity.type === 'certificate' ? <Award size={16} /> : <MessageSquare size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(activity.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="mt-6 w-full py-2 text-center text-xs font-bold text-rm-gold uppercase tracking-wider hover:underline flex items-center justify-center gap-2">
            Ver histórico completo <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
