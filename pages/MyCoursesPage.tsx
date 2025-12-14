import React, { useState } from 'react';
import { Course } from '../types';
import { Play, Star, Clock, Trophy } from 'lucide-react';
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
    return (c.progress || 0) > 0; // Favorites mock (show all started for now)
  });

  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 min-h-screen bg-[#F8F9FA]">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-1 bg-rm-gold rounded-full"></span>
              <h2 className="text-3xl font-serif font-bold text-rm-green">Minha Jornada</h2>
           </div>
           <p className="text-gray-600">Continue de onde parou e conquiste novos conhecimentos.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-10 overflow-x-auto pb-1">
        {[
          { id: 'in-progress', label: 'Em Andamento', icon: Clock },
          { id: 'completed', label: 'Concluídos', icon: Trophy },
          { id: 'favorites', label: 'Favoritos', icon: Star }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              pb-4 px-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-2
              ${activeTab === tab.id 
                ? 'border-rm-gold text-rm-green scale-105' 
                : 'border-transparent text-gray-400 hover:text-gray-600'}
            `}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {myCourses.map(course => (
          <div 
            key={course.id} 
            className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
          >
            {/* Image Container */}
            <div className="relative h-56 overflow-hidden">
               <img 
                 src={course.thumbnailUrl} 
                 alt={course.title} 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
               
               {/* Play Button Overlay */}
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-black/20">
                 <button 
                   onClick={() => onSelectCourse(course)}
                   className="bg-rm-gold text-white p-4 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-white hover:text-rm-gold"
                 >
                   <Play size={32} fill="currentColor" className="ml-1" />
                 </button>
               </div>

               {/* Progress Badge over Image */}
               <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between text-xs text-white/90 font-bold mb-1.5 uppercase tracking-wide">
                     <span>{course.progress === 100 ? 'Concluído' : 'Progresso'}</span>
                     <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 backdrop-blur-sm">
                     <div 
                       className={`h-1.5 rounded-full shadow-[0_0_10px_rgba(201,166,53,0.5)] transition-all duration-1000 ${course.progress === 100 ? 'bg-green-400' : 'bg-rm-gold'}`} 
                       style={{ width: `${course.progress || 0}%` }}
                     ></div>
                  </div>
               </div>
            </div>
            
            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col">
               <div className="flex-1">
                 <h3 className="font-serif font-bold text-xl text-rm-green mb-2 leading-tight group-hover:text-rm-gold transition-colors">
                   {course.title}
                 </h3>
                 <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                   {course.description}
                 </p>
               </div>
               
               <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                   {course.totalDuration} de conteúdo
                 </span>
                 <button 
                   onClick={() => onSelectCourse(course)}
                   className="text-sm font-bold text-rm-green hover:text-rm-gold transition-colors flex items-center gap-1 group/btn"
                 >
                   {course.progress === 100 ? 'Rever Curso' : 'Continuar'} 
                   <span className="transform transition-transform group-hover/btn:translate-x-1">→</span>
                 </button>
               </div>
            </div>
          </div>
        ))}
        
        {myCourses.length === 0 && (
           <div className="col-span-full py-20 text-center">
             <div className="inline-flex p-6 bg-gray-50 rounded-full mb-4">
                <Clock size={40} className="text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-gray-700 mb-2">Nada por aqui ainda</h3>
             <p className="text-gray-500">Nenhum curso encontrado nesta categoria.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;