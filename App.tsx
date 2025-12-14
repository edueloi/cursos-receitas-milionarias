import React, { useState } from 'react';
import { User, UserRole, Course } from './types';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

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

// Initial Mock Data
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
          { id: 'l1', title: 'Como funciona o algoritmo', duration: '12:00', completed: true },
          { id: 'l2', title: 'Criando conteúdo viral', duration: '15:30', completed: false },
        ]
      },
      {
        id: 'm2',
        title: 'Copywriting para Legendas',
        lessons: [
          { id: 'l3', title: 'Gatilhos mentais', duration: '20:00', completed: false },
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
          { id: 'l1', title: 'Planilha de custos', duration: '45:00', completed: true },
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

  // Toast Handler
  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Simulate persistent login or check
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Simple mock logic to determine role based on email or default to Affiliate
    // In a real app, this would come from the backend response
    const role = email.includes('admin') ? UserRole.ADMIN : UserRole.AFFILIATE;

    setUser({
      id: '1',
      name: role === UserRole.ADMIN ? 'Chef Fundador' : 'Jefferson',
      email: email || 'jefferson@receitasmilionarias.com.br',
      role: role
    });

    addToast('success', 'Login realizado com sucesso!', `Bem-vindo de volta, ${role === UserRole.ADMIN ? 'Chef' : 'Jefferson'}.`);

    setActiveTab('dashboard');
  };

  const handleLogout = () => {
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

  // 1. Login Screen (New Premium Design)
  if (!user) {
    return (
      <div className="min-h-screen w-full flex bg-rm-green font-sans">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        {/* Left Side - Image & Branding (Desktop) */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r-4 border-rm-gold">
           {/* Background Image */}
           <div 
             className="absolute inset-0 bg-cover bg-center z-0 scale-105"
             style={{ 
               backgroundImage: 'url("https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop")',
             }}
           >
             <div className="absolute inset-0 bg-gradient-to-t from-rm-green via-rm-green/80 to-rm-green/40 mix-blend-multiply" />
           </div>
           
           {/* Content */}
           <div className="relative z-20">
             {/* Composed Logo White/Gold */}
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
                  <p className="text-lg opacity-90 font-light">Painel de vendas e materiais incluso.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-rm-gold mt-1" size={20} />
                  <p className="text-lg opacity-90 font-light">Suporte premium e comunidade.</p>
                </div>
             </div>
           </div>

           <div className="relative z-20 text-xs text-white/50">
             © 2024 Receitas Milionárias Academy. Todos os direitos reservados.
           </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 relative bg-gray-50/50">
          {/* Mobile Background (Absolute) */}
          <div 
            className="lg:hidden absolute inset-0 bg-cover bg-center z-0"
             style={{ 
               backgroundImage: 'url("https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop")',
             }}
          >
            <div className="absolute inset-0 bg-rm-green/90" />
          </div>

          <div className="w-full max-w-md z-10">
            {/* Card Container */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 lg:p-12 border-t-8 border-rm-gold animate-fade-in-up">
              
              <div className="text-center mb-8">
                <div className="lg:hidden flex justify-center mb-6">
                   {/* Mobile Logo */}
                   <div className="flex items-center gap-2 select-none">
                     <img 
                       src="https://receitasmilionarias.com.br/static/images/logo.png" 
                       alt="Logo" 
                       className="h-10 w-10 object-contain"
                     />
                     <div className="flex flex-col text-left">
                       <span className="font-serif font-bold text-rm-green text-xl leading-none">Receitas</span>
                       <span className="font-serif font-bold text-rm-gold text-xl leading-none">Milionárias</span>
                     </div>
                   </div>
                </div>
                <h3 className="text-2xl font-serif font-bold text-rm-green">Bem-vindo à Academy</h3>
                <p className="text-gray-500 text-sm mt-2">Área de membros para afiliados e alunos.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                 <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">E-mail</label>
                   <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rm-gold transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-rm-gold focus:ring-4 focus:ring-rm-gold/10 outline-none transition-all text-sm font-medium"
                        placeholder="seu@email.com"
                      />
                   </div>
                 </div>

                 <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Senha</label>
                   <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rm-gold transition-colors" size={18} />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-rm-gold focus:ring-4 focus:ring-rm-gold/10 outline-none transition-all text-sm font-medium"
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rm-green"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                   </div>
                 </div>

                 <div className="flex items-center justify-between text-xs lg:text-sm pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-rm-green">
                      <input 
                        type="checkbox" 
                        className="rounded text-rm-green focus:ring-rm-gold border-gray-300" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Lembrar-me</span>
                    </label>
                    <a href="#" className="text-rm-gold hover:underline font-semibold">Esqueceu a senha?</a>
                 </div>

                 <Button 
                    type="submit"
                    variant="secondary" // Green Button
                    className="w-full py-4 text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group mt-4"
                 >
                    Entrar no Sistema <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                 </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-4">
                 <p className="text-sm text-gray-500">
                   Ainda não é afiliado? <a href="https://receitasmilionarias.com.br/cadastro.html" target="_blank" className="text-rm-green font-bold hover:text-rm-gold transition-colors underline decoration-2 decoration-transparent hover:decoration-rm-gold underline-offset-4">Cadastre-se Grátis</a>
                 </p>
                 
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs mt-6">
                   <a 
                     href="https://dashboard.receitasmilionarias.com.br/" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center gap-1.5 text-gray-400 hover:text-rm-green transition-colors"
                   >
                     <ExternalLink size={12} /> Painel de Vendas
                   </a>
                   <span className="hidden sm:inline text-gray-300">|</span>
                   <a 
                     href="#" 
                     className="flex items-center gap-1.5 text-gray-400 hover:text-rm-green transition-colors"
                   >
                     <Globe size={12} /> Termos de Uso
                   </a>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Player Mode (Fullscreen)
  if (selectedCourse) {
    return (
      <div className="h-full">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <PlayerPage 
          course={selectedCourse} 
          onBack={() => setSelectedCourse(null)} 
        />
      </div>
    );
  }

  // 3. Main Layout
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
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
      <main className="flex-1 transition-all duration-300 mt-16">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;