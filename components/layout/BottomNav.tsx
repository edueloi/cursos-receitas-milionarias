import React from 'react';
import { Home, Search, BookOpen, User, PlusCircle } from 'lucide-react';
import { UserRole } from '../../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: UserRole;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, userRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'courses', label: 'Cursos', icon: Search },
    { id: 'my-courses', label: 'Meus', icon: BookOpen },
    { id: 'settings', label: 'Perfil', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-2 py-1.5 z-40 flex items-center justify-around shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.08)]">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`relative flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all active:scale-90 ${
              isActive ? 'text-rm-gold' : 'text-gray-400'
            }`}
          >
            {/* Active indicator dot */}
            {isActive && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-rm-gold rounded-full shadow-[0_0_8px_rgba(201,166,53,0.4)]" />
            )}
            <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-rm-gold/10' : ''}`}>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] leading-tight transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Special Create Button for Instructors */}
      {userRole === UserRole.ADMIN && (
        <button
          onClick={() => onTabChange('create-course')}
          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-rm-green to-[#0f241e] text-rm-gold p-3.5 rounded-2xl shadow-lg shadow-rm-green/30 border-4 border-white hover:scale-105 active:scale-95 transition-transform"
        >
          <PlusCircle size={26} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default BottomNav;