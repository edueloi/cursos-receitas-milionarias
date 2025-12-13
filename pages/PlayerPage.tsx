import React, { useState } from 'react';
import { Course, Lesson } from '../types';
import { ChevronLeft, Play, CheckCircle, Lock, ChevronDown, ChevronUp, Menu, X, FileText, MessageCircle, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';

interface PlayerPageProps {
  course: Course;
  onBack: () => void;
}

const PlayerPage: React.FC<PlayerPageProps> = ({ course, onBack }) => {
  const [activeModuleId, setActiveModuleId] = useState<string>(course.modules[0]?.id);
  const [activeLesson, setActiveLesson] = useState<Lesson>(course.modules[0]?.lessons[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'comments'>('overview');

  const toggleModule = (id: string) => {
    setActiveModuleId(activeModuleId === id ? '' : id);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-900 text-white">
      {/* Player Header (Focus Mode) */}
      <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 z-50 flex-shrink-0">
        <div className="flex items-center gap-4 max-w-[70%]">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
            title="Voltar ao Painel"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="border-l border-gray-700 pl-4">
            <h1 className="text-base font-semibold truncate">{course.title}</h1>
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
            className="p-2 border border-gray-700 rounded-md text-sm font-medium hover:bg-gray-800 hidden sm:block"
          >
            Compartilhar
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area (Video + Tabs) */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-100">
          
          {/* Cinema Mode Video Container */}
          <div className="bg-black w-full flex-shrink-0 relative group">
             <div className="aspect-video w-full max-h-[75vh] mx-auto bg-black flex items-center justify-center relative">
                {/* Mock Video Element */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={course.thumbnailUrl} 
                      alt="Poster" 
                      className="absolute inset-0 w-full h-full object-contain opacity-50"
                    />
                    <button className="relative z-20 bg-rm-gold hover:bg-rm-goldHover text-white rounded-full p-6 shadow-2xl hover:scale-110 transition-transform">
                      <Play size={48} fill="currentColor" className="ml-1" />
                    </button>
                 </div>
                 
                 {/* Mobile Playlist Toggle Overlay (Visible only on small screens) */}
                 <button 
                   onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                   className="lg:hidden absolute top-4 right-4 z-30 bg-gray-900/80 text-white p-2 rounded-md backdrop-blur-sm"
                 >
                   <ListIcon isOpen={isSidebarOpen} />
                 </button>
             </div>
          </div>

          {/* Content Below Video */}
          <div className="flex-1 max-w-5xl mx-auto w-full p-6 lg:p-10">
             
             {/* Tabs Navigation */}
             <div className="flex border-b border-gray-300 mb-6">
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
                  label="Dúvidas (12)" 
                />
             </div>

             {/* Tab Content */}
             <div className="text-gray-800 animate-fade-in">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-rm-green mb-2">Sobre esta aula</h2>
                      <h3 className="text-xl font-bold mb-4">{activeLesson.title}</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Nesta aula, vamos abordar os principais conceitos necessários para você escalar suas vendas.
                        Prepare seu caderno de anotações e preste atenção aos detalhes práticos demonstrados.
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                       <h4 className="font-bold text-rm-green mb-3">O que você vai aprender</h4>
                       <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-rm-gold"/> Estratégias de precificação</li>
                          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-rm-gold"/> Como abordar clientes no Instagram</li>
                          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-rm-gold"/> Fechamento de vendas no WhatsApp</li>
                       </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'materials' && (
                  <div className="text-center py-10 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Nenhum material complementar anexado a esta aula.</p>
                  </div>
                )}

                {activeTab === 'comments' && (
                   <div className="space-y-6">
                      <div className="flex gap-4">
                         <div className="h-10 w-10 bg-rm-green text-white rounded-full flex items-center justify-center font-bold">EU</div>
                         <div className="flex-1">
                            <textarea 
                              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rm-gold outline-none"
                              placeholder="Tem alguma dúvida? Pergunte aqui..."
                              rows={3}
                            />
                            <div className="mt-2 flex justify-end">
                               <Button size="sm">Enviar Pergunta</Button>
                            </div>
                         </div>
                      </div>
                   </div>
                )}
             </div>

          </div>
        </div>

        {/* Right Sidebar (Course Content) - Collapsible */}
        <div 
          className={`
            fixed inset-y-0 right-0 z-40 bg-white border-l border-gray-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 w-80 lg:w-96 flex flex-col
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:mr-[-24rem]'}
          `}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
             <h3 className="font-bold text-gray-800 text-sm">Conteúdo do Curso</h3>
             <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
               <X size={20} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto">
             {course.modules.map((module, idx) => (
                <div key={module.id} className="border-b border-gray-100">
                   <button 
                      onClick={() => toggleModule(module.id)}
                      className="w-full px-4 py-4 flex items-start justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                   >
                      <div className="flex-1 pr-2">
                         <h4 className="font-bold text-gray-800 text-sm mb-1">Seção {idx + 1}: {module.title}</h4>
                         <div className="text-xs text-gray-500">0 / {module.lessons.length} | 45min</div>
                      </div>
                      {activeModuleId === module.id ? <ChevronUp size={16} className="text-gray-400 mt-1" /> : <ChevronDown size={16} className="text-gray-400 mt-1" />}
                   </button>

                   {activeModuleId === module.id && (
                      <div className="bg-white">
                         {module.lessons.map((lesson) => (
                            <button 
                               key={lesson.id}
                               onClick={() => setActiveLesson(lesson)}
                               className={`
                                  w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50
                                  ${activeLesson.id === lesson.id ? 'bg-blue-50/50' : ''}
                               `}
                            >
                               <div className="mt-0.5">
                                  {lesson.completed 
                                    ? <div className="bg-rm-gold text-white rounded-full p-0.5"><CheckCircle size={14} /></div>
                                    : <div className={`h-4 w-4 rounded-full border-2 ${activeLesson.id === lesson.id ? 'border-gray-800' : 'border-gray-300'}`}></div>
                                  }
                               </div>
                               <div className="flex-1">
                                  <p className={`text-sm ${activeLesson.id === lesson.id ? 'font-bold text-rm-green' : 'text-gray-600'}`}>
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
       flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors
       ${isActive ? 'border-rm-gold text-rm-green' : 'border-transparent text-gray-500 hover:text-gray-800'}
     `}
   >
      <Icon size={18} />
      {label}
   </button>
);

const ListIcon = ({ isOpen }: { isOpen: boolean }) => (
  isOpen ? <X size={20} /> : <Menu size={20} />
);

export default PlayerPage;