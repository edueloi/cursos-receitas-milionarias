import React, { useState } from 'react';
import Input from '../components/ui/Input';
import { User } from '../types';
import { User as UserIcon, Lock, Bell, Camera, Save, Shield, Mail, Calendar, Award, ChevronRight } from 'lucide-react';

interface SettingsPageProps {
  user: User;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState('');

  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon, desc: 'Informações pessoais' },
    { id: 'security', label: 'Segurança', icon: Lock, desc: 'Senha e acesso' },
    { id: 'notifications', label: 'Notificações', icon: Bell, desc: 'Preferências de email' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in max-w-[1200px] mx-auto pb-24 lg:pb-10 w-full">
      
      {/* Header */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rm-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative group cursor-pointer shrink-0 mx-auto sm:mx-0">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-rm-green to-[#0f241e] text-white flex items-center justify-center text-2xl sm:text-3xl font-serif font-bold ring-4 ring-white shadow-lg overflow-hidden relative">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user.name.substring(0,1)
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={22} />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-rm-gold text-white p-1.5 rounded-lg ring-2 ring-white shadow-sm">
                <Camera size={12} />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-400 flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
                <Mail size={13} /> {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rm-green/10 text-rm-green text-[10px] font-bold rounded-full">
                  <Award size={11} /> {user.role === 'ADMIN' ? 'Produtor & Admin' : 'Afiliado'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full">
                  <Calendar size={11} /> Membro desde 2024
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Tabs Navigation */}
        <div className="lg:w-60 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24 z-20">
            {/* Mobile: Horizontal scroll */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-none">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-3 px-4 py-3 lg:py-4 text-left transition-all whitespace-nowrap shrink-0 w-full
                    border-b-2 lg:border-b-0 lg:border-l-[3px]
                    ${activeTab === tab.id 
                      ? 'border-rm-green bg-rm-green/5 text-rm-green' 
                      : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
                  `}
                >
                  <div className={`p-1.5 rounded-lg ${activeTab === tab.id ? 'bg-rm-green/10' : 'bg-gray-100'}`}>
                    <tab.icon size={16} />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-bold">{tab.label}</p>
                    <p className="text-[10px] text-gray-400">{tab.desc}</p>
                  </div>
                  <span className="lg:hidden text-xs font-bold">{tab.label}</span>
                  <ChevronRight size={14} className="hidden lg:block ml-auto text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Tab: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 lg:p-8">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <UserIcon size={18} className="text-rm-green" /> Informações Pessoais
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Atualize seus dados de perfil.</p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nome Completo</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green focus:bg-white transition-all"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Email</label>
                      <input
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-400 cursor-not-allowed"
                        value={user.email}
                        disabled
                      />
                      <p className="text-[10px] text-gray-400 mt-1">O email não pode ser alterado.</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Biografia</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green focus:bg-white outline-none text-sm transition-all resize-none placeholder-gray-400"
                      placeholder="Conte um pouco sobre sua jornada e objetivos..."
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      maxLength={500}
                    />
                    <p className="text-[10px] text-gray-400 mt-1 text-right">{bio.length}/500 caracteres</p>
                  </div>
                </div>
              </div>

              {/* Account Info Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6">
                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield size={16} className="text-rm-gold" /> Informações da Conta
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Tipo de Conta</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{user.role === 'ADMIN' ? 'Produtor' : 'Afiliado'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Status</p>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">Ativo</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Último Acesso</p>
                    <p className="text-sm font-bold text-gray-700 mt-0.5">{new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Security */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 lg:p-8">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Lock size={18} className="text-rm-green" /> Alterar Senha
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Mantenha sua conta segura atualizando sua senha periodicamente.</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Senha Atual</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Nova Senha</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Confirmar Nova Senha</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green focus:bg-white transition-all" />
                  </div>
                </div>
              </div>
              
              {/* Security Tips */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100 p-5 sm:p-6">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-800 mb-1">Dicas de Segurança</h4>
                    <ul className="text-xs text-amber-700 space-y-1 leading-relaxed">
                      <li>• Mínimo de 8 caracteres</li>
                      <li>• Use letras maiúsculas e minúsculas</li>
                      <li>• Inclua números e símbolos especiais</li>
                      <li>• Não reutilize senhas de outros serviços</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Notifications */}
          {activeTab === 'notifications' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 lg:p-8">
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Bell size={18} className="text-rm-green" /> Preferências de Notificação
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Escolha como você deseja ser contatado.</p>
                </div>
                
                <div className="space-y-3">
                  {[
                    { title: 'Novos Cursos', desc: 'Receba alertas quando novos conteúdos forem lançados.', icon: '📚', defaultOn: true },
                    { title: 'Progresso do Aluno', desc: 'Emails semanais sobre seu desempenho.', icon: '📈', defaultOn: false },
                    { title: 'Novidades e Ofertas', desc: 'Promoções exclusivas para afiliados.', icon: '🎁', defaultOn: true },
                    { title: 'Segurança da Conta', desc: 'Alertas sobre logins em novos dispositivos.', icon: '🔒', defaultOn: true },
                    { title: 'Certificados Emitidos', desc: 'Notificação quando um aluno concluir seu curso.', icon: '🏆', defaultOn: true },
                    { title: 'Resumo Mensal', desc: 'Relatório mensal de vendas e métricas.', icon: '📊', defaultOn: false },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all bg-gray-50/30 hover:bg-gray-50/80 group">
                      <div className="flex items-start gap-3 pr-4">
                        <span className="text-xl mt-0.5">{item.icon}</span>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm group-hover:text-rm-green transition-colors">{item.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultOn} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rm-green shadow-inner" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors order-2 sm:order-1">
              Cancelar
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rm-green to-[#0f241e] text-white rounded-xl text-sm font-bold shadow-lg shadow-rm-green/15 hover:shadow-xl hover:-translate-y-0.5 transition-all order-1 sm:order-2">
              <Save size={16} /> Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;