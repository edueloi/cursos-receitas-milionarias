import React from 'react';
import { User, UserRole } from '../../types';
import { Home, Search, BookOpen, Award, User as UserIcon, BarChart2, PlusCircle, List, ShieldCheck, ExternalLink, X, ChevronRight, HelpCircle } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, isOpen, onClose }) => {
  if (!user) return null;

  // Global Student Menu
  const studentMenu = [
    { id: 'dashboard', label: 'Visão Geral', icon: Home },
    { id: 'courses', label: 'Catálogo de Cursos', icon: Search },
    { id: 'my-courses', label: 'Meus Cursos', icon: BookOpen },
    { id: 'certificates', label: 'Certificados', icon: Award },
    { id: 'settings', label: 'Meu Perfil', icon: UserIcon },
  ];

  // Instructor Menu
  const instructorMenu = [
    { id: 'instructor', label: 'Dashboard Produtor', icon: BarChart2 },
    { id: 'instructor-courses', label: 'Gerenciar Cursos', icon: List },
    { id: 'create-course', label: 'Criar Novo Curso', icon: PlusCircle },
    { id: 'affiliates', label: 'Afiliados', icon: ShieldCheck },
  ];

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
    onClose(); // Always close sidebar when an item is clicked
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`
          fixed inset-0 bg-[#1C3B32]/60 backdrop-blur-sm z-50 transition-opacity duration-500
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 left-0 z-[60] h-screen w-80 bg-[#1C3B32] text-white shadow-[10px_0_30px_rgba(0,0,0,0.3)] transform transition-transform duration-300 ease-out border-r border-white/5
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Decorative background accent */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-rm-gold/20 rounded-full blur-[60px] pointer-events-none mix-blend-screen"></div>

        {/* Sidebar Header */}
        <div className="h-24 flex items-center justify-between px-8 border-b border-white/10 relative z-10">
           <img 
             src="https://receitasmilionarias.com.br/static/images/logo-deitado-claro.png" 
             alt="Receitas Milionárias" 
             className="h-9 w-auto object-contain drop-shadow-lg"
           />
           <button 
             onClick={onClose} 
             className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 hover:rotate-90 transition-all duration-300"
           >
             <X size={18} />
           </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-6rem)] py-8 px-5 relative z-10 custom-scrollbar flex flex-col">
          
          {/* Main Navigation */}
          <div className="mb-8 flex-1">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 opacity-70">Menu Principal</p>
            <nav className="space-y-2">
              {studentMenu.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
                      ${isActive 
                        ? 'bg-gradient-to-r from-rm-gold to-[#B08D2B] text-white shadow-lg translate-x-1' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white hover:translate-x-1'}
                    `}
                  >
                    {/* Active Indicator Glow */}
                    {isActive && <div className="absolute inset-0 bg-white/10 opacity-50"></div>}

                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon 
                        size={20} 
                        className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-rm-gold/80 group-hover:text-white'}`} 
                      />
                      <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-white/80 animate-pulse relative z-10" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Instructor Section */}
          {user.role === UserRole.ADMIN && (
            <div className="mb-8 animate-fade-in border-t border-white/10 pt-6">
              <p className="px-4 text-[10px] font-bold text-rm-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <ShieldCheck size={12} /> Área do Produtor
              </p>
              <nav className="space-y-2">
                {instructorMenu.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`
                        w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group text-sm
                        ${isActive 
                          ? 'bg-white/10 text-white font-semibold border border-white/20 shadow-inner' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                      `}
                    >
                      <item.icon 
                        size={18} 
                        className={`${isActive ? 'text-rm-gold' : 'text-gray-500 group-hover:text-white'} transition-colors`} 
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Footer / External Links */}
          <div className="mt-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>
            
            <nav className="space-y-3">
              <a
                href="https://dashboard.receitasmilionarias.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all group border border-transparent hover:border-white/5"
              >
                <div className="p-1.5 rounded-lg bg-[#0f241e] group-hover:bg-rm-gold group-hover:text-white transition-colors border border-white/5">
                   <ExternalLink size={14} />
                </div>
                <div className="flex flex-col text-left">
                   <span className="font-medium text-gray-200">Painel de Vendas</span>
                   <span className="text-[10px] text-gray-500 group-hover:text-gray-300">Acessar meus ganhos</span>
                </div>
              </a>
              
              <button 
                onClick={() => handleItemClick('settings')}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
              >
                 <div className="p-1.5 rounded-lg bg-[#0f241e] group-hover:bg-rm-greenLight group-hover:text-white transition-colors border border-white/5">
                    <HelpCircle size={14} />
                 </div>
                 <span className="font-medium">Ajuda & Suporte</span>
              </button>
            </nav>
            
            <div className="mt-8 px-2 text-center">
              <p className="text-[10px] text-gray-600 font-medium">Versão 2.1.0 • Academy</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;