import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import { User } from '../types';

interface SignaturePageProps {
  user?: User | null;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const SIGNATURE_FONTS = [
  { label: 'Great Vibes', value: 'great-vibes', family: '"Great Vibes", cursive' },
  { label: 'Allura', value: 'allura', family: '"Allura", cursive' },
  { label: 'Sacramento', value: 'sacramento', family: '"Sacramento", cursive' },
  { label: 'Pinyon Script', value: 'pinyon-script', family: '"Pinyon Script", cursive' }
];

const SignaturePage: React.FC<SignaturePageProps> = ({ user, onShowToast }) => {
  const [text, setText] = useState('');
  const [font, setFont] = useState(SIGNATURE_FONTS[0].value);
  const [loading, setLoading] = useState(false);

  const fontFamily = useMemo(
    () => SIGNATURE_FONTS.find(f => f.value === font)?.family || SIGNATURE_FONTS[0].family,
    [font]
  );

  useEffect(() => {
    const loadSignature = async () => {
      if (!user?.email) return;
      try {
        const assinatura = await api.getSignature(user.email);
        if (assinatura) {
          setText(assinatura.text);
          setFont(assinatura.font);
        } else {
          setText(user.name || '');
        }
      } catch (error) {
        console.error('Erro ao carregar assinatura:', error);
      }
    };
    loadSignature();
  }, [user]);

  const handleSave = async () => {
    if (!user?.email) return;
    if (!text.trim()) {
      onShowToast('error', 'Assinatura vazia', 'Digite o nome do instrutor.');
      return;
    }
    setLoading(true);
    try {
      await api.setSignature(user.email, text.trim(), font);
      onShowToast('success', 'Assinatura salva', 'Sua assinatura foi atualizada.');
    } catch (error: any) {
      onShowToast('error', 'Erro ao salvar', error.message || 'Falha ao salvar assinatura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 min-h-screen bg-[#F8F9FA]">
      <div className="mb-10 max-w-4xl">
        <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-rm-gold rounded-full"></span>
            <h2 className="text-3xl font-serif font-bold text-rm-green">Assinatura do Instrutor</h2>
        </div>
        <p className="text-gray-600">Crie sua assinatura para aparecer nos certificados dos alunos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Nome da assinatura</label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-300"
              placeholder="Ex: Jefferson Silva"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Fonte</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
              value={font}
              onChange={(e) => setFont(e.target.value)}
            >
              {SIGNATURE_FONTS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <Button onClick={handleSave} isLoading={loading} className="px-6">
            Salvar assinatura
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-600 mb-4">Pre-visualizacao</h3>
          <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-[#FDFBF7]">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Instrutor</div>
            <div className="mt-3 text-4xl text-gray-800" style={{ fontFamily }}>{text || 'Seu Nome'}</div>
            <div className="mt-2 h-px w-48 bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePage;
