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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      
      {/* Inputs hidden */}
      <input type="file" ref={thumbnailInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
      <input type="file" ref={lessonVideoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} />
      <input type="file" ref={attachmentInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'document')} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-16 z-30 shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft size={22} /></button>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-rm-green">{initialData ? 'Editor' : 'Novo Curso'}</h1>
        </div>
        
        {/* Actions & Status Toggle */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-3 w-full md:w-auto">
          
          {/* Save Button (Primary) */}
          <Button onClick={handleSave} isLoading={isSaving} className="px-6 shadow-lg shadow-rm-gold/20 w-full md:w-auto justify-center">
            <Save size={18} className="mr-2" /> {isSaving ? 'Enviando...' : 'Salvar Curso'}
          </Button>

          {/* Cancel Button */}
          <Button variant="ghost" onClick={onCancel} disabled={isSaving} className="w-full md:w-auto justify-center">Cancelar</Button>

          {/* Status Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg w-full md:w-auto">
             <button 
               onClick={() => setStatus('draft')}
               className={`flex-1 md:flex-none px-4 py-2 rounded-md text-xs font-bold transition-all text-center ${status === 'draft' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Rascunho
             </button>
             <button 
               onClick={() => setStatus('published')}
               className={`flex-1 md:flex-none px-4 py-2 rounded-md text-xs font-bold transition-all text-center ${status === 'published' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Publicado
             </button>
          </div>

        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 animate-fade-in pb-20">
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
           <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm inline-flex gap-2">
              <button onClick={() => setActiveTab('info')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex gap-2 ${activeTab === 'info' ? 'bg-rm-green text-white' : 'text-gray-500 hover:bg-gray-50'}`}><Layout size={18} /> Info</button>
              <button onClick={() => setActiveTab('curriculum')} className={`px-6 py-2.5 rounded-xl text-sm font-bold flex gap-2 ${activeTab === 'curriculum' ? 'bg-rm-green text-white' : 'text-gray-500 hover:bg-gray-50'}`}><List size={18} /> Aulas</button>
           </div>
        </div>

        {activeTab === 'info' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                  <Input label="Título do Curso" value={title} onChange={e => setTitle(e.target.value)} />
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                    <textarea rows={6} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-rm-gold" value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold mb-1">Categoria</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white" value={category} onChange={e => setCategory(e.target.value)}>
                           {categories.length === 0 && <option value="">Selecione...</option>}
                           {categories.map(cat => (
                             <option key={cat} value={cat}>{cat}</option>
                           ))}
                        </select>
                        <div className="mt-3 flex gap-2">
                          <input
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm"
                            placeholder="Nova categoria"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-3 py-2 rounded-lg text-xs font-bold bg-rm-green text-white hover:bg-[#0f241e]"
                          >
                            Criar
                          </button>
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold mb-1">Nível</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white" value={level} onChange={e => setLevel(e.target.value as any)}>
                           <option value="Iniciante">Iniciante</option>
                           <option value="Intermediário">Intermediário</option>
                           <option value="Avançado">Avançado</option>
                        </select>
                     </div>
                  </div>
               </div>
            </div>
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-rm-green mb-4">Capa do Curso</h3>
                  <div
                    onClick={thumbnailUrl ? undefined : triggerThumbnailUpload}
                    className={`aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-rm-gold overflow-hidden relative ${thumbnailUrl ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                     {thumbnailUrl ? (
                       <div className="w-full h-full relative">
                         <img src={thumbnailUrl} className="w-full h-full object-cover" />
                         <button
                           type="button"
                           onClick={(e) => { e.stopPropagation(); handleRemoveCover(); }}
                           className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                         >
                           Excluir capa
                         </button>
                       </div>
                     ) : (
                       <div className="text-center text-gray-400">
                         <Upload className="mx-auto mb-2" />
                         <span className="text-xs">Selecionar Imagem</span>
                       </div>
                     )}
                  </div>
                  {thumbnailUrl && (
                    <p className="text-xs text-gray-400 mt-2">Remova a capa para enviar outra.</p>
                  )}
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                   <p className="text-sm text-gray-500">Curso incluso na assinatura.</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-rm-green">Conteúdo</h3>
                <Button onClick={addModule} variant="secondary" size="sm"><Plus size={16} /> Módulo</Button>
             </div>
             {modules.map((module) => (
                <div key={module.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                   <div onClick={() => toggleModuleExpand(module.id)} className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer border-b border-gray-100">
                      <div className="flex items-center gap-3 flex-1">
                         {expandedModules[module.id] ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                         <input onClick={e => e.stopPropagation()} value={module.title} onChange={e => updateModule(module.id, 'title', e.target.value)} className="bg-transparent font-bold text-gray-800 outline-none w-full" />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeModule(module.id); }} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                   </div>
                   {expandedModules[module.id] && (
                      <div className="p-4 space-y-3">
                         {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="border border-gray-200 rounded-lg p-4">
                               <div className="flex justify-between items-start cursor-pointer" onClick={() => setEditingLessonId(editingLessonId === lesson.id ? null : lesson.id)}>
                                  <div className="flex items-center gap-3">
                                     <div className={`p-2 rounded-lg ${lesson.videoUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}><Video size={16}/></div>
                                     <div>
                                        <p className="font-bold text-sm">{lesson.title}</p>
                                        <p className="text-xs text-gray-400">{lesson.duration}</p>
                                     </div>
                                  </div>
                                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${editingLessonId === lesson.id ? 'rotate-180' : ''}`} />
                               </div>
                               
                               {editingLessonId === lesson.id && (
                                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in">
                                     <Input label="Título" value={lesson.title} onChange={e => updateLesson(module.id, lesson.id, { title: e.target.value })} />
                                     <Input label="Duração (MM:SS)" value={lesson.duration} onChange={e => updateLesson(module.id, lesson.id, { duration: e.target.value })} placeholder="Ex: 10:00" className="mt-2" />
                                     <div>
                                       <label className="block text-sm font-bold text-gray-700 mb-2">Descrição da Aula</label>
                                       <textarea
                                         rows={4}
                                         className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-rm-gold"
                                         value={lesson.description || ''}
                                         onChange={e => updateLesson(module.id, lesson.id, { description: e.target.value })}
                                       />
                                     </div>
                                     <div>
                                       <label className="block text-sm font-bold text-gray-700 mb-2">O que você vai aprender</label>
                                       <div className="flex gap-2">
                                         <input
                                           className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm"
                                           placeholder="Ex: Estratégias de precificação"
                                           value={learningInputMap[lesson.id] || ''}
                                           onChange={(e) => setLearningInputMap(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                                         />
                                         <button
                                           type="button"
                                           onClick={() => {
                                             const text = (learningInputMap[lesson.id] || '').trim();
                                             if (!text) return;
                                             const next = [...(lesson.learningObjectives || []), text];
                                             updateLesson(module.id, lesson.id, { learningObjectives: next });
                                             setLearningInputMap(prev => ({ ...prev, [lesson.id]: '' }));
                                           }}
                                           className="px-3 py-2 rounded-lg text-xs font-bold bg-rm-green text-white hover:bg-[#0f241e]"
                                         >
                                           Adicionar
                                         </button>
                                       </div>
                                       {(lesson.learningObjectives || []).length > 0 && (
                                         <div className="mt-3 space-y-2">
                                           {(lesson.learningObjectives || []).map((item, idx) => (
                                             <div key={`${lesson.id}-${idx}`} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
                                               <span className="truncate flex-1">{item}</span>
                                               <button
                                                 type="button"
                                                 onClick={() => {
                                                   const next = (lesson.learningObjectives || []).filter((_, i) => i !== idx);
                                                   updateLesson(module.id, lesson.id, { learningObjectives: next });
                                                 }}
                                               >
                                                 <X size={14} className="text-red-400" />
                                               </button>
                                             </div>
                                           ))}
                                         </div>
                                       )}
                                     </div>
                                     <div
                                       className={`bg-gray-50 p-4 rounded-lg border border-gray-200 text-center hover:border-rm-gold mt-4 ${lesson.videoUrl ? 'cursor-default' : 'cursor-pointer'}`}
                                       onClick={lesson.videoUrl ? undefined : () => triggerLessonVideoUpload(module.id, lesson.id)}
                                     >
                                        {lesson.videoUrl ? (
                                          <div className="space-y-3">
                                            <video
                                              src={lesson.videoUrl}
                                              className="w-full rounded-lg"
                                              controls
                                              preload="metadata"
                                            />
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); handleRemoveVideo(module.id, lesson.id); }}
                                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                                            >
                                              Excluir vídeo
                                            </button>
                                          </div>
                                        ) : (
                                          <p className="text-sm text-gray-500">Clique para selecionar vídeo (MP4)</p>
                                        )}
                                     </div>
                                     {lesson.videoUrl && (
                                       <p className="text-xs text-gray-400">Remova o vídeo para enviar outro.</p>
                                     )}
                                     <div>
                                        <div className="flex justify-between mb-2">
                                           <label className="text-xs font-bold text-gray-500 uppercase">Materiais</label>
                                           <button onClick={() => triggerAttachmentUpload(module.id, lesson.id)} className="text-xs font-bold text-rm-gold flex items-center gap-1"><Plus size={12}/> Add</button>
                                        </div>
                                        {lesson.attachments?.map(att => (
                                           <div key={att.id} className="flex justify-between items-center bg-gray-50 p-2 rounded mb-2 text-sm">
                                              <span className="truncate flex-1">{att.name}</span>
                                              <button onClick={() => removeAttachment(module.id, lesson.id, att.id)}><X size={14} className="text-red-400"/></button>
                                           </div>
                                        ))}
                                     </div>
                                     <button onClick={() => removeLesson(module.id, lesson.id)} className="text-red-500 text-xs font-bold flex items-center gap-1"><Trash2 size={14}/> Excluir Aula</button>
                                  </div>
                               )}
                            </div>
                         ))}
                         <button onClick={() => addLesson(module.id)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 font-bold hover:border-rm-green hover:text-rm-green transition-colors">+ Nova Aula</button>
                      </div>
                   )}
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseCreate;
