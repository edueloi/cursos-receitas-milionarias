import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { Edit, Eye, Plus, Loader } from 'lucide-react';
import Button from '../components/ui/Button';
import { api } from '../services/api';

interface InstructorCoursesPageProps {
  courses: Course[]; // Prop fallback, but we will fetch locally
  onEditCourse: (course: Course) => void;
  onCreateCourse: () => void;
}

const InstructorCoursesPage: React.FC<InstructorCoursesPageProps> = ({ onEditCourse, onCreateCourse }) => {
  const [localCourses, setLocalCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from the real backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.getCourses();
        setLocalCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);
  
  const renderStatusBadge = (status: string) => (
     <span className={`px-2 py-1 rounded-full text-xs font-bold ${
        status === 'published' ? 'bg-green-100 text-green-700' : 
        status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
     }`}>
        {status === 'published' ? 'Publicado' : 'Rascunho'}
     </span>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader className="animate-spin text-rm-green" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10">
      {/* Header Responsivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-rm-green mb-2">Gerenciar Cursos</h2>
          <p className="text-gray-600">Edite, publique ou arquive seus conteúdos.</p>
        </div>
        <Button onClick={onCreateCourse} className="w-full md:w-auto justify-center shadow-lg">
           <Plus size={18} className="mr-2" /> Novo Curso
        </Button>
      </div>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
         {localCourses.map(course => (
            <div key={course.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
               <div className="flex items-start gap-4">
                  <img 
                    src={course.thumbnailUrl || 'https://via.placeholder.com/150'} 
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 shadow-sm" 
                    alt={course.title} 
                  />
                  <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-gray-800 text-sm mb-2 leading-tight line-clamp-2">{course.title}</h3>
                     <div className="flex flex-wrap items-center gap-2 mb-1">
                        {renderStatusBadge(course.status)}
                     </div>
                     <p className="text-xs text-gray-400">{course.modules.length} módulos</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                  <button 
                    onClick={() => onEditCourse(course)} 
                    className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                     <Edit size={16} /> Editar
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                     <Eye size={16} /> Ver
                  </button>
               </div>
            </div>
         ))}
         {localCourses.length === 0 && (
             <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                Você ainda não criou nenhum curso.
             </div>
         )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
               <tr>
                  <th className="px-6 py-4">Curso</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Módulos</th>
                  <th className="px-6 py-4 text-right">Ações</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {localCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <img src={course.thumbnailUrl || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded object-cover shadow-sm" alt="" />
                           <span className="font-semibold text-gray-800">{course.title}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        {renderStatusBadge(course.status)}
                     </td>
                     <td className="px-6 py-4 text-gray-500">{course.modules.length} módulos</td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => onEditCourse(course)} className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Editar">
                              <Edit size={16} />
                           </button>
                           <button className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="Ver como aluno">
                              <Eye size={16} />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         {localCourses.length === 0 && (
             <div className="p-10 text-center text-gray-500">
                Você ainda não criou nenhum curso.
             </div>
         )}
      </div>
    </div>
  );
};

export default InstructorCoursesPage;