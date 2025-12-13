import React from 'react';
import { User, UserRole } from '../../types';
import { Home, Search, BookOpen, Award, User as UserIcon, BarChart2, PlusCircle, List, ShieldCheck, ExternalLink, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, isOpen, onClose }) => {
  if (!user) return null;

  // Global Student Menu (Everyone sees this)
  const studentMenu = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'courses', label: 'Catálogo de Cursos', icon: Search },
    { id: 'my-courses', label: 'Meus Cursos', icon: BookOpen },
    { id: 'certificates', label: 'Meus Certificados', icon: Award },
    { id: 'settings', label: 'Meu Perfil', icon: UserIcon },
  ];

  // Instructor Menu (Only ADMIN sees this)
  const instructorMenu = [
    { id: 'instructor', label: 'Painel do Instrutor', icon: BarChart2 },
    { id: 'instructor-courses', label: 'Gerenciar Cursos', icon: List },
    { id: 'create-course', label: 'Criar Novo Curso', icon: PlusCircle },
    { id: 'affiliates', label: 'Afiliados', icon: ShieldCheck },
  ];

  const handleItemClick = (tabId: string) => {
    onTabChange(tabId);
    onClose(); // Always close after selection for a cleaner feel
  };

  return (
    <>
      {/* Backdrop (Visible on all screens when open) */}
      <div 
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-72 bg-rm-green text-white shadow-2xl transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-rm-greenLight/50">
           <span className="font-serif font-bold text-lg text-rm-gold tracking-wide">MENU PRINCIPAL</span>
           <button onClick={onClose} className="text-gray-300 hover:text-white transition-colors">
             <X size={24} />
           </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-4rem)] py-6">
          {/* Student Section */}
          <div className="px-4 mb-2">
            <nav className="space-y-2">
              {studentMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group text-sm font-medium
                    ${activeTab === item.id 
                      ? 'bg-rm-gold text-white shadow-lg translate-x-1' 
                      : 'text-gray-200 hover:bg-white/10 hover:text-white hover:translate-x-1'}
                  `}
                >
                  <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-rm-gold group-hover:text-white'} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Instructor Section */}
          {user.role === UserRole.ADMIN && (
            <div className="px-4 mt-8">
               <div className="h-px bg-white/10 mx-4 mb-6"></div>
              <p className="text-xs font-bold text-rm-gold uppercase tracking-wider mb-3 px-4 flex items-center gap-2 opacity-80">
                Área do Produtor
              </p>
              <nav className="space-y-2">
                {instructorMenu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`
                      w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group text-sm font-medium
                      ${activeTab === item.id 
                        ? 'bg-white/20 text-white font-bold shadow-md translate-x-1 border-l-4 border-rm-gold' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1'}
                    `}
                  >
                    <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* External Links Section */}
          <div className="px-4 mt-8 mb-8">
            <div className="h-px bg-white/10 mx-4 mb-6"></div>
            <nav className="space-y-2">
              <a
                href="https://dashboard.receitasmilionarias.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
              >
                <ExternalLink size={18} className="text-gray-500 group-hover:text-white" />
                <span>Painel de Vendas</span>
              </a>
              <a
                href="https://receitasmilionarias.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
              >
                <ExternalLink size={18} className="text-gray-500 group-hover:text-white" />
                <span>Site Oficial</span>
              </a>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;