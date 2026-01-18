import React, { useMemo, useState } from 'react';
import { Course, User } from '../types';
import { Clock, PlayCircle, Search, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';

interface CoursesPageProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  user?: User | null;
  myCourseIds?: string[];
  onAddToMyCourses?: (course: Course) => void;
}

const CoursesPage: React.FC<CoursesPageProps> = ({ courses, onSelectCourse, user, myCourseIds = [], onAddToMyCourses }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  // Logic: Show published courses OR drafts ONLY if the logged user is the creator
  const visibleCourses = courses.filter(c => 
    c.status === 'published' || 
    (c.status === 'draft' && user && user.email === c.creatorEmail)
  );

  const categories = useMemo(() => {
    const list = visibleCourses
      .map(c => c.category || 'Geral')
      .filter(Boolean);
    return ['Todas', ...Array.from(new Set(list))];
  }, [visibleCourses]);

  const filteredCourses = visibleCourses.filter(c => {
    const matchesCategory = category === 'Todas' || (c.category || 'Geral') === category;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term ||
      c.title.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      (c.category || '').toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-rm-green mb-2">Catálogo de Cursos</h2>
        <p className="text-gray-600">Explore novos conhecimentos para escalar suas vendas.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rm-gold"
              placeholder="Pesquisar por nome, categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="min-w-[200px]">
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-rm-gold"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredCourses.map((course) => (
          <div 
            key={course.id}
            className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border flex flex-col h-full ${course.status === 'draft' ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-100'}`}
          >
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img 
                src={course.thumbnailUrl || 'https://via.placeholder.com/400x300?text=Sem+Capa'} 
                alt={course.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-rm-green text-xs font-bold rounded">
                  {course.category || 'Geral'}
                </span>
                {course.status === 'draft' && (
                  <span className="px-2 py-1 bg-yellow-400 text-black text-xs font-bold rounded flex items-center gap-1">
                    <EyeOff size={10} /> Rascunho
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-serif font-bold text-rm-green mb-2 group-hover:text-rm-gold transition-colors line-clamp-1">
                {course.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">
                {course.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{course.totalDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle size={16} />
                  <span>{course.modules.length} Módulos</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => onSelectCourse(course)}
                  variant="primary"
                  className="w-full justify-center"
                >
                  {course.status === 'draft' ? 'Pré-visualizar' : 'Começar Agora'}
                </Button>
                {onAddToMyCourses && (
                  <Button
                    onClick={() => onAddToMyCourses(course)}
                    variant="outline"
                    className="w-full justify-center"
                    disabled={myCourseIds.includes(course.id)}
                  >
                    {myCourseIds.includes(course.id) ? 'Já está nos meus cursos' : 'Adicionar aos meus cursos'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredCourses.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
             <p className="text-gray-500">Nenhum curso encontrado com estes filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
