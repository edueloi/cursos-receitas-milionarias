import React from 'react';
import { User, UserRole } from '../../types';
import { Home, Search, BookOpen, Award, User as UserIcon, BarChart2, PlusCircle, List, ShieldCheck, ExternalLink, X, ChevronRight, HelpCircle, PenTool, Sparkles, Crown } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, isOpen, onClose }) => {
  if (!user) return null;

  const studentMenu = [
    { id: 'dashboard', label: 'Visão Geral', desc: 'Painel principal', icon: Home },
    { id: 'courses', label: 'Catálogo de Cursos', desc: 'Explorar cursos', icon: Search },
    { id: 'my-courses', label: 'Meus Cursos', desc: 'Continuar estudando', icon: BookOpen },
    { id: 'certificates', label: 'Certificados', desc: 'Suas conquistas', icon: Award },
    { id: 'settings', label: 'Meu Perfil', desc: 'Conta e preferências', icon: UserIcon },
  ];

  const instructorMenu = [
    { id: 'instructor', label: 'Dashboard Produtor', desc: 'Métricas e stats', icon: BarChart2 },
    { id: 'instructor-courses', label: 'Gerenciar Cursos', desc: 'Editar conteúdo', icon: List },
    { id: 'create-course', label: 'Criar Novo Curso', desc: 'Publicar conteúdo', icon: PlusCircle },
    { id: 'signature', label: 'Assinatura', desc: 'Certificados', icon: PenTool },
    { id: 'affiliates', label: 'Afiliados', desc: 'Equipe de vendas', icon: ShieldCheck },
  ];

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 left-0 z-[60] h-screen w-[300px] sm:w-[320px]  
        bg-gradient-to-b from-[#1a2f25] via-[#162a20] to-[#0f1f17] text-white 
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0 shadow-[10px_0_40px_rgba(0,0,0,0.4)]' : '-translate-x-full shadow-none'}
      `}>
        
        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-rm-gold/10 rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] translate-y-1/3 pointer-events-none" />

        {/* Header */}
        <div className="h-[72px] flex items-center justify-between px-5 sm:px-6 border-b border-white/[0.06] relative z-10">
          <div className="flex items-center gap-3 select-none">
            <div className="relative">
              <img 
                src="https://receitasmilionarias.com.br/static/images/logo.png" 
                alt="Logo" 
                className="h-10 w-10 object-contain drop-shadow-lg"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#1a2f25]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-white text-lg leading-none tracking-tight">Receitas</span>
              <span className="font-serif font-bold text-rm-gold text-lg leading-none tracking-tight">Milionárias</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="h-8 w-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* User Card */}
        <div className="px-5 sm:px-6 py-4 relative z-10">
          <div className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rm-gold to-yellow-600 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-lg shadow-rm-gold/20">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-xl object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
            </div>
            {user.role === UserRole.ADMIN && (
              <div className="p-1 bg-rm-gold/20 rounded-lg shrink-0">
                <Crown size={12} className="text-rm-gold" />
              </div>
            )}
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-72px-88px)] px-3 sm:px-4 relative z-10 custom-scrollbar flex flex-col pb-4">
          
          {/* Main Navigation */}
          <div className="mb-2 flex-1">
            <p className="px-3 text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Menu Principal</p>
            <nav className="space-y-0.5">
              {studentMenu.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-rm-gold text-white shadow-lg shadow-rm-gold/20' 
                        : 'text-white/60 hover:bg-white/[0.04] hover:text-white/90'}
                    `}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                    }`}>
                      <item.icon size={16} className={isActive ? 'text-white' : 'text-rm-gold/70 group-hover:text-white/80'} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className={`text-sm block ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-white/60 shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Instructor Section */}
          {user.role === UserRole.ADMIN && (
            <div className="mb-4">
              <div className="h-px bg-white/[0.06] mx-3 mb-3" />
              <p className="px-3 text-[9px] font-bold text-rm-gold/60 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                <Sparkles size={10} /> Área do Produtor
              </p>
              <nav className="space-y-0.5">
                {instructorMenu.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm
                        ${isActive 
                          ? 'bg-white/[0.08] text-white font-semibold border border-white/[0.08]' 
                          : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'}
                      `}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        isActive ? 'bg-rm-gold/20' : 'bg-white/[0.03]'
                      }`}>
                        <item.icon size={14} className={isActive ? 'text-rm-gold' : 'text-white/40 group-hover:text-white/60'} />
                      </div>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-auto">
            <div className="h-px bg-white/[0.06] mx-3 mb-3" />
            
            <nav className="space-y-0.5">
              <a
                href="https://dashboard.receitasmilionarias.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-rm-gold/20 transition-colors">
                  <ExternalLink size={14} className="group-hover:text-rm-gold" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium text-white/60 group-hover:text-white/80">Painel Afiliado</span>
                  <span className="text-[10px] text-white/25">Acessar meus ganhos</span>
                </div>
              </a>
              
              <button 
                onClick={() => handleItemClick('settings')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors">
                  <HelpCircle size={14} />
                </div>
                <span className="font-medium">Ajuda & Suporte</span>
              </button>
            </nav>
            
            <div className="mt-4 px-3 text-center">
              <p className="text-[9px] text-white/15 font-medium">Academy v2.2.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
