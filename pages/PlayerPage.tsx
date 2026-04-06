import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, User } from '../types';
import { ChevronLeft, Play, CheckCircle, ChevronDown, ChevronUp, Menu, X, FileText, MessageCircle, BookOpen, Clock, Download, Send, Edit3, Trash2, Award, Share2, ListVideo } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'comments'>('overview');
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth >= 1024) setIsSidebarOpen(true);
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setVideoError(null);
    setHasMarkedHalf(!!activeLesson?.completed);
  }, [activeLesson]);

  useEffect(() => {
    const firstModule = course.modules[0];
    setActiveModuleId(firstModule?.id || '');
    setActiveLesson(firstModule?.lessons?.[0] || null);
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

  const handleSendQuestion = async () => {
    if (!user?.email || !questionText.trim()) return;
    try {
      const created = await api.addQuestion(course.id, user.email, user.name, questionText.trim());
      setQuestions(prev => [...prev, created]);
      setQuestionText('');
    } catch (error) { console.error('Erro ao criar pergunta:', error); }
  };

  const handleSendAnswer = async (questionId: string) => {
    if (!user?.email || !isOwner) return;
    const text = replyMap[questionId]?.trim();
    if (!text) return;
    try {
      const resposta = await api.addAnswer(course.id, questionId, user.email, user.name, text);
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, respostas: [...(q.respostas || []), resposta] } : q));
      setReplyMap(prev => ({ ...prev, [questionId]: '' }));
    } catch (error) { console.error('Erro ao responder:', error); }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await api.deleteQuestion(course.id, questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (error) { console.error('Erro ao excluir pergunta:', error); }
  };

  const handleEditQuestion = async (questionId: string) => {
    if (!editText.trim()) return;
    try {
      const updated = await api.updateQuestion(course.id, questionId, editText.trim());
      setQuestions(prev => prev.map(q => q.id === questionId ? updated : q));
      setEditId(null);
      setEditText('');
    } catch (error) { console.error('Erro ao editar pergunta:', error); }
  };

  const toggleModule = (id: string) => {
    setActiveModuleId(activeModuleId === id ? '' : id);
  };

  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setIsPlaying(true);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    // Scroll to video on mobile
    videoContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Current lesson index info
  const currentLessonInfo = (() => {
    let lessonNum = 0;
    let totalLessons = 0;
    let currentModTitle = '';
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        totalLessons++;
        if (les.id === activeLesson?.id) {
          lessonNum = totalLessons;
          currentModTitle = mod.title;
        }
      }
    }
    return { lessonNum, totalLessons, currentModTitle };
  })();

  const completedCount = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0);
  const progressPercent = currentLessonInfo.totalLessons > 0 ? Math.round((completedCount / currentLessonInfo.totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0a0a0f] text-white font-sans">
      
      {/* Premium Header */}
      <header className="h-14 sm:h-16 bg-[#0f0f18]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 sm:px-5 z-50 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button 
            onClick={onBack} 
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xs sm:text-sm font-bold truncate text-white/90">{course.title}</h1>
            <p className="text-[10px] text-white/40 truncate mt-0.5 sm:hidden">
              Aula {currentLessonInfo.lessonNum}/{currentLessonInfo.totalLessons}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Progress - Desktop */}
          <div className="hidden md:flex items-center gap-3 mr-2">
            <div className="text-right">
              <p className="text-[10px] text-white/40 font-medium">Progresso</p>
              <p className="text-xs font-bold text-rm-gold">{progressPercent}%</p>
            </div>
            <div className="w-24 lg:w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rm-gold to-yellow-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Share - hidden on small mobile */}
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 border border-white/10 rounded-lg hover:bg-white/5 hover:text-white/80 transition-colors">
            <Share2 size={14} /> <span className="hidden lg:inline">Compartilhar</span>
          </button>
          
          {/* Sidebar Toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-white/60 hover:text-rm-gold hover:bg-white/5 rounded-lg transition-colors lg:hidden"
          >
            {isSidebarOpen ? <X size={22} /> : <ListVideo size={22} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto w-full" ref={videoContainerRef}>
          
          {/* Video Container */}
          <div className="bg-black w-full flex-shrink-0 relative group">
            <div className="aspect-video w-full max-h-[80vh] mx-auto bg-black flex items-center justify-center relative">
              
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
                    onError={() => setVideoError('Não foi possível carregar o vídeo.')}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {course.thumbnailUrl && (
                    <img 
                      src={course.thumbnailUrl} 
                      alt="Poster" 
                      className="absolute inset-0 w-full h-full object-cover opacity-30 blur-md scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
                  
                  <div className="relative z-20 flex flex-col items-center gap-4 sm:gap-6">
                    <button 
                      onClick={() => setIsPlaying(true)}
                      className="bg-gradient-to-br from-rm-gold to-yellow-600 hover:from-yellow-500 hover:to-rm-gold text-white rounded-full p-4 sm:p-5 md:p-6 shadow-2xl shadow-rm-gold/30 hover:scale-110 hover:shadow-rm-gold/50 transition-all active:scale-95"
                    >
                      <Play fill="currentColor" className="ml-0.5 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                    </button>
                    <div className="text-center px-4">
                      <p className="text-white/90 font-bold text-sm sm:text-base md:text-lg">{activeLesson?.title || 'Selecione uma aula'}</p>
                      <p className="text-white/40 text-xs mt-1">Clique para reproduzir</p>
                    </div>
                  </div>
                </div>
              )}

              {videoError && (
                <div className="absolute inset-x-4 bottom-4 text-center text-sm text-white bg-red-500/80 backdrop-blur-md px-4 py-3 rounded-xl">
                  {videoError}
                </div>
              )}
            </div>
          </div>

          {/* Content Below Video */}
          <div className="flex-1 bg-gray-50 min-h-0">
            <div className="max-w-5xl mx-auto w-full">
              
              {/* Lesson Info Bar - Mobile optimized */}
              <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-rm-gold uppercase tracking-widest bg-rm-gold/10 px-2 py-0.5 rounded">
                        Aula {currentLessonInfo.lessonNum}
                      </span>
                      {activeLesson?.duration && activeLesson.duration !== '00:00' && (
                        <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {activeLesson.duration}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mt-1 leading-tight truncate">
                      {activeLesson?.title || 'Sem aula selecionada'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{currentLessonInfo.currentModTitle}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {activeLesson?.id && !activeLesson.completed && (
                      <button
                        onClick={() => onMarkLessonComplete?.(course.id, activeLesson.id)}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rm-green to-[#0f241e] shadow-md shadow-rm-green/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        <CheckCircle size={14} /> <span className="hidden sm:inline">Marcar como</span> Concluída
                      </button>
                    )}
                    {activeLesson?.completed && (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100">
                        <CheckCircle size={14} /> Concluída
                      </div>
                    )}
                    {/* Mobile progress pill */}
                    <div className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                      <Award size={14} className="text-rm-gold" />
                      <span className="text-xs font-bold text-gray-700">{progressPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8">
                <div className="flex gap-0 overflow-x-auto scrollbar-none -mb-px">
                  <TabButton isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={BookOpen} label="Visão Geral" />
                  <TabButton isActive={activeTab === 'materials'} onClick={() => setActiveTab('materials')} icon={FileText} label="Materiais" count={activeLesson?.attachments?.length} />
                  <TabButton isActive={activeTab === 'comments'} onClick={() => setActiveTab('comments')} icon={MessageCircle} label="Dúvidas" count={questions.length} />
                </div>
              </div>

              {/* Tab Content */}
              <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-10 animate-fade-in">
                
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {activeLesson?.description && (
                      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <BookOpen size={16} className="text-rm-green" /> Sobre esta Aula
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                          {activeLesson.description}
                        </p>
                      </div>
                    )}

                    {(activeLesson?.learningObjectives?.length || 0) > 0 && (
                      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Award size={16} className="text-rm-gold" /> O que você vai aprender
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {activeLesson?.learningObjectives?.map((item, idx) => (
                            <div key={`${activeLesson.id}-obj-${idx}`} className="flex items-start gap-2.5 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                              <div className="w-5 h-5 bg-rm-gold/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <CheckCircle size={12} className="text-rm-gold" />
                              </div>
                              <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!activeLesson?.description && (activeLesson?.learningObjectives?.length || 0) === 0 && (
                      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <BookOpen size={32} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-400">Nenhuma informação adicional para esta aula.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="space-y-3">
                    {activeLesson?.attachments && activeLesson.attachments.length > 0 ? (
                      activeLesson.attachments.map(att => (
                        <div key={att.id} className="flex items-center gap-3 sm:gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-rm-gold/30 hover:shadow-sm transition-all group">
                          <div className="p-2.5 sm:p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-100 transition-colors shrink-0">
                            <FileText size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-rm-green transition-colors">{att.name}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{att.size} • {att.type.toUpperCase()}</p>
                          </div>
                          <a 
                            href={att.url} 
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-rm-green hover:text-white hover:border-rm-green transition-all shrink-0" 
                            download
                          >
                            <Download size={14} /> <span className="hidden sm:inline">Baixar</span>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-400 font-medium">Nenhum material complementar</p>
                        <p className="text-xs text-gray-300 mt-1">Esta aula não possui arquivos anexados.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-5">
                    {/* Question Input */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                      <div className="flex gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 bg-gradient-to-br from-rm-green to-[#0f241e] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <textarea 
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rm-gold/20 focus:border-rm-gold outline-none transition-all bg-gray-50/50 resize-none placeholder-gray-400"
                            placeholder="Tem alguma dúvida? Pergunte aqui..."
                            rows={3}
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                          />
                          <div className="mt-2 flex justify-end">
                            <button 
                              onClick={handleSendQuestion}
                              disabled={!questionText.trim()}
                              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rm-green to-[#0f241e] rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                              <Send size={14} /> Enviar Pergunta
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {questions.length === 0 && (
                      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <MessageCircle size={32} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-sm text-gray-400">Nenhuma dúvida publicada ainda.</p>
                        <p className="text-xs text-gray-300 mt-1">Seja o primeiro a perguntar!</p>
                      </div>
                    )}

                    {questions.map(q => {
                      const canDelete = isOwner || (user?.email && q.autorEmail === user.email);
                      const canEdit = user?.email && q.autorEmail === user.email;
                      return (
                        <div key={q.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                          <div className="p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="h-8 w-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                  {q.autorNome?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-800">{q.autorNome}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString('pt-BR') : ''}
                                  </p>
                                  {editId === q.id ? (
                                    <textarea
                                      className="w-full border border-gray-200 rounded-xl p-3 text-sm mt-2 focus:ring-2 focus:ring-rm-gold/20 outline-none"
                                      rows={2}
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                    />
                                  ) : (
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{q.texto}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {canEdit && editId !== q.id && (
                                  <button className="p-1.5 text-gray-400 hover:text-rm-green hover:bg-gray-50 rounded-lg transition-colors" onClick={() => { setEditId(q.id); setEditText(q.texto); }}>
                                    <Edit3 size={14} />
                                  </button>
                                )}
                                {canEdit && editId === q.id && (
                                  <button className="px-2 py-1 text-xs text-white bg-rm-green rounded-lg font-bold" onClick={() => handleEditQuestion(q.id)}>Salvar</button>
                                )}
                                {canDelete && (
                                  <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleDeleteQuestion(q.id)}>
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Answers */}
                          {(q.respostas || []).length > 0 && (
                            <div className="mx-4 sm:mx-5 mb-4 space-y-2">
                              {q.respostas.map((r: any) => (
                                <div key={r.id} className="flex items-start gap-2.5 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                  <div className="h-6 w-6 bg-rm-green text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                    {r.autorNome?.charAt(0) || 'I'}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-rm-green">{r.autorNome} <span className="text-[10px] text-gray-400 font-normal ml-1">Instrutor</span></p>
                                    <p className="text-sm text-gray-700 mt-0.5">{r.texto}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Instructor Reply */}
                          {isOwner && (
                            <div className="px-4 sm:px-5 pb-4 flex gap-2">
                              <input
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green bg-gray-50 placeholder-gray-400"
                                placeholder="Responder como instrutor..."
                                value={replyMap[q.id] || ''}
                                onChange={(e) => setReplyMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                              />
                              <button 
                                onClick={() => handleSendAnswer(q.id)}
                                className="px-3 py-2 bg-rm-green text-white rounded-xl text-xs font-bold hover:bg-[#0f241e] transition-colors shrink-0"
                              >
                                <Send size={14} />
                              </button>
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
        </div>

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden absolute inset-0 bg-black/60 z-30 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Right Sidebar - Course Content */}
        <div 
          className={`
            absolute inset-y-0 right-0 z-40 bg-white border-l border-gray-200/80 shadow-2xl
            transform transition-transform duration-300 ease-out 
            w-[88vw] sm:w-[380px] lg:w-[340px] xl:w-[380px] flex flex-col 
            lg:relative lg:translate-x-0 lg:shadow-none
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <ListVideo size={18} className="text-rm-green" />
              <h3 className="font-bold text-gray-800 text-sm">Conteúdo do Curso</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {completedCount}/{currentLessonInfo.totalLessons}
              </span>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Progress Bar in sidebar */}
          <div className="h-1 bg-gray-100">
            <div className="h-full bg-gradient-to-r from-rm-gold to-yellow-400 transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto">
            {course.modules.map((module, idx) => {
              const modCompleted = module.lessons.filter(l => l.completed).length;
              return (
                <div key={module.id} className="border-b border-gray-100">
                  <button 
                    onClick={() => toggleModule(module.id)}
                    className={`w-full px-4 py-3.5 flex items-start justify-between transition-colors text-left ${
                      activeModuleId === module.id ? 'bg-gray-50' : 'bg-white hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex-1 pr-2 min-w-0">
                      <h4 className="font-bold text-gray-800 text-xs sm:text-sm leading-tight">
                        Seção {idx + 1}: {module.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400 font-medium">
                          {modCompleted}/{module.lessons.length} aulas
                        </span>
                        <div className="flex-1 max-w-[80px] h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rm-gold rounded-full transition-all"
                            style={{ width: module.lessons.length > 0 ? `${(modCompleted / module.lessons.length) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={`p-1 rounded transition-transform ${activeModuleId === module.id ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} className={activeModuleId === module.id ? 'text-rm-gold' : 'text-gray-400'} />
                    </div>
                  </button>

                  {activeModuleId === module.id && (
                    <div className="bg-gray-50/30">
                      {module.lessons.map((lesson) => (
                        <button 
                          key={lesson.id}
                          onClick={() => selectLesson(lesson)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-[3px]
                            ${activeLesson?.id === lesson.id 
                              ? 'bg-rm-green/5 border-rm-green' 
                              : 'border-transparent hover:bg-white/80'}
                          `}
                        >
                          <div className="shrink-0">
                            {lesson.completed 
                              ? <div className="w-5 h-5 bg-rm-gold text-white rounded-full flex items-center justify-center"><CheckCircle size={12} /></div>
                              : <div className={`w-5 h-5 rounded-full border-2 transition-colors flex items-center justify-center ${
                                  activeLesson?.id === lesson.id ? 'border-rm-green bg-rm-green' : 'border-gray-300'
                                }`}>
                                  {activeLesson?.id === lesson.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs sm:text-sm leading-tight ${
                              activeLesson?.id === lesson.id ? 'font-bold text-rm-green' : 'text-gray-600'
                            }`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Play size={9} className="text-gray-400" />
                              <span className="text-[10px] text-gray-400">{lesson.duration}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

const TabButton = ({ isActive, onClick, icon: Icon, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap shrink-0
      ${isActive 
        ? 'border-rm-gold text-rm-green' 
        : 'border-transparent text-gray-400 hover:text-gray-700'}
    `}
  >
    <Icon size={16} className={isActive ? 'text-rm-gold' : 'text-gray-400'} />
    {label}
    {count > 0 && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
        isActive ? 'bg-rm-gold/10 text-rm-gold' : 'bg-gray-100 text-gray-400'
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default PlayerPage;
