import React, { useState } from 'react';
import { HelpCircle, BookOpen, Award, Play, FolderOpen, ChevronDown, ChevronRight, Search, Star, ShieldCheck, MessageCircle, Zap, CheckCircle, Monitor, Smartphone, Globe } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ElementType;
}

interface FAQSection {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  items: FAQItem[];
}

const HelpPage: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ 'sobre': true });
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections: Record<string, FAQSection> = {
    sobre: {
      title: 'Sobre o Sistema',
      description: 'Conheça a plataforma Academy',
      icon: Globe,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      items: [
        {
          question: 'O que é a Receitas Milionárias Academy?',
          answer: 'A Academy é a plataforma exclusiva de cursos da Receitas Milionárias. Aqui você tem acesso a cursos completos em vídeo, organizados por módulos e categorias, para aprender tudo sobre vendas, gastronomia lucrativa, marketing digital e muito mais. A plataforma foi desenvolvida para afiliados e produtores que desejam se capacitar e aumentar seus resultados.',
          icon: Globe,
        },
        {
          question: 'Como acesso a plataforma?',
          answer: 'Você acessa com o mesmo e-mail e senha do seu cadastro na Receitas Milionárias. Basta fazer login na tela inicial. Se você esqueceu sua senha, clique em "Esqueceu a senha?" na tela de login para recuperá-la.',
          icon: Monitor,
        },
        {
          question: 'Posso acessar pelo celular?',
          answer: 'Sim! A plataforma é totalmente responsiva e funciona perfeitamente no celular, tablet e computador. Basta acessar pelo navegador do seu dispositivo — não precisa instalar nenhum aplicativo.',
          icon: Smartphone,
        },
      ]
    },
    cursos: {
      title: 'Cursos e Vídeos',
      description: 'Como assistir e acompanhar seus cursos',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      items: [
        {
          question: 'Como encontro os cursos disponíveis?',
          answer: 'Vá até o menu "Catálogo de Cursos" para ver todos os cursos publicados. Você pode filtrar por categoria (Vendas, Gastronomia, Marketing, etc.) e buscar pelo nome do curso. Cada curso mostra uma prévia com duração total, número de módulos e descrição.',
          icon: Search,
        },
        {
          question: 'Como começo a assistir um curso?',
          answer: 'Clique em qualquer curso no catálogo e depois clique em "Assistir" ou "Começar Curso". Você será levado ao player de vídeo onde pode assistir as aulas na ordem dos módulos. Não precisa adicionar o curso previamente — basta clicar e começar a assistir!',
          icon: Play,
        },
        {
          question: 'Como funciona o progresso dos cursos?',
          answer: 'Cada vez que você termina de assistir uma aula, ela é marcada como concluída automaticamente. Você também pode marcar manualmente. O progresso aparece como uma barra de porcentagem no seu painel e na lista "Meus Cursos". Quando todas as aulas de todos os módulos forem concluídas, o curso será marcado como 100% completo.',
          icon: CheckCircle,
        },
        {
          question: 'O que é a seção "Meus Cursos"?',
          answer: 'É onde ficam os cursos que você está acompanhando. Você pode adicionar cursos do catálogo clicando no botão "Adicionar aos Meus Cursos". Também pode favoritar cursos para encontrá-los mais rápido. A aba "Meus Cursos" mostra seu progresso em cada curso e permite continuar de onde parou.',
          icon: Star,
        },
        {
          question: 'Os vídeos ficam disponíveis para sempre?',
          answer: 'Sim! Todos os cursos publicados ficam disponíveis para você assistir quantas vezes quiser, sem limite de tempo. Você pode pausar, voltar e reassistir qualquer aula a qualquer momento.',
          icon: Play,
        },
      ]
    },
    categorias: {
      title: 'Categorias e Organização',
      description: 'Entenda como os cursos são organizados',
      icon: FolderOpen,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
      items: [
        {
          question: 'Quais são as categorias de cursos?',
          answer: 'Os cursos são organizados em categorias como: Vendas (estratégias de vendas orgânicas e pagas), Gastronomia (receitas, precificação, produção), Marketing (redes sociais, copywriting, funis), e outras categorias especiais que os produtores criam. Cada curso pertence a uma categoria principal.',
          icon: FolderOpen,
        },
        {
          question: 'Como funciona a estrutura dos cursos?',
          answer: 'Cada curso é dividido em Módulos, e cada módulo contém várias Aulas (vídeos). Por exemplo, um curso pode ter 3 módulos com 5 aulas cada. Você assiste as aulas em sequência dentro de cada módulo. A estrutura completa aparece na barra lateral do player de vídeo.',
          icon: BookOpen,
        },
        {
          question: 'Posso filtrar cursos por categoria?',
          answer: 'Sim! No Catálogo de Cursos, use os filtros no topo da página para selecionar uma categoria específica. Você também pode usar a barra de busca para encontrar cursos pelo nome ou descrição.',
          icon: Search,
        },
      ]
    },
    certificados: {
      title: 'Certificados',
      description: 'Como ganhar e validar seus certificados',
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      items: [
        {
          question: 'Como ganho um certificado?',
          answer: 'O certificado é gerado automaticamente quando você completa 100% de um curso — ou seja, quando todas as aulas de todos os módulos são marcadas como concluídas. Não precisa fazer nenhuma prova ou teste, basta assistir todas as aulas e marcá-las como concluídas.',
          icon: Award,
        },
        {
          question: 'Onde vejo meus certificados?',
          answer: 'Vá até o menu "Certificados" para ver todos os certificados que você já conquistou. Cada certificado mostra o nome do curso, a data de conclusão e um código de validação único. Você pode visualizar e compartilhar seus certificados.',
          icon: Award,
        },
        {
          question: 'O certificado tem validade?',
          answer: 'Os certificados emitidos pela Academy não possuem prazo de validade — eles ficam disponíveis permanentemente na sua conta. Cada certificado possui um código único que pode ser verificado por qualquer pessoa através da página de validação.',
          icon: ShieldCheck,
        },
        {
          question: 'Como valido um certificado?',
          answer: 'Cada certificado possui um código de validação único. Para verificar a autenticidade, basta acessar a página de validação e inserir o código. O sistema confirmará se o certificado é válido, mostrando o nome do aluno, curso e data de conclusão.',
          icon: CheckCircle,
        },
      ]
    },
    produtor: {
      title: 'Área do Produtor',
      description: 'Para quem cria e gerencia cursos',
      icon: Zap,
      color: 'text-rm-gold',
      bgColor: 'bg-rm-gold/5',
      borderColor: 'border-rm-gold/20',
      items: [
        {
          question: 'O que é a Área do Produtor?',
          answer: 'A Área do Produtor é exclusiva para quem cria conteúdo na plataforma. Nela você pode criar novos cursos, gerenciar módulos e aulas, acompanhar métricas de alunos, configurar assinaturas para certificados e gerenciar sua equipe de afiliados.',
          icon: Zap,
        },
        {
          question: 'Como crio um novo curso?',
          answer: 'No menu lateral, clique em "Criar Novo Curso". Preencha o título, descrição, categoria e thumbnail. Depois adicione os módulos e dentro de cada módulo, adicione as aulas com os links dos vídeos (YouTube embed). Você pode salvar como rascunho e publicar quando estiver pronto.',
          icon: BookOpen,
        },
        {
          question: 'O que é a Assinatura?',
          answer: 'A Assinatura é a sua assinatura personalizada que aparece nos certificados emitidos para os alunos dos seus cursos. Você pode configurá-la na seção "Assinatura" do menu do produtor.',
          icon: ShieldCheck,
        },
        {
          question: 'Como funciona o painel de Afiliados?',
          answer: 'Na seção "Afiliados" você pode convidar novos afiliados, acompanhar vendas, comissões e status de cada membro da sua equipe. Você também pode definir as porcentagens de comissão individualmente.',
          icon: MessageCircle,
        },
      ]
    },
  };

  // Filter items based on search
  const filteredSections = Object.entries(sections).reduce((acc, [key, section]) => {
    if (!searchQuery) {
      acc[key] = section;
      return acc;
    }
    const query = searchQuery.toLowerCase();
    const filteredItems = section.items.filter(
      item => item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query)
    );
    if (filteredItems.length > 0 || section.title.toLowerCase().includes(query)) {
      acc[key] = { ...section, items: filteredItems.length > 0 ? filteredItems : section.items };
    }
    return acc;
  }, {} as Record<string, FAQSection>);

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rm-green via-[#1a3a2f] to-[#0f241e]">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rm-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/2 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
              <HelpCircle size={28} className="text-rm-gold" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Central de <span className="text-rm-gold">Ajuda</span>
              </h1>
              <p className="text-white/50 text-sm mt-0.5">Tudo que você precisa saber sobre a Academy</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative max-w-xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar na ajuda... ex: certificado, vídeo, categoria"
              className="w-full pl-12 pr-4 py-3.5 bg-white/[0.08] border border-white/[0.12] rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-rm-gold/40 focus:bg-white/[0.12] transition-all text-sm backdrop-blur-sm"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-6 text-white/40 text-xs">
            <div className="flex items-center gap-1.5">
              <BookOpen size={14} />
              <span>{Object.values(sections).reduce((a, s) => a + s.items.length, 0)} artigos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FolderOpen size={14} />
              <span>{Object.keys(sections).length} categorias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        
        {/* Quick Links Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {Object.entries(sections).map(([key, section]) => (
            <button
              key={key}
              onClick={() => {
                setOpenSections(prev => ({ ...prev, [key]: true }));
                document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="group p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all text-center"
            >
              <div className={`inline-flex p-2.5 rounded-xl ${section.bgColor} ${section.color} mb-2 group-hover:scale-110 transition-transform`}>
                <section.icon size={20} />
              </div>
              <p className="text-xs font-bold text-gray-700 leading-tight">{section.title}</p>
            </button>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-4">
          {Object.entries(filteredSections).map(([key, section]) => (
            <div
              key={key}
              id={`section-${key}`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden scroll-mt-20"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 hover:bg-gray-50/50 transition-colors"
              >
                <div className={`p-2.5 rounded-xl ${section.bgColor} ${section.color} shrink-0`}>
                  <section.icon size={20} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-800">{section.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{section.description} · {section.items.length} {section.items.length === 1 ? 'artigo' : 'artigos'}</p>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-300 shrink-0 transition-transform duration-300 ${openSections[key] ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Section Items */}
              {openSections[key] && (
                <div className="border-t border-gray-100">
                  {section.items.map((item, i) => {
                    const itemKey = `${key}-${i}`;
                    const isItemOpen = openItems[itemKey];
                    return (
                      <div key={i} className={`${i > 0 ? 'border-t border-gray-50' : ''}`}>
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full flex items-center gap-3 px-5 sm:px-6 py-3.5 sm:py-4 hover:bg-gray-50/80 transition-colors text-left"
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                            isItemOpen ? `${section.bgColor} ${section.color}` : 'bg-gray-50 text-gray-400'
                          }`}>
                            <item.icon size={14} />
                          </div>
                          <span className={`flex-1 text-sm transition-colors ${
                            isItemOpen ? 'font-bold text-gray-800' : 'font-semibold text-gray-600'
                          }`}>
                            {item.question}
                          </span>
                          <ChevronRight
                            size={16}
                            className={`text-gray-300 shrink-0 transition-transform duration-200 ${isItemOpen ? 'rotate-90' : ''}`}
                          />
                        </button>
                        {isItemOpen && (
                          <div className="px-5 sm:px-6 pb-4 sm:pb-5">
                            <div className={`ml-9 p-4 rounded-xl ${section.bgColor}/50 border ${section.borderColor}`}>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State for Search */}
        {searchQuery && Object.keys(filteredSections).length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Search size={28} />
            </div>
            <p className="text-lg font-bold text-gray-400">Nenhum resultado encontrado</p>
            <p className="text-sm text-gray-300 mt-1">Tente buscar por outro termo</p>
          </div>
        )}

        {/* Contact Footer */}
        <div className="mt-8 mb-4 p-6 sm:p-8 bg-gradient-to-r from-rm-green/5 via-white to-rm-gold/5 rounded-2xl border border-gray-100 text-center">
          <div className="inline-flex p-3 bg-rm-gold/10 rounded-2xl mb-3">
            <MessageCircle size={24} className="text-rm-gold" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Ainda tem dúvidas?</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Entre em contato com nossa equipe pelo WhatsApp ou e-mail que teremos prazer em ajudar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
            <a
              href="https://wa.me/5515997575655"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
            <a
              href="mailto:conta@receitasmilionarias.com.br"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors border border-gray-200"
            >
              conta@receitasmilionarias.com.br
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
