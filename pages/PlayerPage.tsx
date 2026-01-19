import React, { useState, useEffect } from 'react';
import { Course, Lesson, User } from '../types';
import { ChevronLeft, Play, CheckCircle, Lock, ChevronDown, ChevronUp, Menu, X, FileText, MessageCircle, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import { api } from '../services/api';

interface PlayerPageProps {
  course: Course;
  onBack: () => void;
  user?: User | null;
  onMarkLessonComplete?: (courseId: string, lessonId: string) => void;
}

const PlayerPage: React.FC<PlayerPageProps> = ({ course, onBack, user, onMarkLessonComplete }) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(course.modules[0]?.id || '');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(course.modules[0]?.lessons[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [hasMarkedHalf, setHasMarkedHalf] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // Default closed on mobile, open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Reset playing state when lesson changes
  useEffect(() => {
    setIsPlaying(false);
    setVideoError(null);
    setHasMarkedHalf(!!activeLesson?.completed);
  }, [activeLesson]);

  useEffect(() => {
    const firstModule = course.modules[0];
    const firstLesson = firstModule?.lessons?.[0] || null;
    setActiveModuleId(firstModule?.id || '');
    setActiveLesson(firstLesson);
  }, [course]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await api.getQuestions(course.id);
        setQuestions(data);
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
      }
    };
    loadQuestions();
  }, [course.id]);

  const isOwner = !!user?.email && user.email === course.creatorEmail;
  const activeObjectives = activeLesson?.learningObjectives || [];

  const handleSendQuestion = async () => {
    if (!user?.email || !questionText.trim()) return;
    try {
      const created = await api.addQuestion(course.id, user.email, user.name, questionText.trim());
      setQuestions(prev => [...prev, created]);
      setQuestionText('');
    } catch (error) {
      console.error('Erro ao criar pergunta:', error);
    }
  };

  const handleSendAnswer = async (questionId: string) => {
    if (!user?.email || !isOwner) return;
    const text = replyMap[questionId]?.trim();
    if (!text) return;
    try {
      const resposta = await api.addAnswer(course.id, questionId, user.email, user.name, text);
      setQuestions(prev =>
        prev.map(q => q.id === questionId ? { ...q, respostas: [...(q.respostas || []), resposta] } : q)
      );
      setReplyMap(prev => ({ ...prev, [questionId]: '' }));
    } catch (error) {
      console.error('Erro ao responder:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await api.deleteQuestion(course.id, questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error);
    }
  };

  const handleEditQuestion = async (questionId: string) => {
    if (!editText.trim()) return;
    try {
      const updated = await api.updateQuestion(course.id, questionId, editText.trim());
      setQuestions(prev => prev.map(q => q.id === questionId ? updated : q));
      setEditId(null);
      setEditText('');
    } catch (error) {
      console.error('Erro ao editar pergunta:', error);
    }
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'comments'>('overview');

  const toggleModule = (id: string) => {
    setActiveModuleId(activeModuleId === id ? '' : id);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-white font-sans">
      {/* Player Header (Focus Mode) */}
      <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-50 flex-shrink-0 relative shadow-md">
        <div className="flex items-center gap-3 md:gap-4 max-w-[70%]">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
            title="Voltar ao Painel"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="border-l border-gray-700 pl-3 md:pl-4 overflow-hidden">
            <h1 className="text-sm md:text-base font-semibold truncate text-gray-100">{course.title}</h1>
            <p className="text-[10px] text-gray-400 truncate md:hidden">Aula Atual: {activeLesson?.title || 'Sem aulas'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
             <div className="text-xs text-gray-400 mb-1">Seu Progresso</div>
             <div className="w-32 h-1.5 bg-gray-700 rounded-full">
                <div className="h-full bg-rm-gold rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
             </div>
          </div>
          <button 
            className="p-2 border border-gray-700 rounded-md text-sm font-medium hover:bg-gray-800 hidden sm:block transition-colors"
          >
            Compartilhar
          </button>
          
          {/* Mobile Menu Toggle */}
          <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="lg:hidden p-2 text-white hover:text-rm-gold transition-colors"
           >
             <ListIcon isOpen={isSidebarOpen} />
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area (Video + Tabs) */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-100 w-full">
          
          {/* Cinema Mode Video Container */}
          <div className="bg-black w-full flex-shrink-0 relative group">
             <div className="aspect-video w-full max-h-[75vh] mx-auto bg-black flex items-center justify-center relative">
                
                {/* Video Logic */}
                {isPlaying && activeLesson && activeLesson.videoUrl ? (
                  activeLesson.videoType === 'embed' ? (
                    <iframe 
                      src={`${activeLesson.videoUrl}?autoplay=1&modestbranding=1&rel=0`} 
                      title={activeLesson.title}
                      className="w-full h-full absolute inset-0 border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeLesson.videoUrl}
                      className="w-full h-full absolute inset-0"
                      controls
                      autoPlay
                      preload="metadata"
                      controlsList="nodownload noplaybackrate noremoteplayback"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                      onTimeUpdate={(e) => {
                        if (hasMarkedHalf || !activeLesson?.id || activeLesson.completed) return;
                        const target = e.currentTarget;
                        if (!target.duration || !isFinite(target.duration)) return;
                        if (target.currentTime >= target.duration * 0.5) {
                          setHasMarkedHalf(true);
                          onMarkLessonComplete?.(course.id, activeLesson.id);
                        }
                      }}
                      onEnded={() => {
                        if (!activeLesson?.id || activeLesson.completed) return;
                        setHasMarkedHalf(true);
                        onMarkLessonComplete?.(course.id, activeLesson.id);
                      }}
                      onError={() => setVideoError('Nao foi possivel carregar o video.')}
                    />
                  )
                ) : (
                  /* Placeholder / Start Screen */
                  <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={course.thumbnailUrl} 
                        alt="Poster" 
                        className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm"
                      />
                      <div className="absolute inset-0 bg-black/40"></div>
                      <button 
                        onClick={() => setIsPlaying(true)}
                        className="relative z-20 bg-rm-gold hover:bg-rm-goldHover text-white rounded-full p-4 md:p-6 shadow-2xl hover:scale-110 transition-transform group-hover:shadow-rm-gold/50"
                      >
                        <Play fill="currentColor" className="ml-1 w-8 h-8 md:w-12 md:h-12" />
                      </button>
                   </div>
                )}
                {videoError && (
                  <div className="absolute inset-x-0 bottom-4 text-center text-sm text-white bg-black/60 px-4 py-2">
                    {videoError}
                  </div>
                )}

             </div>
          </div>

          {/* Content Below Video */}
          <div className="flex-1 max-w-5xl mx-auto w-full p-4 lg:p-10 pb-20">
             
             {/* Tabs Navigation (Scrollable on mobile) */}
             <div className="flex border-b border-gray-300 mb-6 overflow-x-auto scrollbar-hide w-full">
                <TabButton 
                  isActive={activeTab === 'overview'} 
                  onClick={() => setActiveTab('overview')} 
                  icon={BookOpen} 
                  label="Visão Geral" 
                />
                <TabButton 
                  isActive={activeTab === 'materials'} 
                  onClick={() => setActiveTab('materials')} 
                  icon={FileText} 
                  label="Materiais" 
                />
                <TabButton 
                  isActive={activeTab === 'comments'} 
                  onClick={() => setActiveTab('comments')} 
                  icon={MessageCircle} 
                  label="Dúvidas" 
                />
             </div>

             {/* Tab Content */}
             <div className="text-gray-800 animate-fade-in px-1">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold text-rm-gold uppercase tracking-wider mb-2 block">Aula Atual</span>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-rm-green mb-4 leading-tight">{activeLesson?.title || 'Aula não cadastrada'}</h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                        {activeLesson?.description || 'Descrição não cadastrada para esta aula.'}
                    </p>
                    {activeLesson?.id && (
                      <button
                        onClick={() => onMarkLessonComplete?.(course.id, activeLesson.id)}
                        className="mt-4 px-4 py-2 rounded-lg text-sm font-bold text-white bg-rm-green hover:bg-[#0f241e]"
                      >
                        Marcar como concluída
                      </button>
                    )}
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                       <h4 className="font-bold text-rm-green mb-3 text-sm">O que você vai aprender</h4>
                       {activeObjectives.length > 0 ? (
                         <ul className="space-y-2 text-sm text-gray-600">
                           {activeObjectives.map((item, idx) => (
                             <li key={`${activeLesson?.id || 'lesson'}-${idx}`} className="flex items-center gap-2">
                               <CheckCircle size={16} className="text-rm-gold flex-shrink-0" /> {item}
                             </li>
                           ))}
                         </ul>
                       ) : (
                         <p className="text-sm text-gray-500">Nenhum objetivo cadastrado para esta aula.</p>
                       )}
                    </div>
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="space-y-4">
                    {activeLesson?.attachments && activeLesson.attachments.length > 0 ? (
                        activeLesson.attachments.map(att => (
                            <div key={att.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-rm-gold transition-colors cursor-pointer group">
                                <div className="p-3 bg-red-50 text-red-500 rounded-lg group-hover:bg-red-100 transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm group-hover:text-rm-green">{att.name}</h4>
                                    <p className="text-xs text-gray-400">{att.size} • {att.type.toUpperCase()}</p>
                                </div>
                                <a href={att.url} className="text-xs px-3 py-1.5 h-auto border border-gray-300 rounded-md text-gray-700 hover:border-rm-gold hover:text-rm-green" download>
                                  Baixar
                                </a>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-200">
                            <FileText size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Nenhum material complementar anexado a esta aula.</p>
                        </div>
                    )}
                  </div>
                )}

                {activeTab === 'comments' && (
                   <div className="space-y-6">
                      <div className="flex gap-4">
                         <div className="h-10 w-10 bg-rm-green text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                           {user?.name?.charAt(0) || 'U'}
                         </div>
                         <div className="flex-1">
                            <textarea 
                              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rm-gold outline-none transition-shadow"
                              placeholder="Tem alguma duvida? Pergunte aqui..."
                              rows={3}
                              value={questionText}
                              onChange={(e) => setQuestionText(e.target.value)}
                            />
                            <div className="mt-2 flex justify-end">
                               <Button size="sm" onClick={handleSendQuestion}>Enviar Pergunta</Button>
                            </div>
                         </div>
                      </div>

                      {questions.length === 0 && (
                        <div className="text-center pt-8">
                            <p className="text-sm text-gray-400">Nenhuma duvida publicada ainda.</p>
                        </div>
                      )}

                      {questions.map(q => {
                        const canDelete = isOwner || (user?.email && q.autorEmail === user.email);
                        const canEdit = user?.email && q.autorEmail === user.email;
                        return (
                          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-gray-800">{q.autorNome}</p>
                                {editId === q.id ? (
                                  <textarea
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm mt-2"
                                    rows={2}
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                  />
                                ) : (
                                  <p className="text-sm text-gray-600 mt-1">{q.texto}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {canEdit && editId !== q.id && (
                                  <button className="text-xs text-gray-500 hover:text-rm-green" onClick={() => { setEditId(q.id); setEditText(q.texto); }}>Editar</button>
                                )}
                                {canEdit && editId === q.id && (
                                  <button className="text-xs text-rm-green" onClick={() => handleEditQuestion(q.id)}>Salvar</button>
                                )}
                                {canDelete && (
                                  <button className="text-xs text-red-500" onClick={() => handleDeleteQuestion(q.id)}>Excluir</button>
                                )}
                              </div>
                            </div>

                            {(q.respostas || []).length > 0 && (
                              <div className="space-y-2 pl-4 border-l border-gray-200">
                                {q.respostas.map((r: any) => (
                                  <div key={r.id} className="text-sm text-gray-700">
                                    <span className="font-bold">{r.autorNome}:</span> {r.texto}
                                  </div>
                                ))}
                              </div>
                            )}

                            {isOwner && (
                              <div className="flex items-center gap-2">
                                <input
                                  className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                                  placeholder="Responder como instrutor..."
                                  value={replyMap[q.id] || ''}
                                  onChange={(e) => setReplyMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                                />
                                <Button size="sm" onClick={() => handleSendAnswer(q.id)}>Responder</Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                   </div>
                )}
             </div>

          </div>
        </div>

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
            <div 
                className="lg:hidden absolute inset-0 bg-black/60 z-30 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={() => setIsSidebarOpen(false)}
            />
        )}

        {/* Right Sidebar (Course Content) - Drawer */}
        <div 
          className={`
            absolute inset-y-0 right-0 z-40 bg-white border-l border-gray-200 shadow-2xl
            transform transition-transform duration-300 ease-out 
            w-[85vw] sm:w-96 lg:w-96 flex flex-col lg:relative lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:mr-[-24rem]'}
          `}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 flex-shrink-0 h-14">
             <h3 className="font-bold text-gray-800 text-sm">Conteúdo do Curso</h3>
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-red-500">
               <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {course.modules.map((module, idx) => (
                <div key={module.id} className="border-b border-gray-100">
                   <button 
                      onClick={() => toggleModule(module.id)}
                      className="w-full px-4 py-4 flex items-start justify-between bg-white hover:bg-gray-50 transition-colors text-left"
                   >
                      <div className="flex-1 pr-2">
                         <h4 className="font-bold text-gray-800 text-sm mb-1 leading-tight">Seção {idx + 1}: {module.title}</h4>
                         <div className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">
                             0 / {module.lessons.length} Aulas
                         </div>
                      </div>
                      {activeModuleId === module.id ? <ChevronUp size={16} className="text-rm-gold mt-1" /> : <ChevronDown size={16} className="text-gray-400 mt-1" />}
                   </button>

                   {activeModuleId === module.id && (
                      <div className="bg-gray-50/50">
                         {module.lessons.map((lesson) => (
                            <button 
                               key={lesson.id}
                               onClick={() => {
                                   setActiveLesson(lesson);
                                   setIsPlaying(true); // Auto play when selecting lesson
                                   if (window.innerWidth < 1024) setIsSidebarOpen(false); // Close on mobile selection
                               }}
                               className={`
                                  w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all border-l-4
                                  ${activeLesson?.id === lesson.id 
                                    ? 'bg-blue-50/60 border-rm-green' 
                                    : 'border-transparent hover:bg-gray-100'}
                               `}
                            >
                               <div className="mt-0.5 flex-shrink-0">
                                  {lesson.completed 
                                    ? <div className="bg-rm-gold text-white rounded-full p-0.5"><CheckCircle size={14} /></div>
                                    : <div className={`h-4 w-4 rounded-full border-2 transition-colors ${activeLesson?.id === lesson.id ? 'border-rm-green bg-rm-green' : 'border-gray-300'}`}></div>
                                  }
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className={`text-sm truncate ${activeLesson?.id === lesson.id ? 'font-bold text-rm-green' : 'text-gray-600'}`}>
                                     {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                     <Play size={10} className="text-gray-400" />
                                     <span className="text-xs text-gray-400">{lesson.duration}</span>
                                  </div>
                               </div>
                            </button>
                         ))}
                      </div>
                   )}
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const TabButton = ({ isActive, onClick, icon: Icon, label }: any) => (
   <button 
     onClick={onClick}
     className={`
       flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0
       ${isActive ? 'border-rm-gold text-rm-green bg-gray-50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'}
     `}
   >
      <Icon size={18} className={isActive ? 'text-rm-gold' : 'text-gray-400'} />
      {label}
   </button>
);

const ListIcon = ({ isOpen }: { isOpen: boolean }) => (
  isOpen ? <X size={24} /> : <Menu size={24} />
);

export default PlayerPage;
