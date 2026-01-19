import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { Bell, LogOut, User as UserIcon, Menu, ChevronDown, Settings, HelpCircle, GraduationCap, MessageCircle, Award, BookOpen } from 'lucide-react';
import { api } from '../../services/api';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  toggleSidebar: () => void;
  onNavigate: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, toggleSidebar, onNavigate }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; type: string; title: string; body: string; at: string }[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    const storageKey = `rm_read_notifications_${user.email}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setReadNotificationIds(JSON.parse(stored));
    } catch {
      setReadNotificationIds([]);
    }
    const load = async () => {
      setIsLoadingNotifications(true);
      try {
        const data = await api.getNotifications(user.email);
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Erro ao carregar notificacoes:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };
    load();
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) return;
    const storageKey = `rm_read_notifications_${user.email}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(readNotificationIds));
    } catch {
      // Ignore storage errors
    }
  }, [readNotificationIds, user?.email]);

  const formatRelativeTime = (iso: string) => {
    const time = new Date(iso).getTime();
    if (!time || Number.isNaN(time)) return 'Agora';
    const diff = Date.now() - time;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `Há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Há ${hours}h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Ontem' : `Há ${days} dias`;
  };

  const unreadNotifications = notifications.filter(note => !readNotificationIds.includes(note.id));
  const markAsRead = (id: string) => {
    setReadNotificationIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };
  const clearAllNotifications = () => {
    setReadNotificationIds(notifications.map(n => n.id));
  };

  const getNotificationStyle = (type: string) => {
    if (type === 'new-student') return { icon: GraduationCap, color: 'bg-blue-50 text-blue-600' };
    if (type === 'certificate') return { icon: Award, color: 'bg-rm-gold/20 text-rm-green' };
    if (type === 'question' || type === 'answer') return { icon: MessageCircle, color: 'bg-purple-50 text-purple-600' };
    if (type === 'new-course') return { icon: BookOpen, color: 'bg-green-50 text-green-600' };
    return { icon: Bell, color: 'bg-gray-100 text-gray-500' };
  };

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setIsProfileOpen(false);
  };

  if (!user) return null;

  return (
    <header className="h-20 fixed top-0 right-0 left-0 z-40 px-4 lg:px-8 transition-all duration-300 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm flex items-center justify-between">
      
      {/* Left Section: Menu & Logo */}
      <div className="flex items-center gap-4 lg:gap-6 flex-1">
        <button 
          onClick={toggleSidebar} 
          className="group p-2.5 rounded-xl hover:bg-gray-100/80 active:bg-gray-200 transition-all duration-200 focus:outline-none"
          title="Abrir Menu"
        >
          <Menu size={26} className="text-gray-600 group-hover:text-rm-green transition-colors" />
        </button>

        {/* Composed Logo (Light Theme) */}
        <div className="flex items-center gap-2 select-none">
           <img 
             src="https://receitasmilionarias.com.br/static/images/logo.png" 
             alt="Logo" 
             className="h-9 w-9 object-contain"
           />
           <div className="flex flex-col">
             <span className="font-serif font-bold text-rm-green text-lg leading-none tracking-tight">Receitas</span>
             <span className="font-serif font-bold text-rm-gold text-lg leading-none tracking-tight">Milionárias</span>
           </div>
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-3 lg:gap-6">
        
        {/* Notification Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2.5 text-gray-400 hover:text-rm-gold transition-colors hover:bg-gray-50 rounded-full group"
          >
            <Bell size={22} />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white group-hover:scale-110 transition-transform"></span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 animate-fade-in origin-top-right z-50 ring-1 ring-black/5">
              <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">Notificações</p>
                  <p className="text-xs text-gray-400">Últimas atualizações</p>
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs font-bold text-rm-gold hover:underline"
                  >
                    Limpar tudo
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="px-4 py-6 text-sm text-gray-500">Carregando...</div>
                ) : unreadNotifications.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-gray-500">Nenhuma notificação no momento.</div>
                ) : (
                  unreadNotifications.map(note => {
                    const meta = getNotificationStyle(note.type);
                    const Icon = meta.icon;
                    return (
                      <button
                        key={note.id}
                        onClick={() => markAsRead(note.id)}
                        className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3"
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${meta.color}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800">{note.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{note.body}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(note.at)}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>
        
        {/* User Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`
              flex items-center gap-3 pl-2 pr-2 py-1.5 rounded-full transition-all border
              ${isProfileOpen ? 'bg-gray-50 border-gray-200 ring-2 ring-rm-gold/10' : 'border-transparent hover:bg-gray-50 hover:border-gray-100'}
            `}
          >
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="text-sm font-bold text-gray-700 leading-none">{user.name.split(' ')[0]}</span>
              <span className="text-[10px] text-rm-gold font-bold uppercase tracking-wide mt-0.5">
                {user.role === UserRole.ADMIN ? 'Produtor' : 'Afiliado'}
              </span>
            </div>
            
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rm-green to-[#0f241e] p-0.5 shadow-md">
               <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                 {user.avatarUrl ? (
                   <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                 ) : (
                   <span className="font-serif font-bold text-rm-green text-lg">{user.name.charAt(0)}</span>
                 )}
               </div>
            </div>
            
            <ChevronDown 
              size={14} 
              className={`text-gray-400 hidden md:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-rm-green' : ''}`} 
            />
          </button>
          
          {/* Dropdown Menu (Click based) */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-fade-in origin-top-right z-50 ring-1 ring-black/5">
               {/* Mobile Header in Dropdown */}
               <div className="px-5 py-4 border-b border-gray-50 mb-2 bg-gray-50/50 md:hidden">
                 <p className="text-sm font-bold text-gray-800">{user.name}</p>
                 <p className="text-xs text-rm-gold font-bold">{user.email}</p>
               </div>
               
               <div className="px-2 space-y-1">
                 <button 
                   onClick={() => handleNavClick('settings')}
                   className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-rm-green/5 hover:text-rm-green rounded-xl transition-colors flex items-center gap-3"
                 >
                   <UserIcon size={18} /> Meu Perfil
                 </button>
                 <button 
                   onClick={() => handleNavClick('settings')}
                   className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-rm-green/5 hover:text-rm-green rounded-xl transition-colors flex items-center gap-3"
                 >
                   <Settings size={18} /> Configurações
                 </button>
                 <button 
                   onClick={() => handleNavClick('settings')}
                   className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-rm-green/5 hover:text-rm-green rounded-xl transition-colors flex items-center gap-3"
                 >
                   <HelpCircle size={18} /> Ajuda & Suporte
                 </button>
               </div>
               
               <div className="border-t border-gray-100 my-2 mx-4"></div>
               
               <div className="px-2 pb-1">
                 <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors group">
                   <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
                   Sair do Sistema
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
