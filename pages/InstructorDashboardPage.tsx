import React from 'react';
import { BarChart2, Users, BookOpen, MessageSquare } from 'lucide-react';

const InstructorDashboardPage: React.FC = () => {
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
           <p className="text-2xl font-bold text-gray-800">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Users size={20}/></div>
              <span className="text-xs font-bold text-gray-400 uppercase">Alunos</span>
           </div>
           <p className="text-2xl font-bold text-gray-800">1,402</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><BarChart2 size={20}/></div>
              <span className="text-xs font-bold text-gray-400 uppercase">Aulas Vistas</span>
           </div>
           <p className="text-2xl font-bold text-gray-800">45.2k</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MessageSquare size={20}/></div>
              <span className="text-xs font-bold text-gray-400 uppercase">Dúvidas</span>
           </div>
           <p className="text-2xl font-bold text-gray-800">8</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-rm-green mb-4">Aulas mais populares</h3>
        <div className="space-y-4">
           {[1,2,3].map(i => (
             <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2">
                <div className="flex items-center gap-3">
                   <div className="font-bold text-gray-300 text-lg">0{i}</div>
                   <div>
                      <p className="font-medium text-sm text-gray-800">Como fazer tráfego pago para delivery</p>
                      <p className="text-xs text-gray-400">Curso: Mestre das Vendas</p>
                   </div>
                </div>
                <div className="text-sm font-bold text-rm-green">1,204 views</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;