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
  const [category, setCategory] = useState(initialData?.category || 'Vendas');
  const [level, setLevel] = useState<Course['level']>(initialData?.level || 'Iniciante');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [status, setStatus] = useState<Course['status']>(initialData?.status || 'draft');
  
  const [modules, setModules] = useState<Module[]>(initialData?.modules || [
    { id: Date.now().toString(), title: 'Módulo 01: Introdução', lessons: [] }
  ]);
  
  // UI State
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

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

  // --- File Selection Logic (Local Preview) ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Create Local Preview URL
    const previewUrl = URL.createObjectURL(file);

    if (type === 'image') {
        filesToUpload.current['cover'] = file;
        setThumbnailUrl(previewUrl);
        onShowToast('info', 'Imagem selecionada', 'Será enviada ao salvar o curso.');
    } 
    else if (type === 'video' && activeUploadContext.current) {
        const { moduleId, lessonId } = activeUploadContext.current;
        filesToUpload.current[`video_${lessonId}`] = file;
        
        updateLesson(moduleId, lessonId, { 
            videoUrl: previewUrl, 
            videoType: 'upload' 
        });
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
    // Placeholder simple logic, can be improved to sum durations
    return '5h 30m'; 
  };

  const handleSave = async () => {
    if (!title) {
        onShowToast('error', 'Erro ao Salvar', 'O campo Título do Curso é obrigatório.');
        return;
    }
    if (!currentUser) return;

    setIsSaving(true);
    
    const courseData: Course = {
      id: initialData?.id || '',
      title,
      description,
      thumbnailUrl, 
      modules,
      totalDuration: calculateTotalDuration(),
      progress: 0,
      status: status, // Use the selected status (draft/published)
      category,
      level,
      price: parseFloat(price) || 0
    };

    try {
        await api.createCourse(courseData, filesToUpload.current, currentUser);
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
    const newL: Lesson = { id: Date.now().toString(), title: 'Nova Aula', duration: '00:00', videoType: 'upload' };
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
        <div className="flex items-center gap-3">
          {/* Status Switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
             <button 
               onClick={() => setStatus('draft')}
               className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${status === 'draft' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Rascunho
             </button>
             <button 
               onClick={() => setStatus('published')}
               className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${status === 'published' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
               Publicado
             </button>
          </div>

          <div className="h-8 w-px bg-gray-200 mx-1"></div>

          <Button variant="ghost" onClick={onCancel} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSave} isLoading={isSaving} className="px-6 shadow-lg shadow-rm-gold/20">
            <Save size={18} className="mr-2" /> {isSaving ? 'Enviando...' : 'Salvar Curso'}
          </Button>
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
                           <option value="Vendas">Vendas</option>
                           <option value="Gastronomia">Gastronomia</option>
                           <option value="Marketing">Marketing</option>
                        </select>
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
                  <div onClick={triggerThumbnailUpload} className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-rm-gold overflow-hidden relative">
                     {thumbnailUrl ? <img src={thumbnailUrl} className="w-full h-full object-cover" /> : <div className="text-center text-gray-400"><Upload className="mx-auto mb-2" /><span className="text-xs">Selecionar Imagem</span></div>}
                  </div>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                   <Input label="Preço (R$)" type="number" value={price} onChange={e => setPrice(e.target.value)} />
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
                                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center cursor-pointer hover:border-rm-gold" onClick={() => triggerLessonVideoUpload(module.id, lesson.id)}>
                                        {lesson.videoUrl ? <p className="text-sm text-green-600 font-bold flex items-center justify-center gap-2"><CheckSquare size={16}/> Vídeo Selecionado</p> : <p className="text-sm text-gray-500">Clique para selecionar vídeo (MP4)</p>}
                                     </div>
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