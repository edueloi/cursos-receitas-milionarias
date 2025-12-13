import React from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User } from '../types';

interface SettingsPageProps {
  user: User;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  return (
    <div className="p-6 lg:p-10 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-rm-green mb-2">Configurações</h2>
      <p className="text-gray-600 mb-8">Gerencie seus dados pessoais e preferências de segurança.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          
          {/* Sidebar Settings */}
          <div className="bg-gray-50 border-r border-gray-200 p-6 md:min-h-[500px]">
            <nav className="space-y-1">
              <button className="w-full text-left px-4 py-2 rounded-lg bg-white shadow-sm text-rm-green font-bold text-sm border-l-4 border-rm-gold">
                Meu Perfil
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 hover:text-rm-green font-medium text-sm transition-all border-l-4 border-transparent">
                Segurança
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-600 hover:text-rm-green font-medium text-sm transition-all border-l-4 border-transparent">
                Notificações
              </button>
            </nav>
          </div>

          {/* Form Area */}
          <div className="col-span-2 p-8 space-y-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-gray-800 mb-6">Informações Pessoais</h3>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="h-20 w-20 rounded-full bg-rm-green text-white flex items-center justify-center text-2xl font-bold">
                   {user.name.substring(0,1)}
                </div>
                <div>
                   <Button variant="outline" className="text-xs py-2 px-4">Alterar Foto</Button>
                   <p className="text-xs text-gray-400 mt-2">JPG ou PNG. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Nome Completo" defaultValue={user.name} />
                    <Input label="Cargo/Função" defaultValue={user.role === 'ADMIN' ? 'Produtor' : 'Afiliado'} disabled className="bg-gray-50" />
                 </div>
                 <Input label="Email" defaultValue={user.email} />
                 <Input label="Bio" placeholder="Escreva um pouco sobre você..." />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
               <Button variant="ghost">Cancelar</Button>
               <Button>Salvar Alterações</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;