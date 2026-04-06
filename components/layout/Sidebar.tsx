import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../../types';
import { Home, Search, BookOpen, Award, User as UserIcon, BarChart2, PlusCircle, List, ShieldCheck, ExternalLink, X, ChevronRight, HelpCircle, PenTool, Sparkles, Crown, LogOut, Zap, TrendingUp, Wallet } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, isOpen, onClose, onLogout }) => {
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateItems(true), 150);
      return () => clearTimeout(timer);
    } else {
      setAnimateItems(false);
    }
  }, [isOpen]);

  if (!user) return null;

  const studentMenu = [
    { id: 'dashboard', label: 'Visão Geral', desc: 'Painel principal', icon: Home, accent: 'from-emerald-400 to-emerald-600' },
    { id: 'courses', label: 'Catálogo de Cursos', desc: 'Explorar cursos', icon: Search, accent: 'from-blue-400 to-blue-600' },
    { id: 'my-courses', label: 'Meus Cursos', desc: 'Continuar estudando', icon: BookOpen, accent: 'from-violet-400 to-violet-600' },
    { id: 'certificates', label: 'Certificados', desc: 'Suas conquistas', icon: Award, accent: 'from-amber-400 to-amber-600' },
    { id: 'settings', label: 'Meu Perfil', desc: 'Conta e preferências', icon: UserIcon, accent: 'from-rose-400 to-rose-600' },
  ];

  const instructorMenu = [
    { id: 'instructor', label: 'Dashboard Produtor', desc: 'Métricas e stats', icon: TrendingUp, accent: 'from-cyan-400 to-cyan-600' },
    { id: 'instructor-courses', label: 'Gerenciar Cursos', desc: 'Editar conteúdo', icon: List, accent: 'from-indigo-400 to-indigo-600' },
    { id: 'create-course', label: 'Criar Novo Curso', desc: 'Publicar conteúdo', icon: PlusCircle, accent: 'from-green-400 to-green-600' },
    { id: 'signature', label: 'Assinatura', desc: 'Certificados', icon: PenTool, accent: 'from-pink-400 to-pink-600' },
    { id: 'affiliates', label: 'Afiliados', desc: 'Equipe de vendas', icon: ShieldCheck, accent: 'from-orange-400 to-orange-600' },
  ];

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  const MenuButton = ({ item, index, isActive, sectionDelay = 0 }: { item: typeof studentMenu[0]; index: number; isActive: boolean; sectionDelay?: number }) => (
    <button
      key={item.id}
      onClick={() => handleItemClick(item.id)}
      style={{
        opacity: animateItems ? 1 : 0,
        transform: animateItems ? 'translateX(0)' : 'translateX(-16px)',
        transition: `all 0.35s cubic-bezier(0.16, 1, 0.3, 1) ${(index * 50) + sectionDelay}ms`,
      }}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group relative overflow-hidden
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
      <div 
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-400
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 left-0 z-[60] h-screen w-[310px] sm:w-[330px]  
        bg-gradient-to-b from-[#1a2f25] via-[#152a1f] to-[#0d1b14] text-white 
        transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isOpen ? 'translate-x-0 shadow-[10px_0_60px_rgba(0,0,0,0.5)]' : '-translate-x-full shadow-none'}
      `}>
        
        {/* Decorative ambient blurs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-rm-gold/8 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-emerald-500/8 rounded-full blur-[80px] translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-32 h-32 bg-rm-gold/5 rounded-full blur-[60px] pointer-events-none" />
        
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />

        {/* Header */}
        <div className="h-[72px] flex items-center justify-between px-5 sm:px-6 border-b border-white/[0.06] relative z-10">
          <div 
            className="flex items-center gap-3 select-none cursor-pointer group"
            onClick={() => handleItemClick('dashboard')}
          >
            <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm" />
              <img 
                src="https://receitasmilionarias.com.br/static/images/logo.png" 
                alt="Logo" 
                className="h-7 w-7 object-contain relative z-10"
              />
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
                  ? 'bg-rm-gold/15 text-rm-gold border border-rm-gold/20' 
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              }`}>
                {user.role === UserRole.ADMIN && <Crown size={9} />}
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

          {/* Footer Links */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 px-3 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            </div>
            
            <nav className="space-y-1">
              <a
                href="https://dashboard.receitasmilionarias.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                style={{
                  opacity: animateItems ? 1 : 0,
                  transform: animateItems ? 'translateX(0)' : 'translateX(-16px)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1) 500ms',
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-all group active:scale-[0.98]"
              >
                <div className="p-2 rounded-xl bg-white/[0.04] group-hover:bg-rm-gold/15 transition-all duration-300">
                  <Wallet size={15} className="text-white/30 group-hover:text-rm-gold transition-colors" />
                </div>
                <div className="flex flex-col text-left flex-1">
                  <span className="font-semibold text-[13px] text-white/55 group-hover:text-white/80 transition-colors">Painel Afiliado</span>
                  <span className="text-[10px] text-white/20 group-hover:text-white/35 transition-colors">Acessar meus ganhos</span>
                </div>
                <ExternalLink size={12} className="text-white/15 group-hover:text-white/40 shrink-0 transition-colors" />
              </a>
              
              <button 
                onClick={() => handleItemClick('help')}
                style={{
                  opacity: animateItems ? 1 : 0,
                  transform: animateItems ? 'translateX(0)' : 'translateX(-16px)',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1) 550ms',
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-all group active:scale-[0.98]"
              >
                <div className="p-2 rounded-xl bg-white/[0.04] group-hover:bg-white/[0.08] transition-all duration-300">
                  <HelpCircle size={15} className="text-white/30 group-hover:text-white/60 transition-colors" />
                </div>
                <span className="font-semibold text-[13px] text-white/55 group-hover:text-white/80 transition-colors">Ajuda & Suporte</span>
              </button>

              {/* Logout Button */}
              {onLogout && (
                <button 
                  onClick={() => { onLogout(); onClose(); }}
                  style={{
                    opacity: animateItems ? 1 : 0,
                    transform: animateItems ? 'translateX(0)' : 'translateX(-16px)',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1) 600ms',
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm text-red-400/50 hover:bg-red-500/[0.08] hover:text-red-400 transition-all group active:scale-[0.98] mt-1"
                >
                  <div className="p-2 rounded-xl bg-red-500/[0.06] group-hover:bg-red-500/[0.12] transition-all duration-300">
                    <LogOut size={15} className="group-hover:-translate-x-0.5 transition-all duration-300" />
                  </div>
                  <span className="font-semibold text-[13px]">Sair do Sistema</span>
                </button>
              )}
            </nav>
            
            {/* Version & footer */}
            <div className="mt-5 mx-3 pt-3 border-t border-white/[0.04]">
              <div className="flex items-center justify-center gap-1.5">
                <Zap size={10} className="text-rm-gold/30" />
                <p className="text-[9px] text-white/15 font-medium tracking-wider">Academy v2.3.0</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
