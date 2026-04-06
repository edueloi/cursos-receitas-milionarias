import React, { useEffect, useState } from 'react';
import { BarChart2, Users, BookOpen, MessageSquare, Play, TrendingUp, Award, Eye, Layers, ArrowUpRight, Sparkles, Clock } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface InstructorDashboardPageProps {
  currentUser: User | null;
}

const InstructorDashboardPage: React.FC<InstructorDashboardPageProps> = ({ currentUser }) => {
  type StatsType = {
    totalCourses: number;
    totalStudents: number;
    totalViews: number;
    totalQuestions: number;
    topLessons: { courseId: string; courseTitle: string; lessonTitle: string; views: number }[];
    students?: { name: string; email: string; courses: { id: string; title: string }[]; joinedAt: string | null }[];
  };

  const [stats, setStats] = useState<StatsType>({
    totalCourses: 0,
    totalStudents: 0,
    totalViews: 0,
    totalQuestions: 0,
    topLessons: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser?.email) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await api.getInstructorDashboard(currentUser.email);
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar dashboard do instrutor:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [currentUser?.email]);

  const statCards = [
    { label: 'Cursos Criados', value: stats.totalCourses, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Alunos Inscritos', value: stats.totalStudents, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100', gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Aulas Assistidas', value: stats.totalViews, icon: Eye, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100', gradient: 'from-amber-500 to-amber-600' },
    { label: 'Dúvidas Recebidas', value: stats.totalQuestions, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100', gradient: 'from-purple-500 to-purple-600' },
  ];

  const maxViews = stats.topLessons.length > 0 ? Math.max(...stats.topLessons.map(l => l.views)) : 1;

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 max-w-[1400px] mx-auto w-full">
      
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-[#1a3a2a] via-[#0f2b1e] to-[#0a1f15] rounded-3xl overflow-hidden mb-8 shadow-xl shadow-rm-green/10">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rm-gold rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.02] rounded-full -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-rm-gold/20 rounded-lg">
                  <Sparkles size={16} className="text-rm-gold" />
                </div>
                <span className="text-xs font-bold text-rm-gold/80 uppercase tracking-widest">Painel do Produtor</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white mb-2">
                Olá, {currentUser?.name?.split(' ')[0] || 'Produtor'}! 👋
              </h2>
              <p className="text-sm sm:text-base text-white/50 max-w-lg">
                Acompanhe o desempenho dos seus cursos, engajamento dos alunos e muito mais.
              </p>
            </div>

            {/* Quick Summary - Desktop */}
            <div className="hidden lg:flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
              <div className="text-center px-4">
                <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.totalCourses}</p>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-0.5">Cursos</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center px-4">
                <p className="text-2xl font-bold text-rm-gold">{isLoading ? '...' : stats.totalStudents}</p>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-0.5">Alunos</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center px-4">
                <p className="text-2xl font-bold text-emerald-400">{isLoading ? '...' : stats.totalViews}</p>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-0.5">Visualizações</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-8">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className={`group bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-gray-200 p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:-translate-y-0.5`}
          >
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-2.5 ${card.bg} rounded-xl ring-1 ${card.ring} ${card.color} group-hover:scale-110 transition-transform`}>
                <card.icon size={18} />
              </div>
              <div className="flex items-center gap-1 text-emerald-500">
                <TrendingUp size={12} />
                <span className="text-[10px] font-bold">Ativo</span>
              </div>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">
              {isLoading ? (
                <span className="inline-block w-12 h-8 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                stats[(['totalCourses', 'totalStudents', 'totalViews', 'totalQuestions'] as const)[idx]]
              )}
            </p>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-6">
        
        {/* Top Lessons - Takes 3 columns */}
        <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rm-green/10 rounded-xl text-rm-green">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Aulas Mais Assistidas</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400">Ranking dos seus conteúdos mais populares</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full hidden sm:block">
                Top {stats.topLessons.length}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {stats.topLessons.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                  <Play size={24} />
                </div>
                <p className="text-sm font-medium text-gray-500">Nenhuma aula assistida ainda</p>
                <p className="text-xs text-gray-400 mt-1">As estatísticas aparecerão aqui quando seus alunos assistirem.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {stats.topLessons.map((item, idx) => {
                  const barWidth = maxViews > 0 ? (item.views / maxViews) * 100 : 0;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={`${item.courseId}-${item.lessonTitle}-${idx}`} className="group/item">
                      <div className="flex items-center gap-3 sm:gap-4 mb-1.5">
                        {/* Rank */}
                        <div className="shrink-0 w-8 text-center">
                          {idx < 3 ? (
                            <span className="text-xl">{medals[idx]}</span>
                          ) : (
                            <span className="text-sm font-bold text-gray-300">#{idx + 1}</span>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate group-hover/item:text-rm-green transition-colors">
                            {item.lessonTitle}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400 truncate">{item.courseTitle}</p>
                        </div>

                        {/* Views Count */}
                        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-rm-green/5 rounded-lg">
                          <Eye size={13} className="text-rm-green" />
                          <span className="text-sm font-bold text-rm-green">{item.views}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="ml-11 sm:ml-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-rm-green to-emerald-400 transition-all duration-1000"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Info */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 bg-rm-gold/10 rounded-xl text-rm-gold">
                <TrendingUp size={18} />
              </div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">Resumo Geral</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Layers size={16} className="text-blue-500" />
                  <span className="text-xs sm:text-sm text-gray-600">Cursos Publicados</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{isLoading ? '...' : stats.totalCourses}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Users size={16} className="text-emerald-500" />
                  <span className="text-xs sm:text-sm text-gray-600">Total de Alunos</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{isLoading ? '...' : stats.totalStudents}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Eye size={16} className="text-amber-500" />
                  <span className="text-xs sm:text-sm text-gray-600">Visualizações Totais</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{isLoading ? '...' : stats.totalViews}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={16} className="text-purple-500" />
                  <span className="text-xs sm:text-sm text-gray-600">Dúvidas Recebidas</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{isLoading ? '...' : stats.totalQuestions}</span>
              </div>

              {stats.totalStudents > 0 && stats.totalCourses > 0 && (
                <div className="flex items-center justify-between p-3 bg-rm-gold/5 rounded-xl border border-rm-gold/10">
                  <div className="flex items-center gap-2.5">
                    <Award size={16} className="text-rm-gold" />
                    <span className="text-xs sm:text-sm text-gray-600">Média por Curso</span>
                  </div>
                  <span className="text-sm font-bold text-rm-gold">
                    {Math.round(stats.totalStudents / stats.totalCourses)} alunos
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-rm-gold/5 to-yellow-50 rounded-2xl sm:rounded-3xl border border-rm-gold/10 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-rm-gold" />
              <h3 className="text-sm font-bold text-gray-800">Dica do Dia</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {stats.totalQuestions > 0 
                ? `Você tem ${stats.totalQuestions} dúvida${stats.totalQuestions > 1 ? 's' : ''} dos alunos. Responda rapidamente para manter o engajamento alto! 🚀`
                : stats.totalStudents > 0
                  ? 'Seus alunos estão engajados! Continue criando conteúdo de qualidade para manter o crescimento. 📈'
                  : 'Crie seu primeiro curso e comece a impactar vidas com seus conhecimentos! ✨'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="mt-5 sm:mt-6 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-8 w-full">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
            <Users size={18} />
          </div>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">Meus Alunos</h3>
        </div>
        
        {stats.students && stats.students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 px-4 font-semibold w-1/3">Aluno</th>
                  <th className="pb-3 px-4 font-semibold w-1/3">Cursos</th>
                  <th className="pb-3 px-4 font-semibold w-1/3">Cadastrado em</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats.students.map((student, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 align-top">
                      <p className="font-bold text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap gap-1">
                        {student.courses.map(c => (
                           <span key={c.id} className="text-[10px] bg-rm-green/10 text-rm-green px-2 py-0.5 rounded-md font-medium">
                             {c.title}
                           </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top text-gray-600 text-xs">
                      {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-6">Nenhum aluno inscrito ainda.</p>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
