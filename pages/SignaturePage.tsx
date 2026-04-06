import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { PenTool, Save, Eye, Check, Type, Sparkles, Award } from 'lucide-react';

interface SignaturePageProps {
  user?: User | null;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const SIGNATURE_FONTS = [
  { label: 'Great Vibes', value: 'great-vibes', family: '"Great Vibes", cursive' },
  { label: 'Allura', value: 'allura', family: '"Allura", cursive' },
  { label: 'Sacramento', value: 'sacramento', family: '"Sacramento", cursive' },
  { label: 'Pinyon Script', value: 'pinyon-script', family: '"Pinyon Script", cursive' },
  { label: 'Dancing Script', value: 'dancing-script', family: '"Dancing Script", cursive' },
  { label: 'Parisienne', value: 'parisienne', family: '"Parisienne", cursive' },
  { label: 'Satisfy', value: 'satisfy', family: '"Satisfy", cursive' },
  { label: 'Lobster', value: 'lobster', family: '"Lobster", cursive' },
  { label: 'Kaushan Script', value: 'kaushan-script', family: '"Kaushan Script", cursive' },
  { label: 'Caveat', value: 'caveat', family: '"Caveat", cursive' },
  { label: 'Courgette', value: 'courgette', family: '"Courgette", cursive' },
  { label: 'Tangerine', value: 'tangerine', family: '"Tangerine", cursive' },
];

const SignaturePage: React.FC<SignaturePageProps> = ({ user, onShowToast }) => {
  const [text, setText] = useState('');
  const [font, setFont] = useState(SIGNATURE_FONTS[0].value);
  const [loading, setLoading] = useState(false);

  const fontFamily = useMemo(
    () => SIGNATURE_FONTS.find(f => f.value === font)?.family || SIGNATURE_FONTS[0].family,
    [font]
  );

  // Load Google Fonts dynamically
  useEffect(() => {
    const fontNames = SIGNATURE_FONTS.map(f => f.label.replace(/ /g, '+'));
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${fontNames.map(n => `family=${n}`).join('&')}&display=swap`;
    link.rel = 'stylesheet';
    if (!document.querySelector(`link[href="${link.href}"]`)) {
      document.head.appendChild(link);
    }
  }, []);

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
      onShowToast('success', 'Assinatura salva', 'Sua assinatura foi atualizada com sucesso.');
    } catch (error: any) {
      onShowToast('error', 'Erro ao salvar', error.message || 'Falha ao salvar assinatura.');
    } finally {
      setLoading(false);
    }
  };

  const displayText = text || 'Seu Nome Aqui';

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 max-w-[1200px] mx-auto w-full">
      
      {/* Header */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-rm-green/10 rounded-xl text-rm-green">
              <PenTool size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 tracking-tight">Assinatura do Instrutor</h2>
          </div>
          <p className="text-sm text-gray-500 max-w-lg">
            Crie sua assinatura personalizada para aparecer nos certificados dos seus alunos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Name Input */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type size={16} className="text-rm-green" />
              <label className="text-sm font-bold text-gray-800">Texto da Assinatura</label>
            </div>
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-rm-green/20 focus:border-rm-green focus:bg-white transition-all placeholder-gray-400"
              placeholder="Ex: Jefferson Silva"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 mt-2">Este nome aparecerá como assinatura nos certificados.</p>
          </div>

          {/* Font Selection - Visual Cards */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-rm-gold" />
                <label className="text-sm font-bold text-gray-800">Estilo da Assinatura</label>
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {SIGNATURE_FONTS.length} estilos
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {SIGNATURE_FONTS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFont(f.value)}
                  className={`group relative w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    font === f.value 
                      ? 'border-rm-green bg-rm-green/5 shadow-sm' 
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                      <p 
                        className={`text-xl sm:text-2xl truncate transition-colors ${
                          font === f.value ? 'text-rm-green' : 'text-gray-700 group-hover:text-gray-900'
                        }`}
                        style={{ fontFamily: f.family }}
                      >
                        {displayText}
                      </p>
                    </div>
                    {font === f.value && (
                      <div className="w-6 h-6 bg-rm-green rounded-full flex items-center justify-center shrink-0 ml-2">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading || !text.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rm-green to-[#0f241e] text-white rounded-2xl font-bold text-sm shadow-lg shadow-rm-green/15 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {loading ? 'Salvando...' : 'Salvar Assinatura'}
          </button>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Live Preview - Certificate Style */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <Eye size={16} className="text-rm-gold" />
              <h3 className="text-sm font-bold text-gray-800">Pré-visualização ao Vivo</h3>
            </div>
            
            <div className="p-5 sm:p-6 lg:p-8">
              {/* Mini Certificate Preview */}
              <div className="relative bg-gradient-to-br from-[#F7FBF9] via-[#EEF6F1] to-[#E2EFEA] border-2 border-rm-green/20 rounded-2xl p-6 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(#C9A635 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                />
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-b from-rm-green to-[#0f241e]" />
                
                <div className="relative z-10">
                  {/* Certificate header */}
                  <div className="text-center mb-6 sm:mb-8">
                    <p className="text-[9px] sm:text-xs uppercase tracking-[0.25em] text-gray-400 font-medium">Certificado de Conclusão</p>
                    <h4 className="font-serif text-lg sm:text-2xl text-rm-green mt-1">Receitas Milionárias Academy</h4>
                  </div>

                  {/* Certificate body */}
                  <div className="text-center mb-6 sm:mb-8">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
                      Certificamos que o aluno <strong className="text-gray-800">{user?.name || 'Nome do Aluno'}</strong> concluiu 
                      com sucesso o curso <strong className="text-rm-green">Nome do Curso</strong>.
                    </p>
                  </div>

                  {/* Signature area */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 pt-6 border-t border-rm-green/10">
                    <div className="text-center sm:text-left">
                      <div 
                        className="text-3xl sm:text-4xl lg:text-5xl text-gray-800 mb-2 transition-all"
                        style={{ fontFamily }}
                      >
                        {displayText}
                      </div>
                      <div className="h-px w-40 sm:w-48 bg-gray-400/40 mb-1.5 mx-auto sm:mx-0" />
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">Instrutor</p>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="w-12 h-12 bg-rm-gold/10 rounded-full flex items-center justify-center mx-auto sm:mx-0 sm:ml-auto mb-1.5">
                        <Award size={20} className="text-rm-gold" />
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-gray-400">{new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Isolated Signature Preview */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PenTool size={14} className="text-rm-green" /> Assinatura Isolada
            </h3>
            <div className="bg-[#FDFBF7] border border-dashed border-rm-gold/20 rounded-2xl p-6 sm:p-8 text-center">
              <div 
                className="text-4xl sm:text-5xl lg:text-6xl text-gray-800 transition-all leading-tight"
                style={{ fontFamily }}
              >
                {displayText}
              </div>
              <div className="w-48 sm:w-56 h-px bg-gray-300 mx-auto mt-3 mb-2" />
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                {SIGNATURE_FONTS.find(f => f.value === font)?.label || 'Fonte'}
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-rm-gold/5 to-yellow-50 rounded-2xl border border-rm-gold/10 p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              💡 <strong>Dica:</strong> Use seu nome completo ou nome artístico para dar um toque profissional aos certificados. 
              A assinatura aparecerá em todos os certificados emitidos para seus alunos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePage;
