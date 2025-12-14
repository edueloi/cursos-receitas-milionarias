import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Upload, Plus, X, Layout, List, Trash2, Video, 
  Clock, GripVertical, ChevronDown, ChevronRight, ArrowLeft, 
  FileText, Image as ImageIcon, Link as LinkIcon, Paperclip, Eye, CheckSquare, Layers 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Course, Module, Lesson, Attachment, User } from '../types';
import { ToastMessage } from '../components/ui/Toast';
import { api } from '../services/api';

interface AdminCourseCreateProps {
  initialData?: Course | null;
  currentUser: User | null; // Receive current user for ID
  onSave: (course: Course) => void;
  onCancel: () => void;
  onShowToast: (type: ToastMessage['type'], title: string, message?: string) => void;
}

const AdminCourseCreate: React.FC<AdminCourseCreateProps> = ({ initialData, currentUser, onSave, onCancel, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info');

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || '');
  const [category, setCategory] = useState(initialData?.category || 'Vendas');
  const [level, setLevel] = useState<Course['level']>(initialData?.level || 'Iniciante');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  
  const [modules, setModules] = useState<Module[]>(initialData?.modules || [
    { id: Date.now().toString(), title: 'Módulo 01: Introdução', lessons: [] }
  ]);
  
  // UI State for Accordions & Uploads
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [uploadingState, setUploadingState] = useState<{ id: string, type: string } | null>(null);

  // Hidden File Inputs Refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const lessonVideoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Temp refs to know which lesson triggered the upload
  const activeUploadContext = useRef<{ moduleId: string, lessonId: string } | null>(null);

  // Initialize expanded state for first module
  useEffect(() => {
    if (modules.length > 0 && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [modules[0].id]: true });
    }
  }, []);

  // --- File Upload Logic ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const userId = currentUser?.id || '0';

    // Set loading state based on type
    if (type === 'image') setUploadingState({ id: 'thumbnail', type: 'image' });
    else if (activeUploadContext.current) {
        setUploadingState({ id: activeUploadContext.current.lessonId, type });
    }

    try {
        const url = await api.uploadMedia(file, userId, type);
        
        if (type === 'image') {
            setThumbnailUrl(url);
            onShowToast('success', 'Imagem enviada', 'Capa do curso atualizada.');
        } else if (type === 'video' && activeUploadContext.current) {
            const { moduleId, lessonId } = activeUploadContext.current;
            updateLesson(moduleId, lessonId, { videoUrl: url, videoType: 'upload' });
            onShowToast('success', 'Vídeo enviado', 'Aula atualizada com sucesso.');
        } else if (type === 'document' && activeUploadContext.current) {
            const { moduleId, lessonId } = activeUploadContext.current;
            
            // Format size
            const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
            
            const newAttachment: Attachment = {
                id: Date.now().toString(),
                name: file.name,
                url: url,
                size: `${sizeInMB} MB`,
                type: 'pdf' // Generic type for icon
            };
            
            // Add attachment to lesson
            const module = modules.find(m => m.id === moduleId);
            const lesson = module?.lessons.find(l => l.id === lessonId);
            if (lesson) {
                const currentAttachments = lesson.attachments || [];
                updateLesson(moduleId, lessonId, { attachments: [...currentAttachments, newAttachment] });
            }
            onShowToast('success', 'Arquivo anexado', 'Material complementar adicionado.');
        }

    } catch (error) {
        onShowToast('error', 'Falha no upload', 'Não foi possível enviar o arquivo. Tente novamente.');
    } finally {
        setUploadingState(null);
        // Clear input so same file can be selected again
        e.target.value = '';
    }
  };

  const triggerThumbnailUpload = () => thumbnailInputRef.current?.click();
  
  const triggerLessonVideoUpload = (moduleId: string, lessonId: string) => {
      activeUploadContext.current = { moduleId, lessonId };
      lessonVideoInputRef.current?.click();
  };

  const triggerAttachmentUpload = (moduleId: string, lessonId: string) => {
      activeUploadContext.current = { moduleId, lessonId };
      attachmentInputRef.current?.click();
  };


  // --- Calculations & Save ---
  const calculateTotalDuration = () => {
    let totalMinutes = 0;
    modules.forEach(m => {
      m.lessons.forEach(l => {
        if (!l.duration) return;
        const parts = l.duration.split(':');
        if (parts.length === 2) {
          totalMinutes += parseInt(parts[0]) + (parseInt(parts[1]) / 60);
        }
      });
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const handleSave = () => {
    if (!title) {
        onShowToast('error', 'Erro ao Salvar', 'O campo Título do Curso é obrigatório.');
        return;
    }
    
    const newCourse: Course = {
      id: initialData?.id || Date.now().toString(),
      title,
      description,
      thumbnailUrl: thumbnailUrl || 'https://picsum.photos/800/600',
      modules,
      totalDuration: calculateTotalDuration(),
      progress: initialData?.progress || 0,
      status: initialData?.status || 'draft',
      category,
      level,
      price: parseFloat(price) || 0
    };

    onSave(newCourse);
  };

  // --- Module Management ---
  const addModule = () => {
    const newId = Date.now().toString();
    setModules([...modules, { 
      id: newId, 
      title: `Módulo ${String(modules.length + 1).padStart(2, '0')}: Novo Conteúdo`,
      description: '', 
      lessons: [] 
    }]);
    setExpandedModules(prev => ({ ...prev, [newId]: true }));
    onShowToast('info', 'Módulo Adicionado', 'Configure o nome e as aulas abaixo.');
  };

  const removeModule = (moduleId: string) => {
    if (confirm('Tem certeza? Isso apagará todas as aulas deste módulo.')) {
      setModules(modules.filter(m => m.id !== moduleId));
      onShowToast('warning', 'Módulo Removido');
    }
  };

  const updateModule = (moduleId: string, field: keyof Module, value: any) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, [field]: value } : m));
  };

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // --- Lesson Management ---
  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: 'Nova Aula',
      duration: '05:00',
      videoType: 'upload',
      isFreePreview: false,
      completed: false,
      attachments: []
    };
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    }));
    setEditingLessonId(newLesson.id);
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return { 
          ...m, 
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l) 
        };
      }
      return m;
    }));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    }));
  };

  // --- Attachments Logic ---
  const removeAttachment = (moduleId: string, lessonId: string, attachmentId: string) => {
    const module = modules.find(m => m.id === moduleId);
    const lesson = module?.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const currentAttachments = lesson.attachments || [];
    updateLesson(moduleId, lessonId, { 
      attachments: currentAttachments.filter(a => a.id !== attachmentId) 
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      
      {/* Hidden Inputs for File Uploads */}
      <input 
          type="file" 
          ref={thumbnailInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleFileUpload(e, 'image')} 
      />
      <input 
          type="file" 
          ref={lessonVideoInputRef} 
          className="hidden" 
          accept="video/*" 
          onChange={(e) => handleFileUpload(e, 'video')} 
      />
      <input 
          type="file" 
          ref={attachmentInputRef} 
          className="hidden" 
          accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg" 
          onChange={(e) => handleFileUpload(e, 'document')} 
      />

      {/* Top Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-16 z-30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-rm-green">
              {initialData ? 'Editor de Curso' : 'Criar Novo Curso'}
            </h1>
            <span className="text-xs text-rm-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
              {activeTab === 'info' ? <Layout size={12}/> : <List size={12}/>}
              {activeTab === 'info' ? 'Configurações & Capa' : 'Grade Curricular & Vídeos'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel}>Descartar</Button>
          <Button onClick={handleSave} className="px-8 shadow-lg shadow-rm-gold/20">
            <Save size={18} className="mr-2" />
            Salvar Curso
          </Button>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 animate-fade-in pb-20">
        
        {/* Modern Tabs */}
        <div className="flex justify-center mb-8">
           <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm inline-flex gap-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                  activeTab === 'info' 
                    ? 'bg-rm-green text-white shadow-md' 
                    : 'text-gray-500 hover:text-rm-green hover:bg-gray-50'
                }`}
              >
                <Layout size={18} />
                Informações Básicas
              </button>
              <button
                onClick={() => setActiveTab('curriculum')}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                  activeTab === 'curriculum' 
                    ? 'bg-rm-green text-white shadow-md' 
                    : 'text-gray-500 hover:text-rm-green hover:bg-gray-50'
                }`}
              >
                <List size={18} />
                Conteúdo & Aulas
              </button>
           </div>
        </div>

        {/* Content Area */}
        {activeTab === 'info' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6 relative overflow-hidden">
                {/* Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rm-gold to-rm-green"></div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Título do Curso</label>
                  <div className="relative">
                    <input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Mestre das Vendas no Instagram..."
                      className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-rm-gold/10 focus:border-rm-gold outline-none transition-all text-lg font-medium placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Descrição Completa</label>
                  <textarea 
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-rm-gold/10 focus:border-rm-gold outline-none transition-all text-sm leading-relaxed text-gray-600 resize-y"
                    placeholder="Descreva o que o afiliado irá aprender, os benefícios e os módulos..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Categoria</label>
                    <div className="relative">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-rm-gold/10 focus:border-rm-gold outline-none bg-white text-sm appearance-none cursor-pointer"
                      >
                        <option value="Vendas">Vendas & Marketing</option>
                        <option value="Gastronomia">Gastronomia</option>
                        <option value="Finanças">Finanças</option>
                        <option value="Mindset">Desenvolvimento Pessoal</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Nível de Dificuldade</label>
                    <div className="relative">
                      <select 
                        value={level}
                        onChange={(e) => setLevel(e.target.value as any)}
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-rm-gold/10 focus:border-rm-gold outline-none bg-white text-sm appearance-none cursor-pointer"
                      >
                        <option value="Iniciante">Iniciante</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Media & Price */}
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="font-serif font-bold text-rm-green text-lg mb-4 flex items-center gap-2">
                    <ImageIcon size={20} className="text-rm-gold" />
                    Capa do Curso
                  </h3>
                  
                  <div 
                    onClick={triggerThumbnailUpload}
                    className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 relative overflow-hidden group hover:border-rm-gold transition-colors cursor-pointer"
                  >
                     {uploadingState?.id === 'thumbnail' ? (
                        <div className="flex flex-col items-center">
                            <span className="animate-spin h-8 w-8 border-4 border-rm-gold border-t-transparent rounded-full mb-2"></span>
                            <span className="text-xs font-bold text-gray-500">Enviando...</span>
                        </div>
                     ) : thumbnailUrl ? (
                        <>
                          <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Alterar Imagem</span>
                          </div>
                        </>
                     ) : (
                        <div className="text-center p-4">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-rm-gold">
                             <Upload size={20} />
                          </div>
                          <span className="text-xs font-bold text-gray-400 uppercase">Upload ou URL</span>
                        </div>
                     )}
                  </div>
                  
                  <Input 
                    label="URL da Imagem"
                    placeholder="https://..." 
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="text-xs"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 text-center">Recomendado: 1280x720px (16:9)</p>
               </div>
               
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="font-serif font-bold text-rm-green text-lg mb-4">Precificação</h3>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Valor do Curso (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                    <input 
                      type="number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rm-gold outline-none font-mono text-lg font-bold text-gray-800"
                      placeholder="0.00" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex gap-3 items-start">
                     <div className="text-blue-500 mt-0.5"><CheckSquare size={16} /></div>
                     <p className="text-xs text-blue-700 leading-tight">
                       Para cursos exclusivos de afiliados, mantenha o valor em <strong>R$ 0,00</strong>.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-rm-green">Grade Curricular</h3>
                <p className="text-gray-500 text-sm">Estruture seus módulos e adicione aulas.</p>
              </div>
              <Button onClick={addModule} variant="secondary" className="shadow-md">
                <Plus size={18} className="mr-2" /> Adicionar Módulo
              </Button>
            </div>

            {modules.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm flex flex-col items-center">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <Layers size={40} />
                </div>
                <h4 className="text-xl font-bold text-gray-700 mb-2">Comece a construir seu curso</h4>
                <p className="text-gray-400 mb-6 max-w-md">Crie módulos para organizar suas aulas por temas.</p>
                <Button onClick={addModule} variant="outline" className="px-8">Criar Primeiro Módulo</Button>
              </div>
            )}

            <div className="space-y-6">
              {modules.map((module, index) => (
                <div key={module.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  
                  {/* Module Header (Draggable visual) */}
                  <div 
                    className={`
                      px-6 py-5 flex flex-col gap-2 cursor-pointer transition-colors border-l-4
                      ${expandedModules[module.id] ? 'bg-gray-50 border-rm-gold' : 'bg-white border-transparent hover:bg-gray-50'}
                    `}
                    onClick={() => toggleModuleExpand(module.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                       <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg transition-colors ${expandedModules[module.id] ? 'bg-rm-gold text-white' : 'bg-gray-100 text-gray-400'}`}>
                             {expandedModules[module.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </div>
                          
                          <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={module.title}
                              onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                              className="bg-transparent border-none focus:ring-0 text-lg font-bold text-gray-800 w-full hover:bg-white/50 rounded px-2 transition-colors placeholder-gray-400"
                              placeholder="Nome do Módulo"
                            />
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wide">
                            {module.lessons.length} Aulas
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeModule(module.id); }} 
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir Módulo"
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                  </div>

                  {/* Module Content (Lessons) */}
                  {expandedModules[module.id] && (
                    <div className="bg-white border-t border-gray-100 p-2">
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lIndex) => (
                          <div key={lesson.id} className="group">
                            {/* Lesson Summary Card */}
                            <div 
                              className={`
                                flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border border-transparent
                                ${editingLessonId === lesson.id 
                                  ? 'bg-blue-50/50 border-blue-100 shadow-inner' 
                                  : 'hover:bg-gray-50 hover:border-gray-200'}
                              `}
                              onClick={() => setEditingLessonId(editingLessonId === lesson.id ? null : lesson.id)}
                            >
                              <div className="text-gray-300 cursor-move hover:text-gray-500"><GripVertical size={20} /></div>
                              
                              <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors
                                ${lesson.videoUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
                              `}>
                                {lesson.videoUrl ? <Video size={14} /> : String(lIndex + 1).padStart(2, '0')}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${editingLessonId === lesson.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                   <span className="flex items-center gap-1"><Clock size={12} /> {lesson.duration}</span>
                                   {lesson.attachments && lesson.attachments.length > 0 && (
                                     <span className="flex items-center gap-1 text-rm-gold"><Paperclip size={12} /> {lesson.attachments.length} Anexos</span>
                                   )}
                                </div>
                              </div>
                              
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronDown size={18} className={`text-gray-400 transform transition-transform ${editingLessonId === lesson.id ? 'rotate-180' : ''}`} />
                              </div>
                            </div>

                            {/* Lesson Detail Editor (Slide Down) */}
                            {editingLessonId === lesson.id && (
                              <div className="mx-4 my-2 p-6 bg-white rounded-xl border border-gray-200 shadow-lg relative animate-fade-in z-10">
                                <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                                
                                <div className="space-y-6">
                                  {/* Top Row */}
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-8">
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Título da Aula</label>
                                      <input 
                                        value={lesson.title}
                                        onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rm-gold/50 outline-none text-sm font-semibold"
                                      />
                                    </div>
                                    <div className="md:col-span-4">
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Duração</label>
                                      <input 
                                        value={lesson.duration}
                                        onChange={(e) => updateLesson(module.id, lesson.id, { duration: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rm-gold/50 outline-none text-sm text-center"
                                        placeholder="00:00"
                                      />
                                    </div>
                                  </div>

                                  {/* Video Section */}
                                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                     <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                       <Video size={16} className="text-rm-gold" /> Origem do Vídeo
                                     </h4>
                                     
                                     {/* Layout fixed: flex-col on mobile, flex-row on sm+ */}
                                     <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                        {['upload', 'embed'].map((type) => (
                                          <button
                                            key={type}
                                            onClick={() => updateLesson(module.id, lesson.id, { videoType: type as any })}
                                            className={`
                                              flex-1 px-4 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2
                                              ${lesson.videoType === type 
                                                ? 'bg-rm-green text-white border-rm-green shadow-md ring-1 ring-rm-green/20' 
                                                : 'bg-white text-gray-500 border-gray-200 hover:bg-white hover:border-gray-300'}
                                            `}
                                          >
                                            {type === 'upload' ? <Upload size={14} /> : <LinkIcon size={14} />}
                                            {type === 'upload' ? 'Upload Direto' : 'Link Externo (YouTube/Vimeo)'}
                                          </button>
                                        ))}
                                     </div>

                                     {lesson.videoType === 'embed' ? (
                                        <div className="relative">
                                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                          <input 
                                            placeholder="Cole a URL do vídeo aqui (Ex: youtube.com/watch?v=...)" 
                                            value={lesson.videoUrl || ''}
                                            onChange={(e) => updateLesson(module.id, lesson.id, { videoUrl: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rm-gold outline-none text-sm bg-white"
                                          />
                                        </div>
                                     ) : (
                                        <div 
                                          onClick={() => triggerLessonVideoUpload(module.id, lesson.id)}
                                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white hover:border-rm-gold transition-colors cursor-pointer"
                                        >
                                           {uploadingState?.id === lesson.id && uploadingState?.type === 'video' ? (
                                              <div className="flex flex-col items-center">
                                                  <span className="animate-spin h-8 w-8 border-4 border-rm-gold border-t-transparent rounded-full mb-2"></span>
                                                  <span className="text-xs font-bold text-gray-500">Enviando Vídeo (Isso pode demorar)...</span>
                                              </div>
                                           ) : lesson.videoUrl ? (
                                              <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
                                                  <Video size={20} /> Vídeo carregado!
                                                  <span className="text-xs font-normal text-gray-500 block">(Clique para substituir)</span>
                                              </div>
                                           ) : (
                                              <>
                                                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                                    <Upload size={20} />
                                                </div>
                                                <p className="text-sm font-medium text-gray-700">Clique para selecionar arquivo</p>
                                                <p className="text-[10px] text-gray-400">MP4, MOV (Max 2GB)</p>
                                              </>
                                           )}
                                        </div>
                                     )}
                                  </div>

                                  {/* Attachments Section */}
                                  <div>
                                     <div className="flex items-center justify-between mb-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Materiais Complementares</label>
                                        <button 
                                          onClick={() => triggerAttachmentUpload(module.id, lesson.id)}
                                          className="text-xs font-bold text-rm-gold hover:text-rm-green flex items-center gap-1"
                                        >
                                          {uploadingState?.id === lesson.id && uploadingState?.type === 'document' ? (
                                              <span className="animate-spin h-3 w-3 border-2 border-rm-gold border-t-transparent rounded-full mr-1"></span>
                                          ) : <Plus size={12} />} 
                                          Adicionar Arquivo
                                        </button>
                                     </div>
                                     <div className="space-y-2">
                                        {lesson.attachments?.map((file) => (
                                           <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                                              <div className="flex items-center gap-3">
                                                 <div className="p-1.5 bg-red-100 text-red-500 rounded">
                                                    <FileText size={16} />
                                                 </div>
                                                 <div>
                                                    <p className="text-sm font-semibold text-gray-700">{file.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase">{file.type} • {file.size}</p>
                                                 </div>
                                              </div>
                                              <button 
                                                onClick={() => removeAttachment(module.id, lesson.id, file.id)}
                                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                                              >
                                                <X size={16} />
                                              </button>
                                           </div>
                                        ))}
                                        {(!lesson.attachments || lesson.attachments.length === 0) && (
                                           <p className="text-xs text-gray-400 italic">Nenhum material anexado.</p>
                                        )}
                                     </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                     <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer hover:text-rm-green">
                                        <input 
                                          type="checkbox" 
                                          checked={lesson.isFreePreview}
                                          onChange={(e) => updateLesson(module.id, lesson.id, { isFreePreview: e.target.checked })}
                                          className="rounded text-rm-gold focus:ring-rm-gold border-gray-300"
                                        />
                                        Aula Gratuita (Preview)
                                     </label>
                                     
                                     <button 
                                       onClick={() => removeLesson(module.id, lesson.id)}
                                       className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                                     >
                                       <Trash2 size={14} /> Excluir Aula
                                     </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => addLesson(module.id)}
                        className="w-full mt-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:text-rm-green hover:border-rm-green/50 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={18} /> Adicionar Nova Aula
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseCreate;