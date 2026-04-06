import React, { useMemo, useState } from 'react';
import { Course, User } from '../types';
import { Clock, PlayCircle, Search, EyeOff, BookOpen, Filter, ChevronDown, Layers, Star, Plus, Check } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);

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

  const totalLessons = (course: Course) => course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const isEnrolled = (id: string) => myCourseIds.includes(id);

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 max-w-[1600px] mx-auto w-full">

      {/* Hero Header */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rm-green/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-rm-green/10 rounded-xl text-rm-green">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 tracking-tight">Catálogo de Cursos</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-500 max-w-lg">
                Explore novos conhecimentos e habilidades para transformar seus resultados.
              </p>
            </div>

            {/* Stats Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <Layers size={16} className="text-rm-gold" />
                <span className="text-sm font-bold text-gray-700">{visibleCourses.length}</span>
                <span className="text-xs text-gray-400">cursos</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <Star size={16} className="text-yellow-500" />
                <span className="text-sm font-bold text-gray-700">{categories.length - 1}</span>
                <span className="text-xs text-gray-400">categorias</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green focus:bg-white transition-all placeholder-gray-400"
              placeholder="Pesquisar cursos por nome, categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Select - Desktop */}
          <div className="hidden sm:block min-w-[200px]">
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green transition-all appearance-none cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filter Toggle - Mobile */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Filter size={16} />
            Filtrar
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Category Pills */}
        {showFilters && (
          <div className="sm:hidden flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  category === cat 
                    ? 'bg-rm-green text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Desktop Category Pills inline */}
        {categories.length > 2 && (
          <div className="hidden sm:flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  category === cat 
                    ? 'bg-rm-green text-white shadow-sm' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Course Grid - Fully Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
        {filteredCourses.map((course) => {
          const enrolled = isEnrolled(course.id);
          const lessons = totalLessons(course);
          return (
            <div 
              key={course.id}
              className={`group bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border flex flex-col h-full ${
                course.status === 'draft' 
                  ? 'border-yellow-200 ring-1 ring-yellow-100' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                <img 
                  src={course.thumbnailUrl || 'https://via.placeholder.com/600x338?text=Sem+Capa'} 
                  alt={course.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-rm-green text-[10px] font-bold rounded-full tracking-wide uppercase">
                    {course.category || 'Geral'}
                  </span>
                  {course.status === 'draft' && (
                    <span className="px-2.5 py-1 bg-yellow-400/90 backdrop-blur-sm text-yellow-900 text-[10px] font-bold rounded-full flex items-center gap-1 uppercase tracking-wide">
                      <EyeOff size={10} /> Rascunho
                    </span>
                  )}
                </div>
                {/* Enrolled indicator */}
                {enrolled && (
                  <div className="absolute top-3 right-3 z-20">
                    <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
                {/* Play overlay on hover */}
                <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                    <PlayCircle size={28} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                {/* Creator */}
                {course.creatorName && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    por {course.creatorName}
                  </p>
                )}
                <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-snug mb-2 line-clamp-2 group-hover:text-rm-green transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
                  {course.description || 'Sem descrição disponível.'}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mb-4 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <PlayCircle size={14} className="text-rm-gold" />
                    <span>{course.modules.length} Módulos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={14} className="text-blue-400" />
                    <span>{lessons} Aulas</span>
                  </div>
                  {course.totalDuration && course.totalDuration !== '0h 0m' && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" />
                      <span>{course.totalDuration}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => onSelectCourse(course)}
                    className="flex-1 py-2.5 sm:py-3 text-center text-sm font-bold text-white bg-gradient-to-r from-rm-green to-[#0f241e] rounded-xl shadow-md shadow-rm-green/15 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    {course.status === 'draft' ? 'Pré-visualizar' : 'Começar Agora'}
                  </button>
                  {onAddToMyCourses && !enrolled && (
                    <button
                      onClick={() => onAddToMyCourses(course)}
                      className="p-2.5 sm:p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-rm-green rounded-xl transition-colors shrink-0"
                      title="Adicionar aos meus cursos"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                  {enrolled && (
                    <div
                      className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl shrink-0 cursor-default"
                      title="Já nos meus cursos"
                    >
                      <Check size={18} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-dashed border-gray-300 mt-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Nenhum curso encontrado</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto px-4">
            {search ? `Nenhum resultado para "${search}".` : 'Não há cursos disponíveis com esses filtros.'}
          </p>
          {(search || category !== 'Todas') && (
            <button 
              onClick={() => { setSearch(''); setCategory('Todas'); }}
              className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
