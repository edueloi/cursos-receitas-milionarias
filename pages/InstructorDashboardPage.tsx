import React, { useEffect, useState } from 'react';
import { BarChart2, Users, BookOpen, MessageSquare, Play } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface InstructorDashboardPageProps {
  currentUser: User | null;
}

const InstructorDashboardPage: React.FC<InstructorDashboardPageProps> = ({ currentUser }) => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalViews: 0,
    totalQuestions: 0,
    topLessons: [] as { courseId: string; courseTitle: string; lessonTitle: string; views: number }[]
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

  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-rm-green mb-2">Painel do Instrutor</h2>
        <p className="text-gray-600">Visão geral do seu conteúdo educacional.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={20}/></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Cursos</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stats.totalCourses}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Users size={20}/></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Alunos</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><BarChart2 size={20}/></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Aulas vistas</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stats.totalViews}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MessageSquare size={20}/></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Dúvidas</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{isLoading ? '...' : stats.totalQuestions}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-rm-green mb-4">Vídeos mais assistidos</h3>
        <div className="space-y-4">
          {stats.topLessons.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhuma aula assistida ainda.</div>
          ) : (
            stats.topLessons.map((item, idx) => (
              <div key={`${item.courseId}-${item.lessonTitle}-${idx}`} className="flex items-center justify-between border-b border-gray-50 pb-2">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-gray-300 text-lg">{String(idx + 1).padStart(2, '0')}</div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">{item.lessonTitle}</p>
                    <p className="text-xs text-gray-400">Curso: {item.courseTitle}</p>
                  </div>
                </div>
                <div className="text-sm font-bold text-rm-green flex items-center gap-1">
                  <Play size={14} /> {item.views}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
