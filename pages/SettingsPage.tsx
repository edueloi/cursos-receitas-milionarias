import React, { useState } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User } from '../types';
import { User as UserIcon, Lock, Bell, Camera, Save, LogOut, Check } from 'lucide-react';

interface SettingsPageProps {
  user: User;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  
  // Mock states for form
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState('');
  
  // Tabs configuration
  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: UserIcon },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ];

  return (
    <div className="p-4 lg:p-10 animate-fade-in max-w-5xl mx-auto pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-rm-green mb-2">Configurações</h2>
        <p className="text-gray-600">Gerencie seus dados e preferências da conta.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar / Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 lg:p-4 sticky top-24 z-20">
             <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
               {tabs.map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`
                     flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-shrink-0
                     ${activeTab === tab.id 
                       ? 'bg-rm-green text-white shadow-md' 
                       : 'text-gray-500 hover:bg-gray-50 hover:text-rm-green'}
                   `}
                 >
                   <tab.icon size={18} />
                   {tab.label}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 relative">
            
            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">
                    <div className="relative group cursor-pointer">
                       <div className="h-24 w-24 rounded-full bg-rm-green text-white flex items-center justify-center text-3xl font-serif font-bold ring-4 ring-white shadow-lg overflow-hidden relative">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            user.name.substring(0,1)
                          )}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Camera className="text-white drop-shadow-md" size={24} />
                          </div>
                       </div>
                       <div className="absolute bottom-0 right-0 bg-rm-gold text-white p-1.5 rounded-full ring-2 ring-white shadow-sm md:hidden">
                          <Camera size={14} />
                       </div>
                    </div>
                    <div className="text-center sm:text-left">
                       <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
                       <p className="text-sm text-gray-500 mb-3">{user.role === 'ADMIN' ? 'Produtor & Administrador' : 'Afiliado Parceiro'}</p>
                       <Button variant="outline" className="text-xs py-2 h-auto mx-auto sm:mx-0 border-gray-300 text-gray-600">Alterar Foto</Button>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <Input label="Nome Completo" value={name} onChange={e => setName(e.target.value)} />
                       <Input label="Email" value={user.email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed opacity-70" />
                    </div>
                    
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Biografia</label>
                       <textarea 
                         rows={4}
                         className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rm-gold outline-none text-sm transition-all resize-none placeholder:text-gray-400"
                         placeholder="Conte um pouco sobre sua jornada e objetivos..."
                         value={bio}
                         onChange={e => setBio(e.target.value)}
                       />
                       <p className="text-xs text-gray-400 mt-2 text-right">0/500 caracteres</p>
                    </div>
                 </div>
              </div>
            )}

            {/* Tab: Security */}
            {activeTab === 'security' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Alterar Senha</h3>
                    <p className="text-sm text-gray-500">Mantenha sua conta segura atualizando sua senha periodicamente.</p>
                 </div>

                 <div className="space-y-5 max-w-lg">
                    <Input type="password" label="Senha Atual" placeholder="••••••••" />
                    <Input type="password" label="Nova Senha" placeholder="••••••••" />
                    <Input type="password" label="Confirmar Nova Senha" placeholder="••••••••" />
                 </div>
                 
                 <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 items-start">
                    <Lock className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                       Sua senha deve conter pelo menos 8 caracteres. Recomendamos o uso de letras maiúsculas, números e símbolos para maior segurança.
                    </p>
                 </div>
              </div>
            )}

            {/* Tab: Notifications */}
            {activeTab === 'notifications' && (
               <div className="space-y-6 animate-fade-in">
                  <div className="pb-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Preferências de Notificação</h3>
                    <p className="text-sm text-gray-500">Escolha como você deseja ser contatado.</p>
                 </div>
                 
                 <div className="space-y-3">
                    {[
                      { title: 'Novos Cursos', desc: 'Receba alertas quando novos conteúdos forem lançados.' },
                      { title: 'Progresso do Aluno', desc: 'Emails semanais sobre seu desempenho.' },
                      { title: 'Novidades e Ofertas', desc: 'Promoções exclusivas para afiliados.' },
                      { title: 'Segurança da Conta', desc: 'Alertas sobre logins em novos dispositivos.' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-rm-gold/30 transition-all bg-gray-50/30">
                         <div className="pr-4">
                            <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input type="checkbox" className="sr-only peer" defaultChecked={idx !== 1} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rm-green"></div>
                         </label>
                      </div>
                    ))}
                 </div>
               </div>
            )}

            {/* Footer Actions (Stacked on Mobile) */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
               <Button variant="ghost" className="w-full sm:w-auto order-2 sm:order-1 text-gray-500">
                 Cancelar
               </Button>
               <Button className="w-full sm:w-auto shadow-lg shadow-rm-gold/20 order-1 sm:order-2">
                 <Save size={18} className="mr-2" /> Salvar Alterações
               </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;