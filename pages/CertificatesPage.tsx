import React from 'react';
import { Award, Download, Eye, Share2 } from 'lucide-react';
import Button from '../components/ui/Button';

const CertificatesPage: React.FC = () => {
  const certificates = [
    { id: 1, course: 'Mestre das Vendas Orgânicas', date: '10/02/2024', code: 'RM-2024-X92', hours: '4.5' },
    { id: 2, course: 'Mindset Milionário', date: '15/01/2024', code: 'RM-2024-B11', hours: '2.0' },
  ];

  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10 min-h-screen bg-[#F8F9FA]">
      <div className="mb-10 max-w-4xl">
        <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-rm-gold rounded-full"></span>
            <h2 className="text-3xl font-serif font-bold text-rm-green">Meus Certificados</h2>
        </div>
        <p className="text-gray-600">Comprove sua autoridade e conquistas. Cada certificado representa um passo na sua jornada milionária.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 max-w-5xl">
        {certificates.map((cert) => (
          <div key={cert.id} className="group relative bg-white p-1 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            
            {/* Gold Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-rm-gold via-yellow-200 to-rm-gold opacity-20 rounded-2xl blur-sm group-hover:opacity-40 transition-opacity"></div>
            
            {/* Paper Content */}
            <div className="relative bg-[#FDFBF7] h-full rounded-xl p-8 border border-gray-100 overflow-hidden flex flex-col items-center text-center">
               
               {/* Background Pattern/Watermark */}
               <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(#C9A635 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
               </div>
               
               {/* Ribbon/Icon */}
               <div className="mb-6 relative">
                  <div className="w-16 h-16 bg-gradient-to-b from-rm-gold to-yellow-600 rounded-full flex items-center justify-center shadow-lg mx-auto z-10 relative">
                     <Award size={32} className="text-white drop-shadow-md" />
                  </div>
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-10 h-10 bg-rm-gold rotate-45 -z-0"></div>
               </div>

               {/* Text Content */}
               <h3 className="font-serif font-bold text-2xl text-rm-green mb-2">{cert.course}</h3>
               <div className="w-12 h-1 bg-rm-gold/30 mx-auto mb-4 rounded-full"></div>
               
               <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                 Certificamos que o aluno concluiu com êxito a carga horária de <strong>{cert.hours} horas</strong> de conteúdo prático.
               </p>

               <div className="mt-auto w-full space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-200 pt-3 mb-4 uppercase tracking-wider font-bold">
                     <span>{cert.date}</span>
                     <span>{cert.code}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="text-xs h-10 border-gray-300 text-gray-600 hover:border-rm-green hover:text-rm-green">
                      <Eye size={16} className="mr-2" /> Visualizar
                    </Button>
                    <Button variant="primary" className="text-xs h-10 shadow-md">
                      <Download size={16} className="mr-2" /> Baixar PDF
                    </Button>
                  </div>
                  <button className="w-full py-2 text-xs font-bold text-rm-gold hover:underline flex items-center justify-center gap-1">
                     <Share2 size={12} /> Compartilhar no LinkedIn
                  </button>
               </div>
            </div>
          </div>
        ))}
        
        {certificates.length === 0 && (
           <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
               <Award size={40} />
             </div>
             <h3 className="text-xl font-bold text-gray-700 mb-2">Sua parede está vazia</h3>
             <p className="text-gray-500 mb-6">Complete cursos para desbloquear certificados exclusivos.</p>
             <Button variant="outline">Ir para Cursos</Button>
           </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;