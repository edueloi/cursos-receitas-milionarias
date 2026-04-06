import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Download, Eye, Share2, Shield, Calendar, Hash, BookOpen, ExternalLink } from 'lucide-react';
import { Course, User } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { api } from '../services/api';
import logoUrl from '../assets/logo-academy-svg.svg';
import approvedBadgeUrl from '../assets/aprovado_badge.svg';

interface CertificatesPageProps {
  courses: Course[];
  user?: User | null;
  certificateMap?: Record<string, { code: string; completedAt: string }>;
}

const CertificatesPage: React.FC<CertificatesPageProps> = ({ courses, user, certificateMap = {} }) => {
  const completedCourses = useMemo(
    () => courses.filter(c => certificateMap[c.id]),
    [courses, certificateMap]
  );

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [signatureMap, setSignatureMap] = useState<Record<string, { text: string; font: string }>>({});
  const certificateRef = useRef<HTMLDivElement>(null);

  const certificateCode = (courseId: string) => certificateMap[courseId]?.code || '';
  const completionDate = (courseId: string) => {
    const date = certificateMap[courseId]?.completedAt;
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };
  const today = new Date().toLocaleDateString('pt-BR');

  const handleDownloadPdf = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save(`certificado-${selectedCourse?.id || 'curso'}.pdf`);
  };

  const shareLinkedIn = (course: Course) => {
    const url = `${window.location.origin}/certificados`;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
  };

  useEffect(() => {
    const loadSignatures = async () => {
      const emails = Array.from(new Set(completedCourses.map(c => c.creatorEmail).filter(Boolean))) as string[];
      if (emails.length === 0) return;
      try {
        const entries = await Promise.all(
          emails.map(async (email) => {
            const assinatura = await api.getSignature(email);
            return [email, assinatura] as const;
          })
        );
        const map: Record<string, { text: string; font: string }> = {};
        entries.forEach(([email, assinatura]) => {
          if (assinatura) map[email] = assinatura;
        });
        setSignatureMap(map);
      } catch (error) {
        console.error('Erro ao carregar assinaturas:', error);
      }
    };
    loadSignatures();
  }, [completedCourses]);

  const signatureFamily = (fontKey?: string) => {
    if (!fontKey) return '"Playfair Display", serif';
    const fontMap: Record<string, string> = {
      'great-vibes': '"Great Vibes", cursive',
      'allura': '"Allura", cursive',
      'sacramento': '"Sacramento", cursive',
      'pinyon-script': '"Pinyon Script", cursive',
      'dancing-script': '"Dancing Script", cursive',
      'parisienne': '"Parisienne", cursive',
      'satisfy': '"Satisfy", cursive',
      'lobster': '"Lobster", cursive',
      'kaushan-script': '"Kaushan Script", cursive',
      'caveat': '"Caveat", cursive',
      'courgette': '"Courgette", cursive',
      'tangerine': '"Tangerine", cursive',
    };
    return fontMap[fontKey] || '"Playfair Display", serif';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 max-w-[1400px] mx-auto w-full">
      
      {/* Hero Header */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rm-gold/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-rm-green/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-rm-gold/20 to-yellow-100 rounded-xl text-rm-gold">
                  <Award size={24} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 tracking-tight">Meus Certificados</h2>
              </div>
              <p className="text-sm text-gray-500 max-w-lg">
                Comprove sua autoridade e conquistas. Cada certificado representa um passo na sua jornada.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-br from-rm-gold/5 to-yellow-50 rounded-2xl border border-rm-gold/10">
                <div className="w-10 h-10 bg-rm-gold/10 rounded-xl flex items-center justify-center">
                  <Award size={20} className="text-rm-gold" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-800">{completedCourses.length}</span>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Certificados</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2.5 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-gray-400" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-800">{completedCourses.length}</span>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Validados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {completedCourses.map((course) => (
          <div key={course.id} className="group relative">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-br from-rm-gold/30 via-yellow-200/20 to-rm-gold/30 rounded-[1.75rem] blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
              {/* Certificate Header with Pattern */}
              <div className="relative bg-gradient-to-br from-[#FDFBF3] to-[#F5F0E0] p-6 sm:p-8 text-center border-b border-rm-gold/10">
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(#C9A635 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                />
                
                {/* Award Icon */}
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-rm-gold to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rm-gold/20 mx-auto rotate-3 group-hover:rotate-0 transition-transform">
                    <Award size={28} className="text-white" />
                  </div>
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-gray-800 leading-tight mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <div className="w-10 h-0.5 bg-rm-gold/30 mx-auto rounded-full" />
              </div>

              {/* Certificate Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col">
                <p className="text-xs sm:text-sm text-gray-500 text-center leading-relaxed mb-5">
                  Certificamos que o aluno concluiu com êxito a carga horária de{' '}
                  <strong className="text-gray-700">{course.totalDuration}</strong> e finalizou todas as aulas.
                </p>

                {/* Info Chips */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <Calendar size={14} className="text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Data</p>
                      <p className="text-xs font-bold text-gray-700 truncate">{completionDate(course.id) || today}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <Hash size={14} className="text-gray-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider font-medium">Código</p>
                      <p className="text-xs font-bold text-gray-700 truncate">{certificateCode(course.id)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setSelectedCourse(course)}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs sm:text-sm font-bold transition-colors"
                    >
                      <Eye size={15} /> Visualizar
                    </button>
                    <button 
                      onClick={() => { setSelectedCourse(course); setTimeout(handleDownloadPdf, 100); }}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-rm-green to-[#0f241e] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rm-green/15 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <Download size={15} /> Baixar PDF
                    </button>
                  </div>
                  <button 
                    className="w-full py-2 text-xs font-bold text-rm-gold hover:text-yellow-600 flex items-center justify-center gap-1.5 hover:bg-rm-gold/5 rounded-lg transition-colors" 
                    onClick={() => shareLinkedIn(course)}
                  >
                    <ExternalLink size={12} /> Compartilhar no LinkedIn
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {completedCourses.length === 0 && (
        <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border border-dashed border-gray-300 mt-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-300 shadow-inner">
            <Award size={36} />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Sua estante está vazia</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto px-4">
            Complete cursos para desbloquear certificados exclusivos e comprovar suas conquistas.
          </p>
          <div className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-sm font-bold mx-auto w-max">
            <BookOpen size={16} /> Explore o catálogo de cursos
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <Award size={18} className="text-rm-gold" />
                <h3 className="text-sm font-bold text-gray-800">Certificado de Conclusão</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rm-green text-white rounded-lg text-xs font-bold hover:bg-[#0f241e] transition-colors"
                >
                  <Download size={14} /> <span className="hidden sm:inline">Baixar PDF</span>
                </button>
                <button 
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-lg font-bold" 
                  onClick={() => setSelectedCourse(null)}
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Certificate Content - Scrollable */}
            <div className="p-3 sm:p-6 overflow-auto max-h-[80vh]">
              <div ref={certificateRef} className="w-full aspect-[1.4/1] bg-gradient-to-br from-[#F7FBF9] via-[#EEF6F1] to-[#E2EFEA] border-4 border-rm-green/40 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#C9A635 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rm-green/12 blur-2xl" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-rm-green/18 blur-2xl" />
                <div className="absolute inset-y-0 left-0 w-5 bg-gradient-to-b from-rm-green to-[#0f241e]" />
                <img
                  src={approvedBadgeUrl}
                  alt="Aprovado"
                  className="absolute top-8 right-10 w-28 h-28 object-contain drop-shadow-lg z-20"
                  crossOrigin="anonymous"
                />

                <div className="relative z-10 h-full border border-rm-green/30 rounded-xl p-4 sm:p-8 text-center flex flex-col justify-between bg-white/75 backdrop-blur-sm">
                  <div className="grid grid-cols-[60px_1fr_60px] sm:grid-cols-[120px_1fr_120px] items-center">
                    <div className="flex justify-center">
                      <img src={logoUrl} alt="Receitas Milionarias" className="h-12 w-12 sm:h-24 sm:w-24 object-contain" crossOrigin="anonymous" />
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] sm:text-sm uppercase tracking-[0.35em] text-gray-500">Certificado de Conclusão</p>
                      <h2 className="font-serif text-lg sm:text-4xl lg:text-5xl text-rm-green mt-1 sm:mt-2">Receitas Milionárias Academy</h2>
                    </div>
                    <div />
                  </div>

                  <div className="max-w-3xl mx-auto text-center px-2">
                    <p className="text-sm sm:text-xl lg:text-2xl text-gray-700 leading-relaxed">
                      Certificamos que o aluno{' '}
                      <span className="font-bold text-gray-900">{user?.name || 'Aluno'}</span>{' '}
                      concluiu com sucesso o curso{' '}
                      <span className="font-bold text-rm-green">{selectedCourse.title}</span>{' '}
                      com carga horária total de{' '}
                      <span className="font-bold text-gray-900">{selectedCourse.totalDuration}</span>.
                    </p>
                    <p className="text-xs sm:text-lg text-gray-600 mt-2 sm:mt-4">Data de conclusão: {completionDate(selectedCourse.id) || today}</p>
                  </div>

                  <div className="flex items-end justify-between text-[8px] sm:text-xs text-gray-500 mt-4 sm:mt-6">
                    <div className="text-left">
                      {selectedCourse.creatorEmail && signatureMap[selectedCourse.creatorEmail] ? (
                        <div className="mb-2 text-xl sm:text-3xl text-gray-800" style={{ fontFamily: signatureFamily(signatureMap[selectedCourse.creatorEmail].font) }}>
                          {signatureMap[selectedCourse.creatorEmail].text}
                        </div>
                      ) : (
                        <div className="mb-2 text-xl sm:text-3xl text-gray-800" style={{ fontFamily: '"Great Vibes", cursive' }}>
                          {selectedCourse.creatorName || 'Instrutor'}
                        </div>
                      )}
                      <div className="h-px w-24 sm:w-44 bg-gray-300 mb-2" />
                      <p className="text-[8px] sm:text-[10px] uppercase tracking-wider">Instrutor</p>
                    </div>
                    <div className="text-right">
                      <p>{completionDate(selectedCourse.id) || today}</p>
                      <p className="text-[8px] sm:text-[10px] uppercase tracking-wider">{certificateCode(selectedCourse.id)}</p>
                      <p className="text-[7px] sm:text-[10px] text-gray-400 mt-2">Validação: {window.location.origin}/certificados/validar/{certificateCode(selectedCourse.id)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
