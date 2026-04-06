import React, { useState } from 'react';
import { Course, User } from '../types';
import { Edit, Eye, Plus, Trash2, Search, Filter, BookOpen, Clock, MoreVertical } from 'lucide-react';
import Button from '../components/ui/Button';

interface InstructorCoursesPageProps {
  courses: Course[];
  currentUser: User | null;
  onEditCourse: (course: Course) => void;
  onCreateCourse: () => void;
  onDeleteCourse: (course: Course) => void;
}

const InstructorCoursesPage: React.FC<InstructorCoursesPageProps> = ({ courses, currentUser, onEditCourse, onCreateCourse, onDeleteCourse }) => {
  const visibleCourses = courses.filter(
    c => c.creatorEmail && c.creatorEmail === currentUser?.email
  );
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredCourses = visibleCourses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const renderStatusBadge = (status: string) => (
     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1 ${
        status === 'published' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
        status === 'draft' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
     }`}>
        {status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
        {status === 'draft' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>}
        {status === 'published' ? 'Publicado' : 'Rascunho'}
     </span>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 max-w-7xl mx-auto w-full">
      {/* Header Responsivo */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-rm-green/10 rounded-xl text-rm-green">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 tracking-tight">Meus Cursos</h2>
          </div>
          <p className="text-sm text-gray-500 ml-1">Gerencie seu conteúdo, veja o status das aulas e edite os materiais.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
             <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Buscar curso..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green outline-none transition-all bg-gray-50"
             />
          </div>
          <button 
            onClick={onCreateCourse} 
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-rm-green to-[#0f241e] text-white rounded-xl shadow-lg shadow-rm-green/20 font-bold hover:-translate-y-0.5 hover:shadow-xl transition-all flex items-center justify-center whitespace-nowrap"
          >
             <Plus size={18} className="mr-2" /> Novo Curso
          </button>
        </div>
      </div>

      {/* Grid de Cursos (Responsivo e Unificado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {filteredCourses.map(course => {
            const lessonsCount = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
            return (
              <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md hover:border-gray-200 transition-all">
                 <div className="relative aspect-video bg-gray-100 overflow-hidden">
                    <img 
                      src={course.thumbnailUrl || 'https://via.placeholder.com/600x338?text=Sem+Capa'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={course.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-4 left-4 z-10">
                       {renderStatusBadge(course.status)}
                    </div>
                    {/* Ações Rápidas Flutuantes */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => setCourseToDelete(course)} className="p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-lg hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors" title="Excluir">
                         <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
                 
                 <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">
                      {course.description || 'Sem descrição.'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-5 pt-3 border-t border-gray-50">
                       <div className="flex items-center gap-1">
                         <BookOpen size={14} className="text-rm-gold" />
                         <span>{course.modules.length} Módulos</span>
                       </div>
                       <div className="flex items-center gap-1">
                         <Clock size={14} className="text-blue-400" />
                         <span>{course.totalDuration || '0h'} h</span>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                       <button 
                         onClick={() => onEditCourse(course)} 
                         className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
                       >
                          <Edit size={16} /> Editar Aulas
                       </button>
                       {/*<button className="flex items-center justify-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-xl transition-colors" title="Ver como aluno">
                          <Eye size={18} />
                       </button>*/}
                    </div>
                 </div>
              </div>
            );
         })}
      </div>

      {visibleCourses.length > 0 && filteredCourses.length === 0 && (
         <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
               <Search size={24} />
            </div>
            <p className="text-gray-500 font-medium">Nenhum curso encontrado com "{searchQuery}"</p>
         </div>
      )}

      {visibleCourses.length === 0 && (
         <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 md:p-16 text-center max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-inner">
               <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Sua estante está vazia</h3>
            <p className="text-gray-500 text-sm mb-8 px-4">
               Você ainda não possui nenhum curso cadastrado. Comece agora mesmo clicando no botão abaixo para adicionar seu primeiro conteúdo.
            </p>
            <button 
              onClick={onCreateCourse} 
              className="px-8 py-3 bg-rm-green text-white rounded-xl shadow-lg shadow-rm-green/20 font-bold hover:-translate-y-0.5 hover:shadow-xl transition-all flex items-center justify-center mx-auto"
            >
               <Plus size={20} className="mr-2" /> Criar Meu Primeiro Curso
            </button>
         </div>
      )}

      {/* Modal Exclusão */}
      {courseToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-sm rounded-[2rem] bg-white shadow-2xl overflow-hidden scale-100 animate-jump">
            <div className="p-6 sm:p-8 text-center pt-8">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Excluir Curso?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Essa ação excluirá permanentemente o curso <strong className="text-gray-800">"{courseToDelete.title}"</strong> e todas as suas aulas. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3 justify-center">
              <button
                onClick={() => setCourseToDelete(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteCourse(courseToDelete);
                  setCourseToDelete(null);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-500 shadow-lg shadow-red-500/20 hover:bg-red-600 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCoursesPage;
