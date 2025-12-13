import React from 'react';
import { Course } from '../types';
import { Edit, Eye, MoreHorizontal, Plus } from 'lucide-react';
import Button from '../components/ui/Button';

interface InstructorCoursesPageProps {
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onCreateCourse: () => void;
}

const InstructorCoursesPage: React.FC<InstructorCoursesPageProps> = ({ courses, onEditCourse, onCreateCourse }) => {
  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-rm-green mb-2">Gerenciar Cursos</h2>
          <p className="text-gray-600">Edite, publique ou arquive seus conteúdos.</p>
        </div>
        <Button onClick={onCreateCourse}>
           <Plus size={18} className="mr-2" /> Novo Curso
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
               {courses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <img src={course.thumbnailUrl} className="w-10 h-10 rounded object-cover" alt="" />
                           <span className="font-semibold text-gray-800">{course.title}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                           course.status === 'published' ? 'bg-green-100 text-green-700' : 
                           course.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                           {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-gray-500">{course.modules.length} módulos</td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => onEditCourse(course)} className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Editar">
                              <Edit size={16} />
                           </button>
                           <button className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Ver como aluno">
                              <Eye size={16} />
                           </button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         {courses.length === 0 && (
             <div className="p-10 text-center text-gray-500">
                Você ainda não criou nenhum curso.
             </div>
         )}
      </div>
    </div>
  );
};

export default InstructorCoursesPage;