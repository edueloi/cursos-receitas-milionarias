import React, { useState } from 'react';
import { Course, User } from '../types';
import { Play, Star, Clock, Trophy, BookOpen, Search, PlayCircle, CheckCircle, Heart, Layers, ArrowRight } from 'lucide-react';

interface MyCoursesPageProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  user?: User | null;
  myCourseIds?: string[];
  favoriteIds?: string[];
  onToggleFavorite?: (course: Course) => void;
}

const MyCoursesPage: React.FC<MyCoursesPageProps> = ({ courses, onSelectCourse, user, myCourseIds = [], favoriteIds = [], onToggleFavorite }) => {
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'favorites'>('in-progress');
  const [search, setSearch] = useState('');

  const baseCourses = courses.filter(c =>
    c.status === 'published' || (c.status === 'draft' && user && user.email === c.creatorEmail)
  );
  const visibleCourses = baseCourses.filter(c =>
    myCourseIds.includes(c.id) || (user && user.email === c.creatorEmail)
  );

  const filteredByTab = visibleCourses.filter(c => {
    const progress = typeof c.progress === 'number' ? c.progress : 0;
    if (activeTab === 'in-progress') return progress < 100;
    if (activeTab === 'completed') return progress === 100;
    return favoriteIds.includes(c.id);
  });

  const myCourses = filteredByTab.filter(c =>
    !search.trim() || c.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  const totalLessons = (course: Course) => course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  // Stats
  const inProgressCount = visibleCourses.filter(c => (c.progress || 0) < 100).length;
  const completedCount = visibleCourses.filter(c => c.progress === 100).length;
  const favCount = visibleCourses.filter(c => favoriteIds.includes(c.id)).length;

  const tabs = [
    { id: 'in-progress', label: 'Em Andamento', labelShort: 'Andamento', icon: Clock, count: inProgressCount, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'completed', label: 'Concluídos', labelShort: 'Concluídos', icon: Trophy, count: completedCount, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'favorites', label: 'Favoritos', labelShort: 'Favoritos', icon: Heart, count: favCount, color: 'text-pink-500', bg: 'bg-pink-50' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 max-w-[1600px] mx-auto w-full">
      
      {/* Hero Header */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-rm-green/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-rm-green/10 rounded-xl text-rm-green">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 tracking-tight">Minha Jornada</h2>
              </div>
              <p className="text-sm text-gray-500">Continue de onde parou e conquiste novos conhecimentos.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border transition-all ${
                    activeTab === tab.id 
                      ? `${tab.bg} border-current ${tab.color} shadow-sm scale-[1.02]` 
                      : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="text-lg sm:text-xl font-bold mt-1">{tab.count}</span>
                  <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider hidden sm:block">{tab.labelShort}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Tabs */}
          <div className="flex border-b sm:border-b-0 sm:border-r border-gray-100 overflow-x-auto scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 sm:border-b-0 sm:border-l-2 shrink-0 ${
                  activeTab === tab.id 
                    ? `border-rm-gold ${tab.color} bg-gray-50/50` 
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.labelShort}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? `${tab.bg} ${tab.color}` : 'bg-gray-100 text-gray-400'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar nos meus cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 text-sm outline-none bg-transparent placeholder-gray-400 focus:bg-gray-50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
        {myCourses.map(course => {
          const progress = course.progress || 0;
          const isComplete = progress === 100;
          const isFav = favoriteIds.includes(course.id);
          const lessons = totalLessons(course);
          
          return (
            <div 
              key={course.id} 
              className="group bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden flex flex-col h-full"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img 
                  src={course.thumbnailUrl || 'https://via.placeholder.com/600x338?text=Sem+Capa'} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onSelectCourse(course)}
                    className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-xl"
                  >
                    <Play size={24} fill="white" className="text-white ml-1" />
                  </button>
                </div>

                {/* Favorite button */}
                {onToggleFavorite && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(course); }}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
                      isFav 
                        ? 'bg-pink-500/90 text-white shadow-lg shadow-pink-500/20' 
                        : 'bg-black/30 text-white/80 hover:bg-pink-500/80 hover:text-white'
                    }`}
                  >
                    <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                )}

                {/* Completed badge */}
                {isComplete && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                    <CheckCircle size={12} /> Concluído
                  </div>
                )}

                {/* Progress bar on image */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <div 
                    className={`h-full transition-all duration-1000 ${isComplete ? 'bg-emerald-400' : 'bg-rm-gold'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                {/* Category + Creator */}
                <div className="flex items-center gap-2 mb-2">
                  {course.category && (
                    <span className="text-[10px] font-bold text-rm-gold uppercase tracking-wider bg-rm-gold/10 px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {progress}% concluído
                  </span>
                </div>

                <h3 className="font-bold text-gray-800 text-base sm:text-lg leading-snug mb-2 line-clamp-2 group-hover:text-rm-green transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                  {course.description || 'Sem descrição disponível.'}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400 mb-4 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} className="text-rm-gold" />
                    <span>{course.modules.length} Módulos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PlayCircle size={14} className="text-blue-400" />
                    <span>{lessons} Aulas</span>
                  </div>
                  {course.totalDuration && course.totalDuration !== '0h 0m' && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" />
                      <span>{course.totalDuration}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isComplete ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-rm-gold to-yellow-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action */}
                <button 
                  onClick={() => onSelectCourse(course)}
                  className={`w-full py-2.5 sm:py-3 text-center text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isComplete 
                      ? 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-rm-green' 
                      : 'bg-gradient-to-r from-rm-green to-[#0f241e] text-white shadow-md shadow-rm-green/15 hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isComplete ? (
                    <><Trophy size={16} /> Rever Curso</>
                  ) : (
                    <><Play size={16} /> Continuar Assistindo</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty States */}
      {myCourses.length === 0 && (
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-dashed border-gray-300 mt-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            {activeTab === 'in-progress' && <Clock size={28} />}
            {activeTab === 'completed' && <Trophy size={28} />}
            {activeTab === 'favorites' && <Heart size={28} />}
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            {activeTab === 'in-progress' && 'Nenhum curso em andamento'}
            {activeTab === 'completed' && 'Nenhum curso concluído'}
            {activeTab === 'favorites' && 'Nenhum favorito ainda'}
          </h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto px-4">
            {activeTab === 'in-progress' && 'Explore o catálogo e comece seu primeiro curso!'}
            {activeTab === 'completed' && 'Continue estudando para concluir seus cursos.'}
            {activeTab === 'favorites' && 'Marque cursos como favorito para encontrá-los aqui.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;
