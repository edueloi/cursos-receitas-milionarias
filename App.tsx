import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole, Course } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { api } from './services/api'; // Import API service

// Pages
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import MyCoursesPage from './pages/MyCoursesPage';
import CertificatesPage from './pages/CertificatesPage';
import CertificateValidatePage from './pages/CertificateValidatePage';
import SignaturePage from './pages/SignaturePage';
import PlayerPage from './pages/PlayerPage';
import SettingsPage from './pages/SettingsPage';
import AffiliatesPage from './pages/AffiliatesPage';
import HelpPage from './pages/HelpPage';

// Instructor Pages
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import InstructorCoursesPage from './pages/InstructorCoursesPage';
import AdminCourseCreate from './pages/AdminCourseCreate';

// Components
import Button from './components/ui/Button';
import ToastContainer, { ToastMessage } from './components/ui/Toast';
import { ExternalLink, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(() => {
    return !!(localStorage.getItem('rm_token') || sessionStorage.getItem('rm_token'));
  });
  const [postLoginPath, setPostLoginPath] = useState<string | null>(null);
  const [myCourseIds, setMyCourseIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, { completadas: string[] }>>({});
  const [certificateMap, setCertificateMap] = useState<Record<string, { code: string; completedAt: string }>>({});
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // State for content management
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null); // For editing

  // PWA Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      
      // Store event and show button ONLY if:
      // 1. Not already installed
      // 2. Is on a mobile device (screen width < 1024)
      const isMobile = window.innerWidth < 1024;
      
      if (!isStandalone && isMobile) {
        setDeferredPrompt(e);
        setShowInstallBtn(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowInstallBtn(false);
      } else if (deferredPrompt) {
        setShowInstallBtn(true);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('resize', handleResize);
    };
  }, [deferredPrompt]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    }
  };

  // --- Auto Login Logic ---
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('rm_token') || sessionStorage.getItem('rm_token');
      if (storedToken) {
        setIsLoading(true);
        try {
          const userData = await api.getMe(storedToken);
          setUser(userData);
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

  useEffect(() => {
    const storedRemember = localStorage.getItem('rm_remember');
    if (storedRemember === 'true') {
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      setPostLoginPath(location.pathname);
    }
  }, [user, location.pathname]);

  const refreshCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      addToast('error', 'Erro ao buscar cursos', 'Nao foi possivel carregar os cursos.');
    }
  };

  useEffect(() => {
    if (user) {
      refreshCourses();
    }
  }, [user]);

  const refreshLists = async () => {
    if (!user?.email) return;
    try {
      const lists = await api.getUserLists(user.email);
      setMyCourseIds(lists.meusCursos);
      setFavoriteIds(lists.favoritos);
      const progress = await api.getUserProgress(user.email);
      setProgressMap(progress);
      const certificates = await api.getUserCertificates(user.email);
      setCertificateMap(certificates);
    } catch (error) {
      console.error('Erro ao buscar listas do usuario:', error);
    }
  };

  useEffect(() => {
    refreshLists();
  }, [user]);

  const pathFromTab: Record<string, string> = {
    dashboard: '/painel',
    courses: '/cursos',
    'my-courses': '/meus-cursos',
    certificates: '/certificados',
    settings: '/perfil',
    instructor: '/produtor',
    'instructor-courses': '/gerenciar-cursos',
    'create-course': '/criar-curso',
    signature: '/assinatura',
    help: '/ajuda'
  };

  const tabFromPath = (pathname: string) => {
    if (pathname.startsWith('/painel') || pathname === '/') return 'dashboard';
    if (pathname.startsWith('/cursos')) return 'courses';
    if (pathname.startsWith('/meus-cursos')) return 'my-courses';
    if (pathname.startsWith('/certificados')) return 'certificates';
    if (pathname.startsWith('/perfil')) return 'settings';
    if (pathname.startsWith('/gerenciar-cursos')) return 'instructor-courses';
    if (pathname.startsWith('/criar-curso')) return 'create-course';
    if (pathname.startsWith('/produtor')) return 'instructor';
    if (pathname.startsWith('/assinatura')) return 'signature';
    if (pathname.startsWith('/ajuda')) return 'help';
    return 'dashboard';
  };

  const activeTab = tabFromPath(location.pathname);
  const isProducer = user?.role !== UserRole.AFFILIATE;

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
      const authData = await api.login(email, password);
      
      if (authData.token) {
        const token = authData.token;
        if (rememberMe) {
          localStorage.setItem('rm_token', token);
          sessionStorage.removeItem('rm_token');
        } else {
          sessionStorage.setItem('rm_token', token);
          localStorage.removeItem('rm_token');
        }
        localStorage.setItem('rm_remember', rememberMe ? 'true' : 'false');
        const userData = await api.getMe(token);
        setUser(userData);
        api.upsertUserProfile(userData.email, userData.name).catch(() => {});
        addToast('success', 'Login realizado com sucesso!', `Bem-vindo, ${userData.name.split(' ')[0]}.`);
        const nextPath = postLoginPath || '/painel';
        setPostLoginPath(null);
        navigate(nextPath);
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
    setEditingCourse(null);
    setEmail('');
    setPassword('');
    addToast('info', 'Você saiu do sistema.', 'Até logo!');
    navigate('/login');
  };

  const navigateTo = (tab: string) => {
    const path = pathFromTab[tab] || '/painel';
    navigate(path);
    if (tab !== 'create-course') {
       setEditingCourse(null);
    }
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSaveCourse = (course: Course) => {
    if (editingCourse) {
      setEditingCourse(null);
      addToast('success', 'Curso Atualizado!', 'As alterações foram salvas com sucesso.');
    } else {
      addToast('success', 'Curso Criado!', 'Seu novo curso foi salvo como rascunho.');
    }
    refreshCourses();
    navigate(user?.role === UserRole.ADMIN ? '/gerenciar-cursos' : '/cursos');
  };

  const handleCreateNew = () => {
    setEditingCourse(null);
    navigate('/criar-curso');
  };

  const handleEdit = (course: Course) => {
    if (course.creatorEmail && course.creatorEmail !== user?.email) {
      addToast('error', 'Sem permissao', 'Apenas o dono pode editar este curso.');
      return;
    }
    setEditingCourse(course);
    navigate('/criar-curso');
  };

  const handleDeleteCourse = async (course: Course) => {
    if (course.creatorEmail && course.creatorEmail !== user?.email) {
      addToast('error', 'Sem permissao', 'Apenas o dono pode excluir este curso.');
      return;
    }
    try {
      await api.deleteCourse(course.id, user?.email || '');
      addToast('success', 'Curso excluido!', 'O curso foi removido com sucesso.');
      refreshCourses();
      refreshLists();
    } catch (error: any) {
      addToast('error', 'Falha ao excluir', error.message || 'Erro ao excluir curso.');
    }
  };

  const handleMarkLessonComplete = async (courseId: string, lessonId: string) => {
    if (!user?.email) return;
    try {
      const progress = await api.updateProgress(user.email, courseId, lessonId, true);
      setProgressMap(progress);
      const course = courses.find(c => c.id === courseId);
      if (course) {
        let total = 0;
        course.modules.forEach(m => (total += m.lessons.length));
        const completed = progress[courseId]?.completadas?.length || 0;
        if (total > 0 && completed >= total && !certificateMap[courseId]) {
          const now = new Date().toISOString();
          const certs = await api.setUserCertificate(user.email, courseId, now, user.name);
          setCertificateMap(certs);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const applyProgress = (list: Course[]) => {
    return list.map(course => {
      const completed = new Set(progressMap[course.id]?.completadas || []);
      let totalLessons = 0;
      let completedLessons = 0;
      const modules = course.modules.map(mod => ({
        ...mod,
        lessons: mod.lessons.map(lesson => {
          totalLessons += 1;
          const isCompleted = completed.has(lesson.id);
          if (isCompleted) completedLessons += 1;
          return { ...lesson, completed: isCompleted };
        })
      }));
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return { ...course, modules, progress };
    });
  };

  const coursesWithProgress = applyProgress(courses);

  useEffect(() => {
    const ensureCertificates = async () => {
      if (!user?.email) return;
      for (const course of courses) {
        let total = 0;
        course.modules.forEach(m => (total += m.lessons.length));
        const completed = progressMap[course.id]?.completadas?.length || 0;
        if (total > 0 && completed >= total && !certificateMap[course.id]) {
          try {
            const now = new Date().toISOString();
            const certs = await api.setUserCertificate(user.email, course.id, now, user.name);
            setCertificateMap(certs);
          } catch (error) {
            console.error('Erro ao gerar certificado:', error);
          }
        }
      }
    };
    ensureCertificates();
  }, [user, courses, progressMap, certificateMap]);

  const handleAddToMyCourses = async (course: Course) => {
    if (!user?.email) return;
    if (myCourseIds.includes(course.id)) {
      addToast('info', 'Ja esta nos seus cursos', course.title);
      return;
    }
    try {
      const updated = await api.updateMyCourses(user.email, course.id, 'add');
      setMyCourseIds(updated);
      addToast('success', 'Adicionado!', 'Curso adicionado aos seus cursos.');
    } catch (error: any) {
      addToast('error', 'Falha ao adicionar', error.message || 'Erro ao atualizar seus cursos.');
    }
  };

  const handleToggleFavorite = async (course: Course) => {
    if (!user?.email) return;
    const isFav = favoriteIds.includes(course.id);
    try {
      const updated = await api.updateFavorites(user.email, course.id, isFav ? 'remove' : 'add');
      setFavoriteIds(updated);
      addToast('success', isFav ? 'Removido dos favoritos' : 'Favoritado!', course.title);
    } catch (error: any) {
      addToast('error', 'Falha ao favoritar', error.message || 'Erro ao atualizar favoritos.');
    }
  };

  const handleSelectCourse = (course: Course) => {
    navigate(`/curso/${course.id}`);
  };

  const PlayerRoute = () => {
    const courseId = location.pathname.split('/')[2] || '';
    if (coursesWithProgress.length === 0) {
      return (
        <div className="min-h-screen bg-gray-900 font-sans">
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          <div className="p-10 text-center text-white">Carregando curso...</div>
        </div>
      );
    }
    const course = coursesWithProgress.find(c => c.id === courseId);
    if (!course) {
      return (
        <div className="min-h-screen bg-gray-900 font-sans">
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          <div className="p-10 text-center text-white">Curso nao encontrado.</div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gray-900 font-sans">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <PlayerPage
          course={course}
          user={user}
          onBack={() => navigate('/cursos')}
          onMarkLessonComplete={handleMarkLessonComplete}
        />
      </div>
    );
  };

  // 1. New PREMIUM Login Screen - Optimized for Mobile
  const loginScreen = (
      <div className="min-h-screen w-full flex font-sans overflow-hidden bg-[#0a1a14] relative">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        
        {/* Full Page Background Image (Works on Mobile and Desktop) */}
        <div 
           className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 scale-105"
           style={{ 
             backgroundImage: 'url("https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop")',
           }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1C3B32]/95 via-[#1C3B32]/80 to-transparent lg:from-[#1C3B32]/100 lg:via-[#1C3B32]/40 lg:to-transparent"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row h-full min-h-screen">
          
          {/* Left Side: Desktop Branding Title */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 space-y-10">
             <div className="flex items-center gap-4">
               <div className="bg-white p-3 rounded-2xl shadow-2xl flex items-center justify-center w-16 h-16 transform hover:rotate-3 transition-transform">
                  <img src="https://receitasmilionarias.com.br/static/images/logo-academy.png" alt="Logo" className="h-full w-full object-contain" />
               </div>
               <div className="flex flex-col">
                 <span className="font-serif font-bold text-white text-4xl leading-none">Receitas</span>
                 <span className="font-serif font-bold text-rm-gold text-4xl leading-none">Milionárias</span>
               </div>
             </div>

             <div className="max-w-xl">
               <h2 className="text-6xl font-serif font-bold text-white leading-tight">
                 A <span className="text-rm-gold">Academy</span> definitiva para produtores.
               </h2>
               <p className="text-xl text-white/70 mt-6 font-light leading-relaxed">
                 Transforme seu conhecimento em um império de vendas com as melhores estratégias e materiais exclusivos.
               </p>
             </div>
             
             <div className="flex items-center gap-6 pt-4">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                    <div key={i} className={`w-12 h-12 rounded-full border-2 border-[#1C3B32] bg-gray-200 overflow-hidden`}>
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="user" />
                    </div>
                 ))}
                 <div className="w-12 h-12 rounded-full border-2 border-[#1C3B32] bg-rm-gold flex items-center justify-center text-xs font-bold text-white">
                   +2k
                 </div>
               </div>
               <p className="text-sm font-medium text-white/60">Afiliados já faturando na Academy</p>
             </div>
          </div>

          {/* Right Side: Login Form (Optimized for Mobile) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative">
            
            {/* Mobile Header Branding */}
            <div className="lg:hidden flex flex-col items-center mb-10 w-full animate-fade-in">
               <div className="relative">
                 <div className="absolute inset-0 bg-rm-gold/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                 <div className="bg-white p-4 rounded-3xl shadow-2xl relative z-10 w-24 h-24 flex items-center justify-center overflow-hidden border-2 border-white/50">
                    <img 
                      src="https://receitasmilionarias.com.br/static/images/logo-academy.png" 
                      alt="Academy Logo" 
                      className="h-full w-full object-contain"
                    />
                 </div>
               </div>
               <h1 className="mt-5 font-serif font-bold text-4xl text-white tracking-tight drop-shadow-xl">
                 Academy
               </h1>
            </div>

            {/* Login Card: Glassmorphism Design */}
            <div className="w-full max-w-[440px] bg-white/10 lg:bg-white/95 backdrop-blur-2xl lg:backdrop-blur-none rounded-[2.5rem] border border-white/20 lg:border-none shadow-[0_25px_80px_rgba(0,0,0,0.4)] p-8 lg:p-12 animate-fade-in-up">
              
              <div className="text-center mb-10">
                <h3 className="text-2xl lg:text-3xl font-serif font-bold text-white lg:text-gray-900">Portal do Membro</h3>
                <p className="text-white/60 lg:text-gray-500 text-sm mt-3 font-medium">Acesse sua conta para continuar</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                 <div className="space-y-2">
                   <div className="group relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 lg:text-gray-400 group-focus-within:text-rm-gold transition-colors">
                        <Mail size={22} />
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 lg:bg-gray-50 border border-white/10 lg:border-gray-200 focus:bg-white/20 lg:focus:bg-white text-white lg:text-gray-800 outline-none transition-all placeholder-white/30 lg:placeholder-gray-400 font-medium"
                        placeholder="Seu e-mail"
                        required
                      />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <div className="group relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 lg:text-gray-400 group-focus-within:text-rm-gold transition-colors">
                        <Lock size={22} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/10 lg:bg-gray-50 border border-white/10 lg:border-gray-200 focus:bg-white/20 lg:focus:bg-white text-white lg:text-gray-800 outline-none transition-all placeholder-white/30 lg:placeholder-gray-400 font-medium"
                        placeholder="Sua senha"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 lg:text-gray-400 hover:text-rm-gold transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                   </div>
                 </div>

                 <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-3 cursor-pointer group px-1">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="peer appearance-none w-5 h-5 rounded-md border-2 border-white/30 lg:border-gray-300 checked:bg-rm-gold checked:border-rm-gold transition-all cursor-pointer" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <ShieldCheck className="absolute text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" size={14} />
                      </div>
                      <span className="text-sm font-medium text-white/70 lg:text-gray-600 select-none">Manter logado</span>
                    </label>
                    <a href="#" className="text-sm font-bold text-rm-gold hover:text-rm-gold/80 transition-colors">Esqueceu a senha?</a>
                 </div>

                 <Button 
                    type="submit"
                    variant="secondary" 
                    isLoading={isLoading}
                    className="w-full py-4.5 rounded-2xl text-base font-bold shadow-2xl hover:shadow-rm-gold/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-rm-gold via-yellow-500 to-rm-gold bg-[length:200%_100%] animate-gradient border-0 text-white"
                 >
                    {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
                    {!isLoading && <ArrowRight size={20} className="ml-1" />}
                 </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-white/10 lg:border-gray-100">
                 <p className="text-center text-sm font-medium text-white/60 lg:text-gray-500 mb-6">
                   Novo por aqui? <a href="https://receitasmilionarias.com.br/cadastro.html" target="_blank" className="font-bold text-rm-gold hover:underline">Crie sua conta</a>
                 </p>
                 
                 {/* Install App Button (Mobile Only) */}
                 {showInstallBtn && (
                   <div className="px-2">
                     <button 
                       onClick={handleInstallApp}
                       className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 lg:text-emerald-600 border border-emerald-400/30 font-bold text-sm tracking-wide group transition-all hover:bg-emerald-500/30 active:scale-95"
                     >
                       <Zap size={18} className="fill-emerald-400 animate-pulse" />
                       Instalar Aplicativo Oficial
                     </button>
                   </div>
                 )}
              </div>
            </div>
            
            {/* Desktop Footer Only */}
            <div className="absolute bottom-8 left-0 right-0 hidden lg:block text-center text-white/30 text-xs font-medium">
               &copy; 2025 Receitas Milionárias Academy • Protocolo de Segurança SSL
            </div>

          </div>
        </div>
      </div>
    );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1C3B32]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-rm-gold/30 border-t-rm-gold rounded-full animate-spin"></div>
          <span className="text-white text-sm font-bold tracking-widest uppercase">Academy</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={loginScreen} />
        <Route path="/certificados/validar/:code" element={<CertificateValidatePage courses={[]} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith('/curso/')) {
    return <PlayerRoute />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col w-full overflow-x-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Header 
        user={user} 
        onLogout={handleLogout}
        onNavigate={navigateTo}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        user={user} 
        activeTab={activeTab}
        onTabChange={navigateTo}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <main className="flex-1 transition-all duration-300 mt-16 sm:mt-[68px] w-full max-w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/painel" replace />} />
          <Route path="/login" element={<Navigate to="/painel" replace />} />
          <Route path="/dashboard" element={<Navigate to="/painel" replace />} />
          <Route path="/courses" element={<Navigate to="/cursos" replace />} />
          <Route path="/my-courses" element={<Navigate to="/meus-cursos" replace />} />
          <Route path="/certificates" element={<Navigate to="/certificados" replace />} />
          <Route path="/settings" element={<Navigate to="/perfil" replace />} />
          <Route path="/instructor" element={<Navigate to="/produtor" replace />} />
          <Route path="/instructor-courses" element={<Navigate to="/gerenciar-cursos" replace />} />
          <Route path="/create-course" element={<Navigate to="/criar-curso" replace />} />

          <Route path="/painel" element={<DashboardPage user={user!} />} />
          <Route path="/cursos" element={<CoursesPage courses={coursesWithProgress} onSelectCourse={handleSelectCourse} user={user} myCourseIds={myCourseIds} onAddToMyCourses={handleAddToMyCourses} />} />
          <Route path="/meus-cursos" element={<MyCoursesPage courses={coursesWithProgress} onSelectCourse={handleSelectCourse} user={user} myCourseIds={myCourseIds} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />} />
          <Route path="/certificados" element={<CertificatesPage courses={coursesWithProgress} user={user} certificateMap={certificateMap} />} />
          <Route path="/certificados/validar/:code" element={<CertificateValidatePage courses={coursesWithProgress} />} />
          <Route path="/perfil" element={<SettingsPage user={user!} />} />
          <Route path="/produtor" element={isProducer ? <InstructorDashboardPage currentUser={user} /> : <Navigate to="/painel" replace />} />
          <Route path="/gerenciar-cursos" element={isProducer ? <InstructorCoursesPage courses={coursesWithProgress} currentUser={user} onCreateCourse={handleCreateNew} onEditCourse={handleEdit} onDeleteCourse={handleDeleteCourse} /> : <Navigate to="/painel" replace />} />
          <Route path="/criar-curso" element={
            isProducer ? (
              <AdminCourseCreate 
                initialData={editingCourse}
                currentUser={user}
                onSave={handleSaveCourse}
                onCancel={() => {
                  setEditingCourse(null);
                  navigate('/gerenciar-cursos');
                }}
                onShowToast={addToast}
              />
            ) : (
              <Navigate to="/painel" replace />
            )
          } />
          <Route path="/assinatura" element={<SignaturePage user={user} onShowToast={addToast} />} />

          <Route path="/ajuda" element={<HelpPage />} />
          <Route path="*" element={<div className="p-10 text-center">Pagina nao encontrada.</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
