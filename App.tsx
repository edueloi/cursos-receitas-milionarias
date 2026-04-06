import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole, Course } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { api } from './services/api'; 

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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // --- Functions Defined EARLY ---
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

  const activeTab = tabFromPath(location.pathname);
  const isProducer = user?.role !== UserRole.AFFILIATE;

  // --- PWA Logic ---
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone) {
        setShowInstallBtn(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    }
  };

  // --- Auto Login ---
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = localStorage.getItem('rm_token') || sessionStorage.getItem('rm_token');
      if (storedToken) {
        setIsLoading(true);
        try {
          const userData = await api.getMe(storedToken);
          setUser(userData);
        } catch (error) {
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
    if (storedRemember === 'true') setRememberMe(true);
  }, []);

  const refreshCourses = async () => {
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (e) {}
  };

  const refreshLists = async () => {
    if (!user?.email) return;
    try {
      const lists = await api.getUserLists(user.email);
      setMyCourseIds(lists.meusCursos);
      setFavoriteIds(lists.favoritos);
      const progress = await api.getUserProgress(user.email);
      setProgressMap(progress);
      const certs = await api.getUserCertificates(user.email);
      setCertificateMap(certs);
    } catch (e) {}
  };

  useEffect(() => {
    if (user) {
      refreshCourses();
      refreshLists();
    }
  }, [user]);

  // --- Handlers ---
  const navigateTo = (tab: string) => {
    const path = pathFromTab[tab] || '/painel';
    navigate(path);
    if (tab !== 'create-course') setEditingCourse(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const authData = await api.login(email, password);
      if (authData.token) {
        const token = authData.token;
        if (rememberMe) {
          localStorage.setItem('rm_token', token);
        } else {
          sessionStorage.setItem('rm_token', token);
        }
        localStorage.setItem('rm_remember', rememberMe ? 'true' : 'false');
        const userData = await api.getMe(token);
        setUser(userData);
        addToast('success', 'Bem-vindo!', `Login realizado com sucesso.`);
        navigate(postLoginPath || '/painel');
        setPostLoginPath(null);
      }
    } catch (error: any) {
      addToast('error', 'Erro', error.message || 'Credenciais invalidas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rm_token');
    sessionStorage.removeItem('rm_token');
    setUser(null);
    navigate('/login');
  };

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveCourse = (course: Course) => {
    setEditingCourse(null);
    refreshCourses();
    navigate(user?.role === UserRole.ADMIN ? '/gerenciar-cursos' : '/cursos');
  };

  const handleCreateNew = () => {
    setEditingCourse(null);
    navigate('/criar-curso');
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    navigate('/criar-curso');
  };

  const handleDeleteCourse = async (course: Course) => {
    try {
      await api.deleteCourse(course.id, user?.email || '');
      refreshCourses();
    } catch (e) {}
  };

  const handleMarkLessonComplete = async (courseId: string, lessonId: string) => {
    if (!user?.email) return;
    try {
      const progress = await api.updateProgress(user.email, courseId, lessonId, true);
      setProgressMap(prev => ({ ...prev, [courseId]: progress[courseId] }));
    } catch (e) {}
  };

  const handleAddToMyCourses = async (course: Course) => {
    if (!user?.email) return;
    try {
      const updated = await api.updateMyCourses(user.email, course.id, 'add');
      setMyCourseIds(updated);
      addToast('success', 'Adicionado!', 'Curso adicionado aos seus cursos.');
    } catch (e) {}
  };

  const handleToggleFavorite = async (course: Course) => {
    if (!user?.email) return;
    const isFav = favoriteIds.includes(course.id);
    try {
      const updated = await api.updateFavorites(user.email, course.id, isFav ? 'remove' : 'add');
      setFavoriteIds(updated);
    } catch (e) {}
  };

  const handleSelectCourse = (course: Course) => {
    navigate(`/curso/${course.id}`);
  };

  const coursesWithProgress = courses.map(course => {
    const completed = new Set(progressMap[course.id]?.completadas || []);
    let total = 0; let done = 0;
    const modules = course.modules.map(mod => ({
      ...mod,
      lessons: mod.lessons.map(lesson => {
        total++;
        if (completed.has(lesson.id)) done++;
        return { ...lesson, completed: completed.has(lesson.id) };
      })
    }));
    return { ...course, modules, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  const loginScreen = (
    <div className="min-h-screen w-full flex font-sans overflow-hidden bg-[#0A1A14] relative">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="absolute inset-0 bg-cover bg-center z-0 opacity-40 scale-105" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop")' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1C3B32]/80 to-[#0A1A14]/95 z-1"></div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center mb-10 text-center animate-fade-in w-full">
           <div className="bg-white p-3 rounded-2xl shadow-2xl mb-5 w-24 h-24 flex items-center justify-center border-2 border-white/20">
              <img 
                src="https://receitasmilionarias.com.br/static/images/logo.png" 
                alt="Academy" 
                className="w-full h-full object-contain"
                onError={(e) => {
                   (e.target as any).onerror = null;
                   (e.target as any).src = 'https://receitasmilionarias.com.br/static/images/logo-academy.png';
                }}
              />
           </div>
           <h1 className="font-serif font-bold text-4xl text-white tracking-tight drop-shadow-lg">Receitas <span className="text-rm-gold">Milionárias</span></h1>
           <p className="text-rm-gold/80 text-xs font-bold uppercase tracking-[0.4em] mt-2">Academy</p>
        </div>

        <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.5)] p-8 sm:p-10 animate-fade-in-up">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-bold text-gray-900">Bem-vindo de volta!</h3>
            <p className="text-gray-400 text-sm mt-1 font-medium">Acesse sua conta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
               <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-rm-gold outline-none transition-all text-sm font-medium text-gray-800"
                    placeholder="seu@email.com" required
                  />
               </div>
             </div>

             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Senha</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-rm-gold outline-none transition-all text-sm font-medium text-gray-800"
                    placeholder="••••••••" required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
             </div>

             <div className="flex items-center justify-between w-full py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-rm-gold bg-gray-50 checked:bg-rm-gold border-gray-200" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  <span className="text-[12px] font-bold text-gray-500">Manter logado</span>
                </label>
                <a href="#" className="text-[12px] font-bold text-rm-gold hover:underline">Esqueceu a senha?</a>
             </div>

             <Button type="submit" variant="secondary" isLoading={isLoading} className="w-full py-4.5 rounded-2xl text-base font-bold shadow-xl shadow-rm-gold/20 bg-rm-gold hover:bg-rm-goldHover text-white border-0">
                Entrar no Sistema <ArrowRight size={20} className="ml-2" />
             </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
             <p className="text-[13px] text-gray-400">Novo por aqui? <a href="https://receitasmilionarias.com.br/cadastro.html" target="_blank" className="text-rm-green font-bold">Crie sua conta</a></p>
             
             {showInstallBtn && (
               <button onClick={handleInstallApp} className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-xs uppercase tracking-wider hover:bg-emerald-100 transition-all">
                 <Zap size={16} className="fill-emerald-500 animate-pulse" /> Instalar Aplicativo Academy
               </button>
             )}
          </div>
        </div>
        <p className="mt-8 text-white/30 text-[10px] font-medium tracking-widest uppercase">&copy; 2025 Receitas Milionárias Academy</p>
      </div>
    </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#1C3B32] md:min-w-full"><div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-rm-gold"></div></div>;
  if (!user) return <Routes><Route path="/login" element={loginScreen} /><Route path="*" element={<Navigate to="/login" replace />} /></Routes>;
  
  if (location.pathname.startsWith('/curso/')) {
    const courseId = location.pathname.split('/')[2];
    const course = coursesWithProgress.find(c => c.id === courseId);
    if (!course) return <div className="p-10 text-white">Carregando...</div>;
    return <PlayerPage course={course} user={user} onBack={() => navigate('/cursos')} onMarkLessonComplete={handleMarkLessonComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col w-full overflow-x-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Header user={user} onLogout={handleLogout} onNavigate={navigateTo} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar isOpen={isSidebarOpen} user={user} activeTab={activeTab} onTabChange={navigateTo} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />
      <main className="flex-1 transition-all duration-300 mt-16 sm:mt-[68px] w-full max-w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/painel" replace />} />
          <Route path="/painel" element={<DashboardPage user={user!} />} />
          <Route path="/cursos" element={<CoursesPage courses={coursesWithProgress} onSelectCourse={handleSelectCourse} user={user} myCourseIds={myCourseIds} onAddToMyCourses={handleAddToMyCourses} />} />
          <Route path="/meus-cursos" element={<MyCoursesPage courses={coursesWithProgress} onSelectCourse={handleSelectCourse} user={user} myCourseIds={myCourseIds} favoriteIds={favoriteIds} onToggleFavorite={handleToggleFavorite} />} />
          <Route path="/certificados" element={<CertificatesPage courses={coursesWithProgress} user={user} certificateMap={certificateMap} />} />
          <Route path="/perfil" element={<SettingsPage user={user!} />} />
          <Route path="/produtor" element={isProducer ? <InstructorDashboardPage currentUser={user} /> : <Navigate to="/painel" replace />} />
          <Route path="/gerenciar-cursos" element={isProducer ? <InstructorCoursesPage courses={coursesWithProgress} currentUser={user} onCreateCourse={handleCreateNew} onEditCourse={handleEdit} onDeleteCourse={handleDeleteCourse} /> : <Navigate to="/painel" replace />} />
          <Route path="/criar-curso" element={isProducer ? <AdminCourseCreate initialData={editingCourse} currentUser={user} onSave={handleSaveCourse} onCancel={() => {setEditingCourse(null); navigate('/gerenciar-cursos');}} onShowToast={addToast} /> : <Navigate to="/painel" replace />} />
          <Route path="/ajuda" element={<HelpPage />} />
          <Route path="*" element={<div className="p-10 text-center">Pagina nao encontrada.</div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
