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

import Button from './components/ui/Button';
import Input from './components/ui/Input';
import { ExternalLink, Globe, LayoutDashboard, LogIn, Eye, EyeOff } from 'lucide-react';

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
    // Default redirect based on role could go here, defaulting to dashboard for all
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedCourse(null);
    setEditingCourse(null);
    setIsCreating(false);
    setEmail('');
    setPassword('');
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
    } else {
      setCourses([...courses, { ...course, status: 'draft' }]); // Default new to draft
      setIsCreating(false);
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
         />
       );
    }

    // 2. Tab Routing
    switch (activeTab) {
      // Global / Student Routes
      case 'dashboard':
        return <DashboardPage />;
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

  // 1. Login Screen (Split Layout with Pizza Background)
  if (!user) {
    return (
      <div className="min-h-screen w-full flex bg-white">
        {/* Left Side - Image & Branding (Hidden on Mobile) */}
        <div className="hidden lg:flex w-5/12 relative flex-col justify-center items-center text-center p-12 overflow-hidden">
           {/* Background Image: Pizza */}
           <div 
             className="absolute inset-0 bg-cover bg-center z-0"
             style={{ 
               backgroundImage: 'url("https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=2070&auto=format&fit=crop")',
             }}
           />
           {/* Dark Overlay */}
           <div className="absolute inset-0 bg-black/50 z-10" />
           
           {/* Content */}
           <div className="relative z-20 max-w-lg">
             <div className="bg-black/60 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
               <h2 className="text-3xl font-serif font-bold text-white mb-4 leading-tight">
                 Junte-se à Elite da Culinária
               </h2>
               <p className="text-white text-lg leading-relaxed font-light">
                 A plataforma Receitas Milionárias é o seu passaporte para o sucesso. 
                 Cadastre-se e comece a transformar suas receitas em lucro.
               </p>
             </div>
           </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-6 bg-white relative">
          
          <div className="w-full max-w-sm space-y-8 animate-fade-in-up">
            {/* Logo in Circle */}
            <div className="flex flex-col items-center">
               <div className="h-24 w-24 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-green-50 mb-4 p-2 relative z-10 -mt-12 lg:mt-0">
                  <img 
                    src="https://receitasmilionarias.com.br/static/images/logo-deitado-escuro.png" 
                    alt="Receitas Milionárias" 
                    className="w-full h-auto object-contain"
                  />
               </div>
               <h2 className="text-2xl font-serif font-bold text-gray-700">Acessar Sistema</h2>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
               <Input 
                 label="Email"
                 type="email"
                 placeholder="seu@email.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />

               <Input 
                 label="Senha"
                 type={showPassword ? "text" : "password"}
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 endIcon={showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                 onEndIconClick={() => setShowPassword(!showPassword)}
               />

               <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${rememberMe ? 'bg-rm-green' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${rememberMe ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="text-sm text-gray-600">Lembrar-me</span>
                  </label>
               </div>

               <Button 
                  type="submit"
                  variant="secondary"
                  className="w-full text-lg py-3 font-bold shadow-lg hover:shadow-xl transition-all"
               >
                  Entrar
               </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center pt-2">
               <p className="text-sm text-gray-500">
                 Não tem conta? <a href="#" className="text-rm-green font-bold hover:underline">Cadastre-se</a>
               </p>
            </div>
            
            <div className="flex justify-center gap-6 pt-4 border-t border-gray-100">
               <a 
                 href="https://receitasmilionarias.com.br/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 text-xs text-gray-400 hover:text-rm-gold transition-colors"
               >
                 <Globe size={14} /> Site Oficial
               </a>
               <a 
                 href="https://dashboard.receitasmilionarias.com.br/" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 text-xs text-gray-400 hover:text-rm-gold transition-colors"
               >
                 <ExternalLink size={14} /> Painel de Vendas
               </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Player Mode (Fullscreen)
  if (selectedCourse) {
    return (
      <PlayerPage 
        course={selectedCourse} 
        onBack={() => setSelectedCourse(null)} 
      />
    );
  }

  // 3. Main Layout
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header 
        user={user} 
        onLogout={handleLogout}
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