import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Download, Eye, Share2 } from 'lucide-react';
import Button from '../components/ui/Button';
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
    if (fontKey === 'great-vibes') return '"Great Vibes", cursive';
    if (fontKey === 'allura') return '"Allura", cursive';
    if (fontKey === 'sacramento') return '"Sacramento", cursive';
    if (fontKey === 'pinyon-script') return '"Pinyon Script", cursive';
    return '"Playfair Display", serif';
  };

  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 min-h-screen bg-[#F8F9FA]">
      <div className="mb-10 max-w-4xl">
        <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-rm-gold rounded-full"></span>
            <h2 className="text-3xl font-serif font-bold text-rm-green">Meus Certificados</h2>
        </div>
        <p className="text-gray-600">Comprove sua autoridade e conquistas. Cada certificado representa um passo na sua jornada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 max-w-5xl">
        {completedCourses.map((course) => (
          <div key={course.id} className="group relative bg-white p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-rm-gold via-yellow-200 to-rm-gold opacity-20 rounded-2xl blur-sm group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-[#FDFBF7] h-full rounded-xl p-8 border border-gray-100 overflow-hidden flex flex-col items-center text-center">
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#C9A635 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
               </div>

               <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-b from-rm-gold to-yellow-600 rounded-full flex items-center justify-center shadow-lg mx-auto z-10 relative">
                     <Award size={32} className="text-white drop-shadow-md" />
                  </div>
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-rm-gold rotate-45 -z-0"></div>
               </div>

               <h3 className="font-serif font-bold text-2xl text-rm-green mb-2">{course.title}</h3>
               <div className="w-12 h-1 bg-rm-gold/30 mx-auto mb-4 rounded-full"></div>

               <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                 Certificamos que o aluno concluiu com exito a carga horaria de <strong>{course.totalDuration}</strong>
                 e finalizou todas as aulas do curso.
               </p>

               <div className="mt-auto w-full space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-200 pt-3 mb-4 uppercase tracking-wider font-bold">
                     <span>{completionDate(course.id) || today}</span>
                     <span>{certificateCode(course.id)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="text-xs h-10 border-gray-300 text-gray-600 hover:border-rm-green hover:text-rm-green" onClick={() => setSelectedCourse(course)}>
                      <Eye size={16} className="mr-2" /> Visualizar
                    </Button>
                    <Button variant="primary" className="text-xs h-10 shadow-md" onClick={() => { setSelectedCourse(course); setTimeout(handleDownloadPdf, 50); }}>
                      <Download size={16} className="mr-2" /> Baixar PDF
                    </Button>
                  </div>
                  <button className="w-full py-2 text-xs font-bold text-rm-gold hover:underline flex items-center justify-center gap-1" onClick={() => shareLinkedIn(course)}>
                     <Share2 size={12} /> Compartilhar no LinkedIn
                  </button>
               </div>
            </div>
          </div>
        ))}

        {completedCourses.length === 0 && (
           <div className="col-span-full py-28 text-center bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
               <Award size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-700 mb-2">Sua parede esta vazia</h3>
             <p className="text-gray-500 mb-6 max-w-md">Complete cursos para desbloquear certificados exclusivos.</p>
             <Button variant="outline">Ir para Cursos</Button>
           </div>
        )}
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setSelectedCourse(null)}>
              ✕
            </button>
            <div ref={certificateRef} className="w-full aspect-[1.4/1] bg-gradient-to-br from-[#F7FBF9] via-[#EEF6F1] to-[#E2EFEA] border-4 border-rm-green/40 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#C9A635 1px, transparent 1px)', backgroundSize: '22px 22px' }}></div>
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rm-green/12 blur-2xl"></div>
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-rm-green/18 blur-2xl"></div>
              <div className="absolute inset-y-0 left-0 w-5 bg-gradient-to-b from-rm-green to-[#0f241e]"></div>
              <img
                src={approvedBadgeUrl}
                alt="Aprovado"
                className="absolute top-8 right-10 w-28 h-28 object-contain drop-shadow-lg z-20"
                crossOrigin="anonymous"
              />

              <div className="relative z-10 h-full border border-rm-green/30 rounded-xl p-8 text-center flex flex-col justify-between bg-white/75 backdrop-blur-sm">
                <div className="grid grid-cols-[120px_1fr_120px] items-center">
                  <div className="flex justify-center">
                    <img src={logoUrl} alt="Receitas Milionarias" className="h-24 w-24 object-contain" crossOrigin="anonymous" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm uppercase tracking-[0.35em] text-gray-500">Certificado de Conclusao</p>
                    <h2 className="font-serif text-5xl text-rm-green mt-2">Receitas Milionarias Academy</h2>
                  </div>
                  <div />
                </div>

                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-2xl text-gray-700 leading-relaxed">
                    Certificamos que o aluno{' '}
                    <span className="font-bold text-gray-900">{user?.name || 'Aluno'}</span>{' '}
                    concluiu com sucesso o curso{' '}
                    <span className="font-bold text-rm-green">{selectedCourse.title}</span>{' '}
                    com carga horaria total de{' '}
                    <span className="font-bold text-gray-900">{selectedCourse.totalDuration}</span>.
                  </p>
                  <p className="text-lg text-gray-600 mt-4">Data de conclusao: {completionDate(selectedCourse.id) || today}</p>
                </div>

                <div className="flex items-end justify-between text-xs text-gray-500 mt-6">
                  <div className="text-left">
                    {selectedCourse.creatorEmail && signatureMap[selectedCourse.creatorEmail] ? (
                      <div className="mb-2 text-3xl text-gray-800" style={{ fontFamily: signatureFamily(signatureMap[selectedCourse.creatorEmail].font) }}>
                        {signatureMap[selectedCourse.creatorEmail].text}
                      </div>
                    ) : (
                      <div className="mb-2 text-3xl text-gray-800" style={{ fontFamily: '"Great Vibes", cursive' }}>
                        {selectedCourse.creatorName || 'Instrutor'}
                      </div>
                    )}
                    <div className="h-px w-44 bg-gray-300 mb-2"></div>
                    <p className="text-[10px] uppercase tracking-wider">Instrutor</p>
                  </div>
                  <div className="text-right">
                    <p>{completionDate(selectedCourse.id) || today}</p>
                    <p className="text-[10px] uppercase tracking-wider">{certificateCode(selectedCourse.id)}</p>
                    <p className="text-[10px] text-gray-400 mt-2">Validacao: {window.location.origin}/certificados/validar/{certificateCode(selectedCourse.id)}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedCourse(null)}>Fechar</Button>
              <Button variant="primary" onClick={handleDownloadPdf}>Baixar PDF</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
