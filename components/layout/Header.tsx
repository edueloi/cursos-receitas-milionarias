import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { Bell, LogOut, User as UserIcon, Menu, ChevronDown, Settings, HelpCircle, GraduationCap, MessageCircle, Award, BookOpen, Crown } from 'lucide-react';
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
    if (type === 'new-student') return { icon: GraduationCap, color: 'bg-blue-50 text-blue-600', ring: 'ring-blue-100' };
    if (type === 'certificate') return { icon: Award, color: 'bg-rm-gold/10 text-rm-gold', ring: 'ring-rm-gold/20' };
    if (type === 'question' || type === 'answer') return { icon: MessageCircle, color: 'bg-purple-50 text-purple-600', ring: 'ring-purple-100' };
    if (type === 'new-course') return { icon: BookOpen, color: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-100' };
    return { icon: Bell, color: 'bg-gray-100 text-gray-500', ring: 'ring-gray-200' };
  };

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setIsProfileOpen(false);
  };

  if (!user) return null;

  return (
    <header className="h-16 sm:h-[68px] fixed top-0 right-0 left-0 z-40 px-3 sm:px-5 lg:px-8 transition-all duration-300 bg-white/95 backdrop-blur-xl border-b border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
      
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button 
          onClick={toggleSidebar} 
          className="group relative p-2 sm:p-2.5 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
          title="Abrir Menu"
        >
          <div className="flex flex-col gap-[5px] w-[18px]">
            <span className="block h-[2px] w-full bg-gray-400 rounded-full group-hover:bg-rm-green group-hover:w-full transition-all duration-300" />
            <span className="block h-[2px] w-[70%] bg-gray-400 rounded-full group-hover:bg-rm-gold group-hover:w-full transition-all duration-300 delay-75" />
            <span className="block h-[2px] w-[85%] bg-gray-400 rounded-full group-hover:bg-rm-green group-hover:w-full transition-all duration-300 delay-150" />
          </div>
        </button>

        <div className="flex items-center gap-2 select-none min-w-0 cursor-pointer group" onClick={() => handleNavClick('dashboard')}>
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-105 transition-transform shrink-0">
            <img 
              src="https://receitasmilionarias.com.br/static/images/logo.png" 
              alt="Logo" 
              className="h-5 w-5 sm:h-6 sm:w-6 object-contain relative z-10"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif font-bold text-rm-green text-sm sm:text-base leading-none tracking-tight">Receitas</span>
            <span className="font-serif font-bold text-rm-gold text-sm sm:text-base leading-none tracking-tight">Milionárias</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
        
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`
              relative p-2 sm:p-2.5 rounded-xl transition-all active:scale-95
              ${isNotificationsOpen 
                ? 'bg-gray-100 text-rm-green' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
            `}
          >
            <Bell size={20} />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-md shadow-red-500/30 animate-pulse">
                {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 sm:right-0 top-full mt-2 w-[calc(100vw-24px)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in origin-top-right z-50 ring-1 ring-black/5 max-h-[80vh] flex flex-col" style={{ right: 'max(-12px, calc(-50vw + 50%))' }}>
              {/* Notification Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <p className="text-sm font-bold text-gray-800">Notificações</p>
                  <p className="text-[10px] text-gray-400">
                    {unreadNotifications.length > 0 ? `${unreadNotifications.length} nova${unreadNotifications.length > 1 ? 's' : ''}` : 'Tudo em dia'}
                  </p>
                </div>
                {unreadNotifications.length > 0 && (
                  <button onClick={clearAllNotifications} className="text-[10px] font-bold text-rm-green bg-rm-green/5 px-2.5 py-1 rounded-full hover:bg-rm-green/10 transition-colors">
                    Limpar tudo
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto flex-1">
                {isLoadingNotifications ? (
                  <div className="px-5 py-8 text-center">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-rm-green rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Carregando...</p>
                  </div>
                ) : unreadNotifications.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300">
                      <Bell size={20} />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Nenhuma notificação</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">Você está em dia!</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {unreadNotifications.map(note => {
                      const meta = getNotificationStyle(note.type);
                      const Icon = meta.icon;
                      return (
                        <button
                          key={note.id}
                          onClick={() => markAsRead(note.id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 group"
                        >
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${meta.color} ring-1 ${meta.ring} shrink-0 group-hover:scale-105 transition-transform`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{note.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{note.body}</p>
                            <p className="text-[10px] text-gray-300 mt-1">{formatRelativeTime(note.at)}</p>
                          </div>
                          <div className="w-2 h-2 bg-rm-green rounded-full mt-2 shrink-0 opacity-60" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="h-7 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-0.5 hidden sm:block" />
        
        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`
              flex items-center gap-2 sm:gap-2.5 p-1.5 sm:pl-3 sm:pr-2 rounded-xl transition-all border
              ${isProfileOpen ? 'bg-gray-50 border-gray-200 shadow-sm' : 'border-transparent hover:bg-gray-50'}
            `}
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-700 leading-none">{user.name.split(' ')[0]}</span>
              <span className="text-[10px] text-rm-gold font-bold uppercase tracking-wide mt-0.5 flex items-center gap-0.5">
                {user.role === UserRole.ADMIN && <Crown size={8} />}
                {user.role === UserRole.ADMIN ? 'Produtor' : 'Afiliado'}
              </span>
            </div>
            
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-rm-green to-[#0f241e] p-[2px] shadow-md hover:shadow-lg transition-shadow">
              <div className="h-full w-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-serif font-bold text-rm-green text-base">{user.name.charAt(0)}</span>
                )}
              </div>
            </div>
            
            <ChevronDown 
              size={14} 
              className={`text-gray-400 hidden sm:block transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {/* Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in origin-top-right z-50 ring-1 ring-black/5 overflow-hidden">
              
              {/* User info header */}
              <div className="px-4 py-4 bg-gradient-to-r from-rm-green/5 via-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rm-green to-[#0f241e] p-[2px] shadow-md">
                    <div className="h-full w-full rounded-[9px] bg-white flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-serif font-bold text-rm-green text-sm">{user.name.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                    user.role === UserRole.ADMIN
                      ? 'bg-rm-gold/10 text-rm-gold border border-rm-gold/20'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {user.role === UserRole.ADMIN && <Crown size={8} />}
                    {user.role === UserRole.ADMIN ? 'Produtor' : 'Afiliado'}
                  </span>
                </div>
              </div>
              
              <div className="p-1.5 space-y-0.5">
                <button 
                  onClick={() => handleNavClick('settings')}
                  className="w-full text-left px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:bg-rm-green/5 hover:text-rm-green rounded-xl transition-all flex items-center gap-2.5 group"
                >
                  <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-rm-green/10 transition-colors">
                    <UserIcon size={14} className="group-hover:text-rm-green transition-colors" />
                  </div>
                  Meu Perfil
                </button>
                <button 
                  onClick={() => handleNavClick('help')}
                  className="w-full text-left px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:bg-rm-green/5 hover:text-rm-green rounded-xl transition-all flex items-center gap-2.5 group"
                >
                  <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-rm-green/10 transition-colors">
                    <HelpCircle size={14} className="group-hover:text-rm-green transition-colors" />
                  </div>
                  Ajuda & Suporte
                </button>
              </div>
              
              <div className="h-px bg-gray-100 mx-3" />
              
              <div className="p-1.5">
                <button 
                  onClick={onLogout} 
                  className="w-full text-left px-3.5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-all group"
                >
                  <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                    <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  </div>
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
