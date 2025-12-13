import React from 'react';
import { Award, Download, Eye } from 'lucide-react';
import Button from '../components/ui/Button';

const CertificatesPage: React.FC = () => {
  const certificates = [
    { id: 1, course: 'Mestre das Vendas Orgânicas', date: '10/02/2024', code: 'RM-2024-X92' },
    { id: 2, course: 'Mindset Milionário', date: '15/01/2024', code: 'RM-2024-B11' },
  ];

  return (
    <div className="p-6 lg:p-10 animate-fade-in pb-24 lg:pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-rm-green mb-2">Meus Certificados</h2>
        <p className="text-gray-600">Comprove suas conquistas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-white rounded-xl border border-gray-200 p-6 flex items-start gap-4 hover:shadow-lg transition-all border-l-4 border-l-rm-gold">
            <div className="bg-yellow-50 p-3 rounded-full text-rm-gold">
              <Award size={32} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-rm-green text-lg leading-tight mb-1">{cert.course}</h3>
              <p className="text-sm text-gray-500 mb-4">Concluído em: {cert.date}</p>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 py-2 text-xs">
                  <Eye size={14} className="mr-1" /> Ver
                </Button>
                <Button variant="primary" className="flex-1 py-2 text-xs">
                  <Download size={14} className="mr-1" /> PDF
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {certificates.length === 0 && (
           <div className="col-span-full text-center py-16 bg-white rounded-xl">
             <Award size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-500">Você ainda não possui certificados.</p>
             <p className="text-sm text-gray-400">Conclua cursos para desbloquear.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default CertificatesPage;