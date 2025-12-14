import React, { useState, useEffect } from 'react';
import { User, UserRole, Course } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { api } from './services/api'; // Import API service

// Pages
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import MyCoursesPage from './pages/MyCoursesPage';
import CertificatesPage from './pages/CertificatesPage';
import PlayerPage from './pages/PlayerPage';
import SettingsPage from './pages/SettingsPage';
import AffiliatesPage from './pages/AffiliatesPage';

// Instructor Pages
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import InstructorCoursesPage from './pages/InstructorCoursesPage';
import AdminCourseCreate from './pages/AdminCourseCreate';

// Components
import Button from './components/ui/Button';
import ToastContainer, { ToastMessage } from './components/ui/Toast';
import { ExternalLink, Globe, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';

// Initial Mock Data with Requested YouTube Video
const YOUTUBE_VIDEO_URL = "https://www.youtube.com/embed/_tnDpt9jSWM";

const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Mestre das Vendas Orgânicas',
    description: 'Aprenda a vender receitas sem investir em anúncios. Estratégias de TikTok e Instagram.',
    thumbnailUrl: 'https://picsum.photos/id/42/800/600',
    totalDuration: '4h 30m',
    progress: 35,
    category: 'Vendas',
    status: 'published',
    modules: [
      {
        id: 'm1',
        title: 'Fundamentos do Tráfego Orgânico',
        description: 'Conceitos base para iniciar.',
        lessons: [
          { 
            id: 'l1', 
            title: 'Como funciona o algoritmo', 
            duration: '12:00', 
            completed: true, 
            videoType: 'embed',
            videoUrl: YOUTUBE_VIDEO_URL 
          },
          { 
            id: 'l2', 
            title: 'Criando conteúdo viral', 
            duration: '15:30', 
            completed: false,
            videoType: 'embed',
            videoUrl: YOUTUBE_VIDEO_URL
          },
        ]
      },
      {
        id: 'm2',
        title: 'Copywriting para Legendas',
        lessons: [
          { 
            id: 'l3', 
            title: 'Gatilhos mentais', 
            duration: '20:00', 
            completed: false,
            videoType: 'embed',
            videoUrl: YOUTUBE_VIDEO_URL
          },
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Confeitaria Lucrativa 2.0',
    description: 'Técnicas avançadas de produção e precificação para maximizar seus lucros.',
    thumbnailUrl: 'https://picsum.photos/id/292/800/600',
    totalDuration: '8h 15m',
    progress: 100,
    category: 'Gastronomia',
    status: 'published',
    modules: [
      {
        id: 'm1',
        title: 'Precificação Correta',
        lessons: [
          { 
            id: 'l1', 
            title: 'Planilha de custos', 
            duration: '45:00', 
            completed: true,
            videoType: 'embed',
            videoUrl: YOUTUBE_VIDEO_URL
          },
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Mindset Milionário',
    description: 'Desenvolva a mentalidade necessária para faturar alto no mercado digital.',
    thumbnailUrl: 'https://picsum.photos/id/106/800/600',
    totalDuration: '2h 00m',
    progress: 0,
    category: 'Marketing',
    status: 'draft',
    modules: []
  }
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // State for content management
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); // For playing
  const [editingCourse, setEditingCourse] = useState<Course | null>(null); // For editing
  const [isCreating, setIsCreating] = useState(false); // For creating new

  // --- Auto Login Logic ---
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('rm_token') || sessionStorage.getItem('rm_token');
      if (storedToken) {
        setIsLoading(true);
        try {
          const userData = await api.getMe(storedToken);
          setUser(userData);
          // Only show toast if it's a fresh load, not necessary but nice
        } catch (error) {
          console.error("Session expired", error);
          localStorage.removeItem('rm_token');
          sessionStorage.removeItem('rm_token');
        } finally {
          setIsLoading(false);
        }
      }
    };
    checkSession();
  }, []);

  // Toast Handler
  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Real Login Logic
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Authenticate
      const authData = await api.login(email, password);
      
      if (authData.token) {
        const token = authData.token;
        
        // 2. Persist Token based on "Remember Me"
        if (rememberMe) {
          localStorage.setItem('rm_token', token);
        } else {
          sessionStorage.setItem('rm_token', token);
        }

        // 3. Fetch User Profile
        const userData = await api.getMe(token);
        
        setUser(userData);
        addToast('success', 'Login realizado com sucesso!', `Bem-vindo, ${userData.name.split(' ')[0]}.`);
        setActiveTab('dashboard');
      }
    } catch (error: any) {
      console.error(error);
      addToast('error', 'Falha no Login', error.message || 'Verifique suas credenciais e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rm_token');
    sessionStorage.removeItem('rm_token');
    setUser(null);
    setSelectedCourse(null);
    setEditingCourse(null);
    setIsCreating(false);
    setEmail('');
    setPassword('');
    addToast('info', 'Você saiu do sistema.', 'Até logo!');
  };

  // Navigation Logic
  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    // Reset secondary states when changing main tabs
    if (!['create-course'].includes(tab)) {
       setIsCreating(false);
       setEditingCourse(null);
       setSelectedCourse(null);
    }
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Course Management Handlers
  const handleSaveCourse = (course: Course) => {
    if (editingCourse) {
      setCourses(courses.map(c => c.id === course.id ? course : c));
      setEditingCourse(null);
      addToast('success', 'Curso Atualizado!', 'As alterações foram salvas com sucesso.');
    } else {
      setCourses([...courses, { ...course, status: 'draft' }]); // Default new to draft
      setIsCreating(false);
      addToast('success', 'Curso Criado!', 'Seu novo curso foi salvo como rascunho.');
    }
    // Return to appropriate list based on role
    setActiveTab(user?.role === UserRole.ADMIN ? 'instructor-courses' : 'courses');
  };

  const handleCreateNew = () => {
    setEditingCourse(null);
    setIsCreating(true);
    setActiveTab('create-course');
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsCreating(false);
    setActiveTab('create-course');
  };

  // RENDER LOGIC
  const renderContent = () => {
    // 0. Player Mode (Priority: If a course is selected, show player)
    if (selectedCourse) {
      return (
        <PlayerPage 
          course={selectedCourse} 
          onBack={() => setSelectedCourse(null)} 
        />
      );
    }

    // 1. Creator/Edit Mode
    if (activeTab === 'create-course' || isCreating || editingCourse) {
       return (
         <AdminCourseCreate 
           initialData={editingCourse}
           onSave={handleSaveCourse}
           onCancel={() => {
             setIsCreating(false);
             setEditingCourse(null);
             setActiveTab('instructor-courses');
           }}
           onShowToast={addToast}
         />
       );
    }

    // 2. Tab Routing
    switch (activeTab) {
      // Global / Student Routes
      case 'dashboard':
        return <DashboardPage user={user!} />;
      case 'courses':
        return <CoursesPage courses={courses} onSelectCourse={setSelectedCourse} />;
      case 'my-courses':
        return <MyCoursesPage courses={courses} onSelectCourse={setSelectedCourse} />;
      case 'certificates':
        return <CertificatesPage />;
      case 'settings':
        return <SettingsPage user={user!} />;
      
      // Instructor Routes
      case 'instructor':
        return <InstructorDashboardPage />;
      case 'instructor-courses':
        return <InstructorCoursesPage courses={courses} onCreateCourse={handleCreateNew} onEditCourse={handleEdit} />;
      case 'affiliates':
        return <AffiliatesPage />;
        
      default:
        return <div className="p-10 text-center">Página não encontrada.</div>;
    }
  };

  // 1. Login Screen (New Premium Design - Mobile First)
  if (!user) {
    return (
      <div className="min-h-screen w-full flex font-sans overflow-hidden">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        {/* Left Side (Desktop Only) - Image & Branding */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r-4 border-rm-gold bg-[#1C3B32]">
           {/* Background Image */}
           <div 
             className="absolute inset-0 bg-cover bg-center z-0 opacity-40 scale-105"
             style={{ 
               backgroundImage: 'url("https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop")',
             }}
           ></div>
           
           {/* Content */}
           <div className="relative z-20">
             <div className="flex items-center gap-3 select-none mb-8">
               <img 
                 src="https://receitasmilionarias.com.br/static/images/logo.png" 
                 alt="Logo" 
                 className="h-14 w-14 object-contain"
               />
               <div className="flex flex-col">
                 <span className="font-serif font-bold text-white text-3xl leading-none tracking-wide">Receitas</span>
                 <span className="font-serif font-bold text-rm-gold text-3xl leading-none tracking-wide">Milionárias</span>
               </div>
             </div>
           </div>

           <div className="relative z-20 text-white max-w-lg space-y-6">
             <h2 className="text-5xl font-serif font-bold leading-tight">
               Transforme suas <span className="text-rm-gold">Receitas</span> em um Império.
             </h2>
             <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-rm-gold mt-1" size={20} />
                  <p className="text-lg opacity-90 font-light">Acesso exclusivo à Academy para afiliados.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-rm-gold mt-1" size={20} />
                  <p className="text-lg opacity-90 font-light">Painel Afiliado e materiais inclusos.</p>
                </div>
             </div>
           </div>

           <div className="relative z-20 text-xs text-white/50">
             © 2024 Receitas Milionárias Academy. Todos os direitos reservados.
           </div>
        </div>

        {/* Right Side / Mobile Full Screen - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen bg-[#1C3B32] lg:bg-[#F8F9FA] relative">
          
          {/* Mobile Decor (Background Gradient) */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C3B32] to-[#0f241e] lg:hidden z-0"></div>
          
          <div className="w-full max-w-md z-10 px-6 py-8 flex flex-col h-full lg:h-auto justify-center">
            
            {/* Logo centered above card on Mobile */}
            <div className="lg:hidden flex flex-col items-center mb-8 animate-fade-in">
                 <img 
                   src="https://receitasmilionarias.com.br/static/images/logo.png" 
                   alt="Logo" 
                   className="h-20 w-20 object-contain mb-4 drop-shadow-lg"
                 />
                 <h1 className="font-serif font-bold text-3xl text-white tracking-wide">Receitas <span className="text-rm-gold">Milionárias</span></h1>
                 <p className="text-white/70 text-sm mt-1 uppercase tracking-widest font-medium">Academy</p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 w-full animate-fade-in-up border-t-8 lg:border-t-0 border-rm-gold lg:border-none">
              
              <div className="text-center mb-8 hidden lg:block">
                <h3 className="text-2xl font-serif font-bold text-rm-green">Receitas Milionárias</h3>
                <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide">Academy</p>
              </div>

              {/* Mobile Title inside card */}
              <div className="text-center mb-6 lg:hidden">
                 <h3 className="text-xl font-bold text-gray-800">Bem-vindo de volta!</h3>
                 <p className="text-gray-500 text-xs mt-1">Insira seus dados para acessar.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">E-mail</label>
                   <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rm-gold transition-colors" size={20} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rm-gold focus:ring-4 focus:ring-rm-gold/10 outline-none transition-all text-base font-medium text-gray-800 placeholder-gray-400"
                        placeholder="seu@email.com"
                        required
                      />
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-600 uppercase tracking-wider ml-1">Senha</label>
                   <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rm-gold transition-colors" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-rm-gold focus:ring-4 focus:ring-rm-gold/10 outline-none transition-all text-base font-medium text-gray-800 placeholder-gray-400"
                        placeholder="••••••••"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rm-green p-1"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                   </div>
                 </div>

                 <div className="flex items-center justify-between text-sm pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-rm-green py-2 select-none">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-rm-green focus:ring-rm-gold border-gray-300 cursor-pointer" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Lembrar-me</span>
                    </label>
                    <a href="#" className="text-rm-gold hover:underline font-bold text-sm">Esqueceu a senha?</a>
                 </div>

                 <Button 
                    type="submit"
                    variant="secondary" 
                    isLoading={isLoading}
                    className="w-full py-4 text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group mt-4 rounded-xl"
                 >
                    {isLoading ? 'Entrando...' : 'Entrar no Sistema'} {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform ml-1" />}
                 </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                 <p className="text-sm text-gray-500 mb-6">
                   Ainda não tem conta? <a href="https://receitasmilionarias.com.br/cadastro.html" target="_blank" className="text-rm-green font-bold hover:text-rm-gold transition-colors">Cadastre-se</a>
                 </p>
                 
                 <a 
                   href="https://dashboard.receitasmilionarias.com.br/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-rm-green transition-colors text-xs font-medium border border-gray-200"
                 >
                   <ExternalLink size={14} /> Ir para Painel Afiliado
                 </a>
              </div>
            </div>
            
            {/* Mobile Footer */}
            <div className="lg:hidden mt-8 text-center text-white/40 text-[10px] font-medium">
               &copy; 2024 Receitas Milionárias Academy
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 3. Layout Handling
  // If in Player Mode (Course Selected), render full screen without global navigation
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-900 font-sans">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        {renderContent()}
      </div>
    );
  }

  // Standard Dashboard Layout
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col w-full overflow-x-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Header 
        user={user} 
        onLogout={handleLogout}
        onNavigate={navigateTo}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      {/* Sidebar Drawer (Overlay) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        user={user} 
        activeTab={activeTab}
        onTabChange={navigateTo}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content - Full Width */}
      <main className="flex-1 transition-all duration-300 mt-16 w-full max-w-full">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;