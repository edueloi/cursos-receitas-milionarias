import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Upload, Plus, X, Layout, List, Trash2, Video, 
  Clock, GripVertical, ChevronDown, ChevronRight, ArrowLeft, 
  FileText, Image as ImageIcon, Link as LinkIcon, Paperclip, CheckSquare, Layers 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Course, Module, Lesson, Attachment, User } from '../types';
import { ToastMessage } from '../components/ui/Toast';
import { api } from '../services/api';

interface AdminCourseCreateProps {
  initialData?: Course | null;
  currentUser: User | null;
  onSave: (course: Course) => void;
  onCancel: () => void;
  onShowToast: (type: ToastMessage['type'], title: string, message?: string) => void;
}

const AdminCourseCreate: React.FC<AdminCourseCreateProps> = ({ initialData, currentUser, onSave, onCancel, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [level, setLevel] = useState<Course['level']>(initialData?.level || 'Iniciante');
  const [status, setStatus] = useState<Course['status']>(initialData?.status || 'draft');
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  
  const [modules, setModules] = useState<Module[]>(initialData?.modules || [
    { id: Date.now().toString(), title: 'Módulo 01: Introdução', lessons: [] }
  ]);
  
  // UI State
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [learningInputMap, setLearningInputMap] = useState<Record<string, string>>({});
  const [removeCover, setRemoveCover] = useState(false);

  // File Staging (Store actual files to upload on save)
  const filesToUpload = useRef<{[key: string]: File}>({});

  // Hidden File Inputs Refs
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const lessonVideoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const activeUploadContext = useRef<{ moduleId: string, lessonId: string } | null>(null);

  useEffect(() => {
    if (modules.length > 0 && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [modules[0].id]: true });
    }
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const list = await api.getCategories();
        setCategories(list);
        if (!category && list.length > 0) {
          setCategory(list[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    loadCategories();
  }, []);

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    try {
      const list = await api.addCategory(name);
      setCategories(list);
      setCategory(name);
      setNewCategory('');
      onShowToast('success', 'Categoria criada', 'Nova categoria adicionada.');
    } catch (error: any) {
      onShowToast('error', 'Erro ao criar categoria', error.message || 'Falha ao criar categoria.');
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '00:00';
    const total = Math.floor(seconds);
    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // --- File Selection Logic (Local Preview) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Create Local Preview URL
    const previewUrl = URL.createObjectURL(file);

    if (type === 'image') {
        filesToUpload.current['cover'] = file;
        setRemoveCover(false);
        setThumbnailUrl(previewUrl);
        onShowToast('info', 'Imagem selecionada', 'Será enviada ao salvar o curso.');
    } 
    else if (type === 'video' && activeUploadContext.current) {
        const { moduleId, lessonId } = activeUploadContext.current;
        filesToUpload.current[`video_${lessonId}`] = file;
        
        updateLesson(moduleId, lessonId, { 
            videoUrl: previewUrl, 
            videoType: 'upload',
            removeVideo: false
        });
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.src = previewUrl;
        tempVideo.onloadedmetadata = () => {
          const duration = formatDuration(tempVideo.duration);
          updateLesson(moduleId, lessonId, { duration });
        };
        tempVideo.onerror = () => {
          console.warn('Nao foi possivel ler a duracao do video.');
        };
        onShowToast('info', 'Vídeo selecionado', 'O arquivo será enviado ao salvar.');
    } 
    else if (type === 'document' && activeUploadContext.current) {
        const { moduleId, lessonId } = activeUploadContext.current;
        const attachmentId = Date.now().toString();
        
        filesToUpload.current[`attachment_${attachmentId}`] = file;

        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        const newAttachment: Attachment = {
            id: attachmentId,
            name: file.name,
            url: previewUrl,
            size: `${sizeInMB} MB`,
            type: 'pdf'
        };

        const module = modules.find(m => m.id === moduleId);
        const lesson = module?.lessons.find(l => l.id === lessonId);
        if (lesson) {
            const currentAttachments = lesson.attachments || [];
            updateLesson(moduleId, lessonId, { attachments: [...currentAttachments, newAttachment] });
        }
        onShowToast('info', 'Arquivo anexado', 'Será enviado ao salvar.');
    }

    // Reset input
    e.target.value = '';
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
    let totalSeconds = 0;
    
    modules.forEach(mod => {
      mod.lessons.forEach(lesson => {
        // Expected format "MM:SS" or "HH:MM:SS"
        // If user input is missing or weird, assume 0
        const durationStr = lesson.duration || "00:00";
        const parts = durationStr.split(':').map(Number);
        
        if (parts.length === 3) {
           totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
           totalSeconds += parts[0] * 60 + parts[1];
        } else if (parts.length === 1 && !isNaN(parts[0])) {
           // Treated as minutes if just a number
           totalSeconds += parts[0] * 60;
        }
      });
    });

    if (totalSeconds === 0) return '0h 0m';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  const handleSave = async () => {
    if (!title) {
        onShowToast('error', 'Erro ao Salvar', 'O campo Título do Curso é obrigatório.');
        return;
    }
    if (!currentUser) return;

    setIsSaving(true);
    
    const calculatedDuration = calculateTotalDuration();

    const courseData: Course = {
      id: initialData?.id || '',
      title,
      description,
      thumbnailUrl, 
      modules,
      totalDuration: calculatedDuration,
      progress: 0,
      status: status, // Use the selected status (draft/published)
      category,
      level,
      price: 0
    };

    try {
        await api.createCourse(courseData, filesToUpload.current, currentUser, { removeCover });
        onShowToast('success', 'Curso Salvo!', 'Seu curso e arquivos foram enviados com sucesso.');
        onSave(courseData); 
    } catch (error: any) {
        onShowToast('error', 'Falha ao salvar', error.message || 'Erro de conexão com o servidor.');
    } finally {
        setIsSaving(false);
    }
  };

  // --- Module/Lesson Helper Functions ---
  const addModule = () => {
    const newId = Date.now().toString();
    setModules([...modules, { id: newId, title: `Módulo ${modules.length + 1}`, lessons: [] }]);
    setExpandedModules(prev => ({ ...prev, [newId]: true }));
  };
  const removeModule = (id: string) => setModules(modules.filter(m => m.id !== id));
  const updateModule = (id: string, field: keyof Module, val: any) => setModules(modules.map(m => m.id === id ? { ...m, [field]: val } : m));
  const toggleModuleExpand = (id: string) => setExpandedModules(p => ({ ...p, [id]: !p[id] }));
  
  const addLesson = (modId: string) => {
    const newL: Lesson = { id: Date.now().toString(), title: 'Nova Aula', duration: '05:00', videoType: 'upload', description: '', learningObjectives: [], removeVideo: false };
    setModules(modules.map(m => m.id === modId ? { ...m, lessons: [...m.lessons, newL] } : m));
    setEditingLessonId(newL.id);
  };
  const updateLesson = (modId: string, lesId: string, updates: Partial<Lesson>) => {
    setModules(modules.map(m => m.id === modId ? { ...m, lessons: m.lessons.map(l => l.id === lesId ? { ...l, ...updates } : l) } : m));
  };
  const removeLesson = (modId: string, lesId: string) => {
    setModules(modules.map(m => m.id === modId ? { ...m, lessons: m.lessons.filter(l => l.id !== lesId) } : m));
  };
  const removeAttachment = (modId: string, lesId: string, attId: string) => {
      delete filesToUpload.current[`attachment_${attId}`];
      const module = modules.find(m => m.id === modId);
      const lesson = module?.lessons.find(l => l.id === lesId);
      if (lesson) {
          updateLesson(modId, lesId, { attachments: (lesson.attachments || []).filter(a => a.id !== attId) });
      }
  };
  const handleRemoveCover = () => {
    if (filesToUpload.current['cover']) {
      delete filesToUpload.current['cover'];
    }
    setThumbnailUrl('');
    setRemoveCover(true);
  };
  const handleRemoveVideo = (modId: string, lesId: string) => {
    if (filesToUpload.current[`video_${lesId}`]) {
      delete filesToUpload.current[`video_${lesId}`];
    }
    updateLesson(modId, lesId, { videoUrl: '', videoType: undefined, removeVideo: true });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans mb-24 lg:mb-0 pb-10">
      
      {/* Inputs hidden */}
      <input type="file" ref={thumbnailInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
      <input type="file" ref={lessonVideoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} />
      <input type="file" ref={attachmentInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'document')} />

      {/* Header Sticky Container */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 md:top-16 z-40 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-800 tracking-tight">{initialData ? 'Editar Curso' : 'Criar Novo Curso'}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Preencha os dados e organize as aulas do seu curso.</p>
            </div>
          </div>
          
          {/* Actions & Status Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            
            {/* Status Switcher */}
            <div className="flex items-center bg-gray-100/80 p-1 rounded-xl w-full sm:w-auto overflow-hidden border border-gray-200/50">
               <button 
                 onClick={() => setStatus('draft')}
                 className={`flex-1 sm:w-28 py-2 md:py-1.5 rounded-lg text-xs font-bold transition-all text-center ${status === 'draft' ? 'bg-white text-gray-800 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 Rascunho
               </button>
               <button 
                 onClick={() => setStatus('published')}
                 className={`flex-1 sm:w-28 py-2 md:py-1.5 rounded-lg text-xs font-bold transition-all text-center ${status === 'published' ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 Público
               </button>
            </div>

            {/* Save Button */}
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className={`px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center shrink-0 ${isSaving ? 'bg-gray-400' : 'bg-gradient-to-r from-rm-green to-[#0f241e] hover:shadow-xl hover:-translate-y-0.5'}`}
            >
              <Save size={16} className="mr-2" /> 
              <span className="hidden sm:inline">{isSaving ? 'Salvando...' : 'Salvar Curso'}</span>
              <span className="sm:hidden">{isSaving ? 'Salv...' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in relative">
        
        {/* Tabs */}
        <div className="flex justify-start sm:justify-center mb-8 overflow-x-auto pb-2 scrollbar-none">
           <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/60 shadow-sm inline-flex gap-1 min-w-max">
              <button 
                onClick={() => setActiveTab('info')} 
                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'info' ? 'bg-white text-rm-green shadow-sm ring-1 ring-black/5 scale-100' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700 scale-95 opacity-80'}`}
              >
                <Layout size={18} /> Informações Básicas
              </button>
              <button 
                onClick={() => setActiveTab('curriculum')} 
                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'curriculum' ? 'bg-white text-rm-green shadow-sm ring-1 ring-black/5 scale-100' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700 scale-95 opacity-80'}`}
              >
                <List size={18} /> Grade de Aulas
              </button>
           </div>
        </div>

        {activeTab === 'info' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
               <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FileText size={20} className="text-rm-gold" /> Detalhes do Curso</h2>
                  <div className="space-y-6">
                    <div>
                      <Input label="Título do Curso" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Masterclass de Vendas" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Descrição Completa</label>
                      <textarea 
                        rows={6} 
                        placeholder="Descreva o que os alunos aprenderão neste curso..."
                        className="w-full px-4 py-4 rounded-2xl border border-gray-200 outline-none focus:ring-4 focus:ring-rm-green/10 focus:border-rm-green transition-all bg-gray-50/50 hover:bg-white text-gray-700" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><Layers size={16} className="text-gray-400"/> Categoria Principal</label>
                          <select className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-rm-green transition-all" value={category} onChange={e => setCategory(e.target.value)}>
                             {categories.length === 0 && <option value="">Selecione...</option>}
                             {categories.map(cat => (
                               <option key={cat} value={cat}>{cat}</option>
                             ))}
                          </select>
                          <div className="mt-4 flex gap-2">
                            <input
                              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-rm-green transition-all"
                              placeholder="Criar nova..."
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={handleAddCategory}
                              disabled={!newCategory.trim()}
                              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50 transition-all"
                            >
                              Adicionar
                            </button>
                          </div>
                       </div>
                       <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><CheckSquare size={16} className="text-gray-400"/> Dificuldade</label>
                          <div className="space-y-2">
                            {['Iniciante', 'Intermediário', 'Avançado'].map(lvl => (
                              <label key={lvl} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${level === lvl ? 'border-rm-green bg-rm-green/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                <input type="radio" name="level" value={lvl} checked={level === lvl} onChange={() => setLevel(lvl as any)} className="w-4 h-4 text-rm-green focus:ring-rm-green border-gray-300" />
                                <span className={`text-sm font-medium ${level === lvl ? 'text-rm-green' : 'text-gray-600'}`}>{lvl}</span>
                              </label>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
            
            <div className="lg:col-span-4 space-y-8">
               {/* Thumbnail Uploader */}
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-40">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-rm-gold" /> Capa do Curso</h3>
                  <div
                    onClick={thumbnailUrl ? undefined : triggerThumbnailUpload}
                    className={`aspect-video w-full rounded-2xl border-2 flex items-center justify-center overflow-hidden relative transition-all group ${thumbnailUrl ? 'border-transparent shadow-md' : 'border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50/50 hover:border-blue-400 cursor-pointer'}`}
                  >
                     {thumbnailUrl ? (
                       <div className="w-full h-full relative">
                         <img src={thumbnailUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button
                             type="button"
                             onClick={(e) => { e.stopPropagation(); triggerThumbnailUpload(); }}
                             className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl text-sm font-bold mr-2 hover:bg-white hover:text-gray-900 transition-colors"
                           >
                             Trocar
                           </button>
                           <button
                             type="button"
                             onClick={(e) => { e.stopPropagation(); handleRemoveCover(); }}
                             className="px-4 py-2 bg-red-500/80 backdrop-blur-md border border-red-500/50 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </div>
                     ) : (
                       <div className="text-center p-6 text-gray-400 group-hover:text-blue-500 transition-colors">
                         <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all">
                           <Upload size={20} />
                         </div>
                         <h4 className="text-sm font-bold text-gray-700 mb-1">Fazer Upload da Capa</h4>
                         <span className="text-xs">JPG, PNG ou GIF (Máx. 5MB)</span>
                         <p className="text-[10px] mt-2 inline-block px-2 py-1 bg-white rounded truncate max-w-[180px]">Recomendado: 1920x1080px</p>
                       </div>
                     )}
                  </div>
                  <div className="mt-6 flex bg-blue-50 p-4 rounded-xl items-start gap-3 border border-blue-100">
                    <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600 shrink-0 mt-0.5"><LinkIcon size={14} /></div>
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">As capas criam a primeira impressão. Escolha imagens nítidas que não possuam muito texto sobreposto.</p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
             {/* Curriculum Top Actions */}
             <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 tracking-tight">Grade de Aulas</h3>
                  <p className="text-sm text-gray-400">Organize o conteúdo do curso em módulos e aulas.</p>
                </div>
                <button 
                  onClick={addModule} 
                  className="px-6 py-3 bg-gray-50 border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-white hover:shadow-md rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-auto"
                >
                  <Plus size={18} /> Adicionar Novo Módulo
                </button>
             </div>
             
             {/* Modules List */}
             <div className="space-y-4">
               {modules.map((module, mIdx) => (
                  <div key={module.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm transition-all hover:border-gray-300 group/module overflow-hidden">
                     
                     {/* Module Header */}
                     <div 
                       onClick={() => toggleModuleExpand(module.id)} 
                       className={`flex items-center gap-3 p-4 sm:p-5 cursor-pointer transition-colors ${expandedModules[module.id] ? 'bg-gray-50/50 border-b border-gray-100' : 'bg-white hover:bg-gray-50'}`}
                     >
                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400 cursor-grab active:cursor-grabbing hover:bg-gray-50 hover:text-gray-600 shrink-0 hidden sm:block">
                          <GripVertical size={18} />
                        </div>
                        <div className={`p-2 rounded-lg transition-transform duration-300 shrink-0 ${expandedModules[module.id] ? 'bg-rm-green text-white rotate-180' : 'bg-gray-100 text-gray-500'}`}>
                          <ChevronDown size={18} />
                        </div>
                        
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 sm:w-24">Módulo {String(mIdx + 1).padStart(2, '0')}</span>
                          <input 
                            onClick={e => e.stopPropagation()} 
                            value={module.title} 
                            placeholder="Nome do Módulo..."
                            onChange={e => updateModule(module.id, 'title', e.target.value)} 
                            className="bg-transparent font-bold text-gray-800 text-base sm:text-lg outline-none w-full placeholder-gray-300 focus:text-rm-green transition-colors" 
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold text-gray-400 px-3 py-1 bg-white border border-gray-100 rounded-full hidden sm:inline-block">
                            {module.lessons.length} {module.lessons.length === 1 ? 'Aula' : 'Aulas'}
                          </span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeModule(module.id); }} 
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/module:opacity-100"
                            title="Remover Módulo"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                     </div>

                     {/* Lessons Area */}
                     {expandedModules[module.id] && (
                        <div className="p-4 sm:p-6 bg-gray-50/30">
                           <div className="space-y-3 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:ml-8 before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
                             {module.lessons.map((lesson, lIdx) => (
                                <div key={lesson.id} className={`relative bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${editingLessonId === lesson.id ? 'border-rm-gold ring-4 ring-rm-gold/10' : 'border-gray-200 hover:border-gray-300'}`}>
                                   
                                   {/* Lesson Header */}
                                   <div className="flex justify-between items-center cursor-pointer p-4" onClick={() => setEditingLessonId(editingLessonId === lesson.id ? null : lesson.id)}>
                                      <div className="flex items-center gap-4 w-full">
                                         <div className="flex flex-col items-center gap-1 shrink-0">
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${lesson.videoUrl ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-gray-50 border-gray-300 text-gray-400'}`}>
                                               {lIdx + 1}
                                            </div>
                                         </div>
                                         
                                         <div className="flex-1 min-w-0">
                                            <div className="flex sm:items-center flex-col sm:flex-row gap-1 sm:gap-3">
                                              <p className="font-bold text-sm sm:text-base text-gray-800 truncate">{lesson.title || 'Aula sem título'}</p>
                                              {lesson.duration && lesson.duration !== '00:00' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 shrink-0 w-max">
                                                  <Clock size={10} /> {lesson.duration}
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                              {lesson.videoUrl && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">VÍDEO CARREGADO</span>}
                                              {(lesson.attachments?.length || 0) > 0 && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1"><Paperclip size={10}/> {lesson.attachments?.length} ANEXOS</span>}
                                            </div>
                                         </div>
                                         <div className={`p-1.5 rounded transition-transform text-gray-400 ${editingLessonId === lesson.id ? 'bg-gray-100 rotate-180' : 'bg-transparent'}`}>
                                           <ChevronDown size={20} />
                                         </div>
                                      </div>
                                   </div>
                                   
                                   {/* Lesson Editor Area */}
                                   {editingLessonId === lesson.id && (
                                      <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100 space-y-6">
                                         
                                         {/* Basic Info */}
                                         <div className="grid sm:grid-cols-3 gap-4">
                                            <div className="sm:col-span-2">
                                              <Input label="Título da Aula" value={lesson.title} onChange={e => updateLesson(module.id, lesson.id, { title: e.target.value })} placeholder="Ex: Mentalidade de Vendas" />
                                            </div>
                                            <div>
                                              <Input label="Duração" value={lesson.duration} onChange={e => updateLesson(module.id, lesson.id, { duration: e.target.value })} placeholder="MM:SS" />
                                              <p className="text-[10px] text-gray-400 mt-1 pl-1">Ex: 12:45</p>
                                            </div>
                                         </div>

                                         <div className="grid lg:grid-cols-2 gap-6">
                                            {/* Video Upload Section */}
                                            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                                               <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Video size={16} className="text-rm-green"/> Mídia Principal</h4>
                                               
                                               <div
                                                 className={`flex-1 rounded-xl border-2 overflow-hidden relative flex flex-col items-center justify-center transition-all min-h-[160px] ${lesson.videoUrl ? 'border-gray-200 bg-black aspect-video' : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-rm-gold cursor-pointer'}`}
                                                 onClick={lesson.videoUrl ? undefined : () => triggerLessonVideoUpload(module.id, lesson.id)}
                                               >
                                                  {lesson.videoUrl ? (
                                                    <div className="w-full h-full relative group/vid">
                                                      <video
                                                        src={lesson.videoUrl}
                                                        className="w-full h-full object-contain bg-black"
                                                        controls
                                                        controlsList="nodownload"
                                                      />
                                                      <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveVideo(module.id, lesson.id); }}
                                                        className="absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-black/70 backdrop-blur-md text-white hover:bg-red-500 transition-colors opacity-0 group-hover/vid:opacity-100"
                                                      >
                                                        Remover Vídeo
                                                      </button>
                                                    </div>
                                                  ) : (
                                                    <div className="text-center p-4 text-gray-400">
                                                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-2"><Upload size={16}/></div>
                                                      <p className="text-xs font-bold text-gray-600 mb-1">Selecionar Arquivo de Vídeo</p>
                                                      <p className="text-[10px]">MP4, WEBM (Máx 300MB)</p>
                                                    </div>
                                                  )}
                                               </div>
                                            </div>

                                            {/* Materials & Details Section */}
                                            <div className="space-y-4">
                                               <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                                  <div className="flex justify-between items-center mb-3">
                                                     <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Paperclip size={16} className="text-blue-500"/> Materiais Complementares</h4>
                                                     <button onClick={() => triggerAttachmentUpload(module.id, lesson.id)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100 transition-colors">+ Anexar</button>
                                                  </div>
                                                  
                                                  {(lesson.attachments?.length || 0) === 0 ? (
                                                    <p className="text-xs text-gray-400 p-3 bg-gray-50 rounded-lg text-center border border-dashed border-gray-200">Nenhum anexo nesta aula.</p>
                                                  ) : (
                                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                                      {lesson.attachments?.map(att => (
                                                         <div key={att.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-sm group/att transition-colors hover:bg-white hover:border-gray-200 hover:shadow-sm">
                                                            <div className="flex items-center gap-2 overflow-hidden pr-2">
                                                              <div className="p-1.5 bg-blue-100 text-blue-600 rounded"><FileText size={12}/></div>
                                                              <span className="truncate text-xs font-medium text-gray-700">{att.name}</span>
                                                            </div>
                                                            <button onClick={() => removeAttachment(module.id, lesson.id, att.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover/att:opacity-100"><X size={14}/></button>
                                                         </div>
                                                      ))}
                                                    </div>
                                                  )}
                                               </div>

                                               <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                                 <label className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-2"><FileText size={16} className="text-gray-400"/> Texto de Apoio</label>
                                                 <textarea
                                                   rows={2}
                                                   placeholder="Algum aviso ou descrição rápida abaixo do vídeo."
                                                   className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green transition-all bg-gray-50/50"
                                                   value={lesson.description || ''}
                                                   onChange={e => updateLesson(module.id, lesson.id, { description: e.target.value })}
                                                 />
                                               </div>
                                            </div>
                                         </div>

                                         <div className="flex justify-end pt-2 border-t border-gray-200">
                                            <button onClick={() => removeLesson(module.id, lesson.id)} className="px-4 py-2 text-red-500 text-xs font-bold bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2">
                                              <Trash2 size={14}/> Excluir Aula
                                            </button>
                                         </div>
                                      </div>
                                   )}
                                </div>
                             ))}
                           </div>
                           
                           <div className="mt-4 pl-4 sm:pl-10 relative">
                             <div className="absolute left-7 sm:left-8 top-0 bottom-1/2 w-8 border-l-2 border-b-2 border-gray-200 rounded-bl-xl"></div>
                             <button 
                               onClick={() => addLesson(module.id)} 
                               className="relative z-10 w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-gray-600 font-bold hover:border-rm-green hover:text-rm-green hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm ml-6 sm:ml-4"
                             >
                                <Plus size={16} /> Adicionar Aula
                             </button>
                           </div>
                        </div>
                     )}
                  </div>
               ))}
             </div>
             
             {modules.length === 0 && (
               <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"><List size={32}/></div>
                 <h4 className="text-lg font-bold text-gray-700 mb-2">Nada por aqui ainda...</h4>
                 <p className="text-sm text-gray-400 mb-6">Comece adicionando o primeiro módulo do seu curso.</p>
                 <button onClick={addModule} className="px-6 py-2.5 bg-rm-green text-white rounded-xl font-bold hover:bg-[#0f241e] transition-colors shadow-lg shadow-rm-green/20">
                   Criar Primeiro Módulo
                 </button>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );

};

export default AdminCourseCreate;
