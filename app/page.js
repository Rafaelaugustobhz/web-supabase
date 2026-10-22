'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    if (selectedCategory === 'todos') return true;
    return event.event_type === selectedCategory;
  });

  const isUpcomingSoon = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 20;
  };

  const faqList = [
    {
      q: "Como eu cancelo ou peço reembolso de ingressos?",
      a: "Pode solicitar o reembolso diretamente na sua área de utilizador ou através do suporte até 7 dias antes do evento, conforme as políticas vigentes."
    },
    {
      q: "Como localizar meus ingressos?",
      a: "Os seus ingressos ficam salvos na aba 'Meus Ingressos' após o login e também são enviados instantaneamente para o seu e-mail cadastrado com o QR Code."
    },
    {
      q: "Como trocar a titularidade do ingresso?",
      a: "A transferência de titularidade pode ser feita de forma simples nos detalhes do ingresso dentro da sua conta, indicando o e-mail do novo participante."
    },
    {
      q: "Como acesso meu certificado?",
      a: "Para eventos que disponibilizam certificado, o documento fica liberado automaticamente na sua conta após a confirmação de presença no evento."
    },
    {
      q: "Não consigo acessar minha conta, o que fazer?",
      a: "Utilize a opção 'Esqueci minha senha' na página de login para receber um link de redefinição por e-mail ou entre em contato com o suporte."
    }
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
      <div>
        {/* CABEÇALHO GLOBAL */}
        <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg">VA</span>
              <span className="text-xl font-bold tracking-tight text-white">VipAcesso</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link 
                href="/carrinho" 
                className="relative p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-sm font-medium transition-colors flex items-center gap-2"
              >
                🛒 <span className="hidden md:inline">Carrinho</span>
              </Link>

              <Link 
                href="/login" 
                className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-2 transition-colors"
              >
                Entrar
              </Link>

              <Link 
                href="/cadastro?role=producer" 
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all shadow-lg shadow-emerald-500/10"
              >
                Criar Evento
              </Link>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              Plataforma Oficial de Bilheteira
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mt-4 mb-4">
              O seu próximo grande momento começa aqui.
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl">
              Garanta ingressos para shows imperdíveis, espetáculos inesquecíveis e inscrições para as maiores provas com confirmação imediata.
            </p>
          </div>
        </section>

        {/* FILTROS DE CATEGORIA */}
        <section className="max-w-7xl mx-auto px-6 pb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === 'todos'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              🔍 Todos os Eventos
            </button>

            <button
              onClick={() => setSelectedCategory('esporte')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === 'esporte'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              🏃 Esportes
            </button>

            <button
              onClick={() => setSelectedCategory('show')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === 'show'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              🎵 Festas e Shows
            </button>

            <button
              onClick={() => setSelectedCategory('online')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === 'online'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              💻 Eventos Online
            </button>

            <button
              onClick={() => setSelectedCategory('congresso')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === 'congresso'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              🏛️ Congressos e Palestras
            </button>

            <button
              onClick={() => setSelectedCategory('curso')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                selectedCategory === 'curso'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              📚 Cursos e Workshops
            </button>
          </div>
        </section>

        {/* LISTA DE EVENTOS */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>Eventos em Destaque</span>
            <span className="text-xs font-normal text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
              {filteredEvents.length} disponíveis
            </span>
          </h2>

          {loading ? (
            <div className="text-center py-20 text-neutral-500">A carregar eventos disponíveis...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <p className="text-neutral-400 text-lg">Nenhum evento encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const isClose = isUpcomingSoon(event.event_date);

                return (
                  <div 
                    key={event.id} 
                    className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 flex flex-col hover:border-neutral-700 transition-all duration-300 group"
                  >
                    <div className="relative h-52 w-full bg-neutral-800 overflow-hidden">
                      {event.banner_url ? (
                        <img 
                          src={event.banner_url} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-500">Sem Imagem</div>
                      )}

                      <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                        {isClose && (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500 text-black uppercase tracking-wider shadow-md animate-pulse">
                            🔥 Acontece em Breve
                          </span>
                        )}
                        {event.batch_name && (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-600 text-white uppercase tracking-wider shadow-md">
                            🎫 {event.batch_name}
                          </span>
                        )}
                        {event.is_sold_out && (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white uppercase tracking-wider shadow-md">
                            🔴 Esgotado
                          </span>
                        )}
                      </div>

                      <span className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider bg-emerald-500 text-black">
                        {event.event_type || 'Geral'}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <span className="text-sm font-medium text-emerald-400 mb-1">{event.category || 'Geral'}</span>
                      <h3 className="text-xl font-bold mb-2 line-clamp-1">{event.title}</h3>
                      <p className="text-neutral-400 text-sm mb-6 line-clamp-2 flex-grow">{event.description}</p>
                      
                      <div className="border-t border-neutral-800 pt-4 mt-auto">
                        <div className="flex justify-between text-xs text-neutral-400 mb-4">
                          <span>📍 {event.location}</span>
                          <span>📅 {new Date(event.event_date).toLocaleDateString('pt-BR')}</span>
                        </div>

                        {event.is_sold_out ? (
                          <button 
                            disabled
                            className="block w-full text-center py-3 px-4 bg-neutral-800 text-neutral-500 font-semibold rounded-xl cursor-not-allowed"
                          >
                            Esgotado
                          </button>
                        ) : (
                          <Link 
                            href={`/eventos/${event.id}`}
                            className="block w-full text-center py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-colors"
                          >
                            Ver Detalhes e Ingressos
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FAQ */}
        <section className="bg-neutral-900/50 border-t border-neutral-800 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold">Tire suas dúvidas aqui</h2>
                <p className="text-neutral-400 text-sm mt-1">Respostas rápidas para as principais questões sobre ingressos e acesso.</p>
              </div>
              <a 
                href="https://wa.me/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2 whitespace-nowrap"
              >
                💬 Suporte via WhatsApp
              </a>
            </div>

            <div className="space-y-4">
              {faqList.map((item, index) => (
                <div 
                  key={index}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left font-semibold flex justify-between items-center hover:bg-neutral-800/50 transition-colors"
                  >
                    <span>{item.q}</span>
                    <span className="text-emerald-400 text-xl font-bold">
                      {openFaq === index ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-neutral-400 text-sm border-t border-neutral-800/50 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECÇÃO BAIXE O APP */}
        <section className="border-t border-neutral-800 py-20 px-6 bg-gradient-to-b from-neutral-950 to-neutral-900">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                Disponível para telemóvel
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-4">
                Compre também pelo App
              </h2>
              <p className="text-neutral-400 text-base mb-8">
                Tenha todas as suas experiências, ingressos com QR Code e inscrições na palma da mão. Baixe o aplicativo oficial do VipAcesso.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#appstore" 
                  className="flex items-center gap-3 bg-black hover:bg-neutral-900 border border-neutral-800 px-5 py-3 rounded-xl transition-all shadow-md group"
                >
                  <span className="text-2xl"></span>
                  <div className="text-left">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Baixar na</p>
                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">App Store</p>
                  </div>
                </a>

                <a 
                  href="#googleplay" 
                  className="flex items-center gap-3 bg-black hover:bg-neutral-900 border border-neutral-800 px-5 py-3 rounded-xl transition-all shadow-md group"
                >
                  <span className="text-2xl">▶</span>
                  <div className="text-left">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Disponível no</p>
                    <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Google Play</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="w-72 h-96 bg-neutral-900 rounded-3xl border-4 border-neutral-800 flex flex-col items-center justify-center p-6 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-2 w-20 h-4 bg-neutral-800 rounded-full"></div>
                <span className="bg-emerald-500 text-black font-black px-3 py-1.5 rounded-xl text-lg mb-4">VA</span>
                <h3 className="font-bold text-lg mb-2">VipAcesso Mobile</h3>
                <p className="text-xs text-neutral-400 mb-6">Todas as experiências em um só lugar com acesso rápido e seguro.</p>
                <span className="bg-emerald-500 text-black font-semibold text-xs px-4 py-2 rounded-xl">Acessar Experiências</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECÇÃO PARA PRODUTORES DE EVENTOS */}
        <section className="bg-neutral-950 border-t border-neutral-800 py-16 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Para Produtores</span>
              <h2 className="text-3xl font-extrabold mt-2 mb-3">Crie eventos, divulgue e venda ingressos com facilidade</h2>
              <p className="text-neutral-400">Tenha controlo total sobre as suas vendas, lotes, relatórios de público e check-in num só lugar.</p>
            </div>
            <Link 
              href="/cadastro?role=producer"
              className="px-8 py-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold whitespace-nowrap transition-all shadow-xl"
            >
              Começar a Vender Agora
            </Link>
          </div>
        </section>
      </div>

      {/* RODAPÉ COM SLOGAN */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-8 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-black font-black px-2 py-1 rounded-lg text-sm">VA</span>
            <span className="font-bold tracking-tight">VipAcesso</span>
          </div>
          <p className="text-neutral-500 text-sm">
            VipAcesso: O passaporte oficial para as suas melhores experiências.
          </p>
          <p className="text-neutral-600 text-xs">
            © 2026 VipAcesso. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  );
}