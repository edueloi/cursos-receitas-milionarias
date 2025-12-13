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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40 flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            activeTab === item.id ? 'text-rm-gold' : 'text-gray-400'
          }`}
        >
          <item.icon size={24} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}

      {/* Special Create Button for Instructors */}
      {userRole === UserRole.ADMIN && (
        <button
          onClick={() => onTabChange('create-course')}
          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rm-green text-rm-gold p-3 rounded-full shadow-lg border-4 border-white hover:scale-105 transition-transform"
        >
          <PlusCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default BottomNav;