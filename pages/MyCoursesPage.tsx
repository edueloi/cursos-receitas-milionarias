import React, { useState } from 'react';
import { Course } from '../types';
import { Play } from 'lucide-react';
import Button from '../components/ui/Button';

interface MyCoursesPageProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
}

const MyCoursesPage: React.FC<MyCoursesPageProps> = ({ courses, onSelectCourse }) => {
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'favorites'>('in-progress');

  // Filter logic (Mocked based on progress)
  const myCourses = courses.filter(c => {
    if (activeTab === 'in-progress') return (c.progress || 0) > 0 && (c.progress || 0) < 100;
    if (activeTab === 'completed') return (c.progress || 0) === 100;
    return (c.progress || 0) > 0; // Favorites mock (show all started)
  });

  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-rm-green mb-2">Meus Cursos</h2>
        <p className="text-gray-600">Acompanhe seu desenvolvimento.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('in-progress')}
          className={`pb-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'in-progress' ? 'border-rm-gold text-rm-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Em Andamento
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'completed' ? 'border-rm-gold text-rm-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Concluídos
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`pb-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'favorites' ? 'border-rm-gold text-rm-green' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Favoritos
        </button>
      </div>

      <div className="space-y-4">
        {myCourses.map(course => (
          <div key={course.id} className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow">
            <div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden relative">
               <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                 <Play className="text-white fill-white" />
               </div>
            </div>
            
            <div className="flex-1 w-full">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="font-serif font-bold text-lg text-rm-green">{course.title}</h3>
                 <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                   {course.progress === 100 ? 'Concluído' : 'Em andamento'}
                 </span>
               </div>
               
               <div className="mb-4">
                 <div className="flex justify-between text-xs text-gray-500 mb-1">
                   <span>Progresso</span>
                   <span>{course.progress || 0}%</span>
                 </div>
                 <div className="w-full bg-gray-100 rounded-full h-2">
                   <div className="bg-rm-gold h-2 rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
                 </div>
               </div>

               <div className="flex gap-3">
                 <Button size="sm" onClick={() => onSelectCourse(course)}>Continuar Assistindo</Button>
               </div>
            </div>
          </div>
        ))}
        
        {myCourses.length === 0 && (
           <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             <p>Nenhum curso encontrado nesta categoria.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;