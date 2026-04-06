import React from 'react';
import { User, UserRole } from '../../types';
import { 
  Home, 
  BookOpen, 
  Award, 
  Settings, 
  TrendingUp, 
  List, 
  PlusCircle, 
  PenTool, 
  HelpCircle, 
  LogOut, 
  X,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, user, activeTab, onTabChange, onClose, onLogout }) => {
  if (!user) return null;

  const studentMenu = [
    { id: 'dashboard', label: 'Início', desc: 'Painel geral', icon: Home, accent: 'from-blue-400 to-blue-600' },
    { id: 'courses', label: 'Cursos', desc: 'Explorar aulas', icon: BookOpen, accent: 'from-emerald-400 to-emerald-600' },
    { id: 'my-courses', label: 'Meus Cursos', desc: 'Seu progresso', icon: Sparkles, accent: 'from-rm-gold to-yellow-600' },
    { id: 'certificates', label: 'Certificados', desc: 'Conquistas', icon: Award, accent: 'from-purple-400 to-purple-600' },
    { id: 'settings', label: 'Configurações', desc: 'Seu perfil', icon: Settings, accent: 'from-gray-400 to-gray-600' },
  ];

  const instructorMenu = [
    { id: 'instructor', label: 'Dashboard Produtor', desc: 'Métricas e stats', icon: TrendingUp, accent: 'from-cyan-400 to-cyan-600' },
    { id: 'instructor-courses', label: 'Gerenciar Cursos', desc: 'Editar conteúdo', icon: List, accent: 'from-indigo-400 to-indigo-600' },
    { id: 'create-course', label: 'Criar Novo Curso', desc: 'Publicar conteúdo', icon: PlusCircle, accent: 'from-green-400 to-green-600' },
    { id: 'signature', label: 'Assinatura', desc: 'Certificados', icon: PenTool, accent: 'from-pink-400 to-pink-600' },
  ];

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
  };

  const MenuButton = ({ item, index, isActive, sectionDelay = 0 }: { item: any, index: number, isActive: boolean, sectionDelay?: number }) => (
    <button
      onClick={() => handleItemClick(item.id)}
      style={{ animationDelay: `${sectionDelay + (index * 80)}ms` }}
      className={`
        w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden animate-fade-in
        ${isActive 
          ? 'bg-gradient-to-r from-rm-gold/90 to-rm-gold text-white shadow-lg shadow-rm-gold/30' 
          : 'text-white/60 hover:bg-white/[0.06] hover:text-white/90 active:scale-[0.98]'}
      `}
    >
      {/* Active glow effect */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      )}

      {/* Active side indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
      )}

      <div className={`relative p-2 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-white/25 shadow-inner' 
          : 'bg-white/[0.05] group-hover:bg-white/[0.10] group-hover:scale-110'
      }`}>
        <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={`transition-all duration-200 ${
          isActive ? 'text-white' : 'text-rm-gold/70 group-hover:text-rm-gold'
        }`} />
      </div>

      <div className="flex-1 text-left min-w-0 relative z-10">
        <span className={`text-[13px] block leading-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>
          {item.label}
        </span>
        <span className={`text-[10px] block mt-0.5 leading-tight transition-colors ${
          isActive ? 'text-white/60' : 'text-white/25 group-hover:text-white/40'
        }`}>
          {item.desc}
        </span>
      </div>

      <ChevronRight size={14} className={`shrink-0 transition-all duration-200 ${
        isActive 
          ? 'text-white/70 translate-x-0 opacity-100' 
          : 'text-white/20 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-white/40'
      }`} />
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed top-0 left-0 bottom-0 w-72 sm:w-80 bg-[#1C3B32] shadow-2xl z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Abstract Background patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rm-gold/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rm-gold/5 rounded-full blur-3xl -ml-32 -mb-32" />

        {/* Sidebar Header */}
        <div className="h-20 sm:h-24 px-6 sm:px-8 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleItemClick('dashboard')}>
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300" />
              <div className="bg-white p-2 rounded-xl shadow-lg flex items-center justify-center w-11 h-11 relative z-10 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://receitasmilionarias.com.br/static/images/logo-academy.png" 
                  alt="Logo" 
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as any).src = 'https://receitasmilionarias.com.br/static/images/logo.png';
                  }}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-white text-lg leading-none tracking-tight">Receitas</span>
              <span className="font-serif font-bold text-rm-gold text-lg leading-none tracking-tight">Milionárias</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="h-9 w-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.12] hover:rotate-90 transition-all duration-300 active:scale-90"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* User Card */}
        <div className="px-5 sm:px-6 py-4 relative z-10">
          <div 
            className="relative p-[1px] rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => handleItemClick('settings')}
            style={{
              background: 'linear-gradient(135deg, rgba(201,166,53,0.4), rgba(255,255,255,0.06), rgba(201,166,53,0.2))',
            }}
          >
            <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl backdrop-blur-sm group-hover:from-white/[0.08] group-hover:to-white/[0.04] transition-all">
              <div className="relative">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-rm-gold to-yellow-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-lg shadow-rm-gold/25 group-hover:shadow-rm-gold/40 transition-shadow">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <span className="text-base">{user.name.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-[2.5px] border-[#1a2f25] shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate group-hover:text-rm-gold/90 transition-colors">{user.name}</p>
                <p className="text-[10px] text-white/35 truncate mt-0.5">{user.email}</p>
              </div>
              <div className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                user.role === UserRole.ADMIN 
                  ? 'bg-rm-gold/20 text-rm-gold' 
                  : 'bg-emerald-400/20 text-emerald-400'
              }`}>
                {user.role === UserRole.ADMIN && <Sparkles size={10} />}
                {user.role === UserRole.ADMIN ? 'PRO' : 'FREE'}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-72px-100px)] px-3 sm:px-4 relative z-10 custom-scrollbar flex flex-col pb-4">
          
          {/* Main Navigation */}
          <div className="mb-3 flex-1">
            <div className="flex items-center gap-2 px-3 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-1.5">
                <Home size={9} className="text-white/20" />
                Menu Principal
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            </div>
            <nav className="space-y-1">
              {studentMenu.map((item, index) => {
                const isActive = activeTab === item.id;
                return <MenuButton key={item.id} item={item} index={index} isActive={isActive} />;
              })}
            </nav>
          </div>

          {/* Instructor Section */}
          {user.role === UserRole.ADMIN && (
            <div className="mb-4">
              <div className="flex items-center gap-2 px-3 mb-3 mt-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rm-gold/15 to-transparent" />
                <p className="text-[9px] font-bold text-rm-gold/50 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-1.5">
                  <Sparkles size={9} className="text-rm-gold/40" />
                  Área do Produtor
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rm-gold/15 to-transparent" />
              </div>
              <nav className="space-y-1">
                {instructorMenu.map((item, index) => {
                  const isActive = activeTab === item.id;
                  return <MenuButton key={item.id} item={item} index={index} isActive={isActive} sectionDelay={250} />;
                })}
              </nav>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 mt-auto border-t border-white/[0.05]">
            <button 
              onClick={() => handleItemClick('help')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/40 hover:text-white/70 transition-colors group mb-1"
            >
              <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.08]">
                <HelpCircle size={14} />
              </div>
              <span className="text-xs font-semibold">Ajuda</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-red-500/5 group-hover:bg-red-500/20">
                <LogOut size={14} />
              </div>
              <span className="text-xs font-bold">Encerrar Sessão</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
