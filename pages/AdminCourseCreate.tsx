import React, { useState, useEffect } from 'react';
import { generateCourseOutline } from '../services/geminiService';
import { 
  Sparkles, Save, Upload, Plus, X, Layout, List, Trash2, Video, 
  Clock, GripVertical, ChevronDown, ChevronRight, ArrowLeft, 
  FileText, Image as ImageIcon, Link as LinkIcon, Paperclip, Eye, CheckSquare 
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Course, Module, Lesson, Attachment } from '../types';
import { ToastMessage } from '../components/ui/Toast';

interface AdminCourseCreateProps {
  initialData?: Course | null;
  onSave: (course: Course) => void;
  onCancel: () => void;
  onShowToast: (type: ToastMessage['type'], title: string, message?: string) => void;
}

const AdminCourseCreate: React.FC<AdminCourseCreateProps> = ({ initialData, onSave, onCancel, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'curriculum'>('info');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || '');
  const [category, setCategory] = useState(initialData?.category || 'Vendas');
  const [level, setLevel] = useState<Course['level']>(initialData?.level || 'Iniciante');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  
  const [modules, setModules] = useState<Module[]>(initialData?.modules || [
    { id: Date.now().toString(), title: 'Introdução', lessons: [] }
  ]);
  
  // UI State for Accordions
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Initialize expanded state for first module
  useEffect(() => {
    if (modules.length > 0 && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [modules[0].id]: true });
    }
  }, []);

  // --- AI Generation ---
  const handleGenerateAI = async () => {
    if (!title) {
        onShowToast('warning', 'Título Necessário', 'Digite um título para que a IA possa gerar o conteúdo.');
        return;
    }
    setIsGenerating(true);
    const result = await generateCourseOutline(title);
    setDescription(result);
    setIsGenerating(false);
    onShowToast('success', 'Conteúdo Gerado!', 'A IA criou uma descrição baseada no seu título.');
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
      title: `Seção ${modules.length + 1}: Novo Módulo`,
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
  const addAttachment = (moduleId: string, lessonId: string) => {
    const newFile: Attachment = {
      id: Date.now().toString(),
      name: `Material_Complementar_${Math.floor(Math.random() * 100)}.pdf`,
      size: '2.4 MB',
      type: 'pdf',
      url: '#'
    };
    
    // Find current attachments
    const module = modules.find(m => m.id === moduleId);
    const lesson = module?.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const currentAttachments = lesson.attachments || [];
    updateLesson(moduleId, lessonId, { attachments: [...currentAttachments, newFile] });
    onShowToast('success', 'Arquivo Anexado', 'O material complementar foi adicionado à aula.');
  };

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-16 z-20 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-serif font-bold text-rm-green">
              {initialData ? 'Editar Curso' : 'Criar Novo Curso'}
            </h1>
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
              {activeTab === 'info' ? 'Informações da Landing Page' : 'Conteúdo e Materiais'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSave}>
            <Save size={18} className="mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-6 lg:p-10 animate-fade-in">
        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-4 px-1 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'info' 
                ? 'border-rm-gold text-rm-green font-bold' 
                : 'border-transparent text-gray-500 hover:text-rm-green'
            }`}
          >
            <Layout size={18} />
            Página do Curso
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`pb-4 px-1 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'curriculum' 
                ? 'border-rm-gold text-rm-green font-bold' 
                : 'border-transparent text-gray-500 hover:text-rm-green'
            }`}
          >
            <List size={18} />
            Grade Curricular
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'info' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Curso</label>
                  <div className="relative">
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Doce Gourmet Lucrativo 2.0"
                    />
                    <button 
                      onClick={handleGenerateAI}
                      disabled={!title || isGenerating}
                      className="absolute right-2 top-2 p-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded text-xs font-bold flex items-center gap-1 hover:opacity-90 disabled:opacity-50 shadow transition-all"
                      title="Gerar descrição com IA"
                    >
                      <Sparkles size={14} />
                      {isGenerating ? 'Criando...' : 'IA'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição Completa</label>
                  <textarea 
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rm-gold focus:border-transparent outline-none transition-all text-sm leading-relaxed"
                    placeholder="Descreva o que o afiliado irá aprender e os benefícios do curso..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rm-gold outline-none bg-white text-sm"
                    >
                      <option value="Vendas">Vendas & Marketing</option>
                      <option value="Gastronomia">Gastronomia</option>
                      <option value="Finanças">Finanças</option>
                      <option value="Mindset">Desenvolvimento Pessoal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nível</label>
                    <select 
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rm-gold outline-none bg-white text-sm"
                    >
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Media & Price */}
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-serif font-bold text-rm-green text-sm mb-4">Imagem de Capa</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 relative overflow-hidden group">
                     {thumbnailUrl ? (
                        <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="mx-auto text-gray-300 mb-2" size={32} />
                          <span className="text-xs text-gray-400">Arraste ou cole uma URL</span>
                        </div>
                     )}
                  </div>
                  <Input 
                    placeholder="URL da imagem (https://...)" 
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="text-xs"
                  />
               </div>
               
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Preço (R$)</label>
                  <Input 
                    type="number"
                    placeholder="0.00" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-2">Deixe 0 para cursos gratuitos para afiliados.</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-xl font-bold text-rm-green font-serif">Conteúdo do Curso</h3>
                <p className="text-gray-500 text-sm">Organize suas aulas, vídeos e materiais.</p>
              </div>
              <Button onClick={addModule} variant="secondary" className="py-2 text-sm">
                <Plus size={16} /> Novo Módulo
              </Button>
            </div>

            {modules.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <List size={32} />
                </div>
                <h4 className="text-gray-600 font-medium mb-2">Seu curso está vazio</h4>
                <Button onClick={addModule} variant="outline">Criar Primeiro Módulo</Button>
              </div>
            )}

            <div className="space-y-4">
              {modules.map((module, index) => (
                <div key={module.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-200">
                  {/* Module Header */}
                  <div className="bg-gray-50 px-4 py-3 flex flex-col group transition-colors cursor-pointer" onClick={() => toggleModuleExpand(module.id)}>
                    <div className="flex items-center justify-between w-full">
                       <div className="flex items-center gap-3 flex-1">
                          <span className="text-gray-400">
                            {expandedModules[module.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </span>
                          <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="text" 
                              value={module.title}
                              onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                              className="bg-transparent border-none focus:ring-0 font-bold text-gray-800 w-full hover:bg-white/50 rounded px-2 transition-colors placeholder-gray-500"
                              placeholder="Nome do Módulo"
                            />
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeModule(module.id); }} 
                            className="p-2 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                    {/* Module Description Input (Visible only if expanded or has text) */}
                    {(expandedModules[module.id] || module.description) && (
                       <div className="ml-10 mt-2" onClick={(e) => e.stopPropagation()}>
                          <input 
                             type="text" 
                             value={module.description || ''}
                             onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                             className="w-full text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-rm-gold focus:outline-none transition-colors"
                             placeholder="Adicione uma breve observação ou descrição do módulo..."
                          />
                       </div>
                    )}
                  </div>

                  {/* Module Content (Lessons) */}
                  {expandedModules[module.id] && (
                    <div className="bg-white">
                      {module.lessons.map((lesson, lIndex) => (
                        <div key={lesson.id} className="border-t border-gray-100">
                          {/* Lesson Summary Row */}
                          <div 
                            className={`flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${editingLessonId === lesson.id ? 'bg-blue-50/30' : ''}`}
                            onClick={() => setEditingLessonId(editingLessonId === lesson.id ? null : lesson.id)}
                          >
                            <GripVertical size={16} className="text-gray-300 cursor-move" />
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${lesson.videoUrl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                              {lesson.videoUrl ? <CheckSquare size={12} /> : lIndex + 1}
                            </div>
                            <span className="flex-1 font-medium text-gray-700 text-sm">{lesson.title}</span>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {lesson.videoUrl && <span className="flex items-center gap-1"><Video size={12}/> Vídeo</span>}
                              {lesson.attachments && lesson.attachments.length > 0 && <span className="flex items-center gap-1"><Paperclip size={12}/> {lesson.attachments.length}</span>}
                              <span>{lesson.duration}</span>
                              <ChevronDown size={16} className={`transform transition-transform ${editingLessonId === lesson.id ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {/* Lesson Detail Editor (Expanded) */}
                          {editingLessonId === lesson.id && (
                            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-6 animate-fade-in">
                              
                              {/* 1. Basic Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input 
                                  label="Título da Aula" 
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                />
                                <div className="flex gap-4">
                                   <div className="w-32">
                                     <Input 
                                        label="Duração" 
                                        value={lesson.duration}
                                        onChange={(e) => updateLesson(module.id, lesson.id, { duration: e.target.value })}
                                        placeholder="00:00"
                                      />
                                   </div>
                                   <div className="flex-1 pt-8">
                                      <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
                                        <input 
                                          type="checkbox" 
                                          checked={lesson.isFreePreview}
                                          onChange={(e) => updateLesson(module.id, lesson.id, { isFreePreview: e.target.checked })}
                                          className="rounded text-rm-gold focus:ring-rm-gold border-gray-300"
                                        />
                                        Aula Gratuita (Preview)
                                      </label>
                                   </div>
                                </div>
                              </div>

                              {/* 2. Video Content */}
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                  <Video size={16} className="text-rm-gold" /> Conteúdo em Vídeo
                                </h4>
                                <div className="flex gap-4 mb-3 text-sm">
                                  <button 
                                    onClick={() => updateLesson(module.id, lesson.id, { videoType: 'upload' })}
                                    className={`px-3 py-1.5 rounded-full border transition-all ${lesson.videoType === 'upload' ? 'bg-rm-green text-white border-rm-green' : 'bg-white border-gray-200 text-gray-600'}`}
                                  >
                                    Upload de Arquivo
                                  </button>
                                  <button 
                                    onClick={() => updateLesson(module.id, lesson.id, { videoType: 'embed' })}
                                    className={`px-3 py-1.5 rounded-full border transition-all ${lesson.videoType === 'embed' ? 'bg-rm-green text-white border-rm-green' : 'bg-white border-gray-200 text-gray-600'}`}
                                  >
                                    Link Externo (YouTube/Vimeo)
                                  </button>
                                </div>

                                {lesson.videoType === 'embed' ? (
                                  <Input 
                                    placeholder="Cole a URL do vídeo aqui..." 
                                    value={lesson.videoUrl || ''}
                                    onChange={(e) => updateLesson(module.id, lesson.id, { videoUrl: e.target.value })}
                                  />
                                ) : (
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                                     <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:bg-white group-hover:text-rm-gold transition-colors">
                                       <Upload size={20} />
                                     </div>
                                     <p className="text-sm font-medium text-gray-700">Clique para selecionar o vídeo</p>
                                     <p className="text-xs text-gray-400 mt-1">MP4, MOV ou AVI (Máx 2GB)</p>
                                  </div>
                                )}
                              </div>

                              {/* 3. Description & Attachments */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                   <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição da Aula / Notas</label>
                                   <textarea 
                                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rm-gold focus:border-transparent outline-none transition-all text-sm h-32"
                                      placeholder="Adicione observações ou resumo da aula..."
                                      value={lesson.description || ''}
                                      onChange={(e) => updateLesson(module.id, lesson.id, { description: e.target.value })}
                                   />
                                </div>
                                
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">Materiais Complementares</label>
                                    <button 
                                      onClick={() => addAttachment(module.id, lesson.id)}
                                      className="text-xs font-bold text-rm-gold hover:underline flex items-center gap-1"
                                    >
                                      <Plus size={12} /> Adicionar
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {lesson.attachments?.map(file => (
                                      <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                           <div className="p-1.5 bg-red-50 text-red-500 rounded">
                                              <FileText size={14} />
                                           </div>
                                           <div className="truncate">
                                             <p className="font-medium text-gray-700 truncate">{file.name}</p>
                                             <p className="text-[10px] text-gray-400">{file.size}</p>
                                           </div>
                                        </div>
                                        <button 
                                          onClick={() => removeAttachment(module.id, lesson.id, file.id)}
                                          className="text-gray-400 hover:text-red-500"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ))}
                                    {(!lesson.attachments || lesson.attachments.length === 0) && (
                                       <div className="text-center p-4 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 bg-white">
                                          Nenhum arquivo anexado.
                                       </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end pt-2">
                                 <button 
                                   onClick={() => removeLesson(module.id, lesson.id)}
                                   className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1"
                                 >
                                   <Trash2 size={12} /> Excluir Aula
                                 </button>
                              </div>

                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add Lesson Button */}
                      <button 
                        onClick={() => addLesson(module.id)}
                        className="w-full py-3 border-t border-gray-200 text-sm font-semibold text-gray-500 hover:text-rm-green hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={16} /> Adicionar Conteúdo
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