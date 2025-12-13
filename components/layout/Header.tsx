import React from 'react';
import { User, UserRole } from '../../types';
import { Bell, LogOut, User as UserIcon, Menu } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, toggleSidebar }) => {
  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 lg:px-8 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4 lg:gap-6 flex-1">
        {/* Menu Button - Visible on All Screens now */}
        <button 
          onClick={toggleSidebar} 
          className="text-rm-gray hover:text-rm-green focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Abrir Menu"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
           <img 
             src="https://receitasmilionarias.com.br/static/images/logo-deitado-escuro.png" 
             alt="Receitas Milionárias" 
             className="h-8 md:h-10 w-auto object-contain"
           />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <button className="relative text-rm-gray hover:text-rm-gold transition-colors p-1">
          <Bell size={22} />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-rm-green leading-none">{user.name}</p>
            <p className="text-[10px] text-rm-gold font-bold uppercase tracking-wider mt-1">
              {user.role === UserRole.ADMIN ? 'Instrutor' : 'Afiliado'}
            </p>
          </div>
          
          <div className="relative group cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-rm-green flex items-center justify-center text-rm-gold border-2 border-rm-gold shadow-sm overflow-hidden hover:scale-105 transition-transform">
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
               ) : (
                 <UserIcon size={18} />
               )}
            </div>
            
            {/* Quick Menu Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 hidden group-hover:block animate-fade-in origin-top-right">
               <div className="md:hidden px-4 py-2 border-b border-gray-100 mb-1">
                 <p className="text-sm font-bold text-gray-800">{user.name}</p>
                 <p className="text-xs text-gray-500">{user.role}</p>
               </div>
               <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-rm-green">Meu Perfil</button>
               <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-rm-green">Preferências</button>
               <div className="border-t border-gray-100 mt-1"></div>
               <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                 <LogOut size={14} /> Sair
               </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;