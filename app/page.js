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

  // Verificar se o evento acontece nos próximos 20 dias
  const isUpcomingSoon = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 20;
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between">
      <div>
        {/* CABEÇALHO GLOBAL (Aparece em todas as páginas) */}
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
                href="/auth/login" 
                className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-2 transition-colors"
              >
                Entrar
              </Link>

              <Link 
                href="/admin" 
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

        {/* LISTA DE EVENTOS */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>Eventos em Destaque</span>
            <span className="text-xs font-normal text-neutral-500 bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
              {events.length} disponíveis
            </span>
          </h2>

          {loading ? (
            <div className="text-center py-20 text-neutral-500">A carregar eventos disponíveis...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800">
              <p className="text-neutral-400 text-lg">Nenhum evento encontrado na base de dados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => {
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

                      {isClose && (
                        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold rounded-full bg-amber-500 text-black uppercase tracking-wider shadow-md animate-pulse">
                          🔥 Acontece em Breve
                        </span>
                      )}

                      <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                        event.event_type === 'esporte' 
                          ? 'bg-emerald-500 text-black' 
                          : 'bg-purple-600 text-white'
                      }`}>
                        {event.event_type === 'esporte' ? 'Esporte' : 'Show'}
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

                        <Link 
                          href={`/eventos/${event.id}`}
                          className="block w-full text-center py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-colors"
                        >
                          Ver Detalhes e Ingressos
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECÇÃO PARA PRODUTORES DE EVENTOS */}
        <section className="bg-gradient-to-r from-neutral-900 to-neutral-950 border-t border-neutral-800 py-16 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Para Produtores</span>
              <h2 className="text-3xl font-extrabold mt-2 mb-3">Crie eventos, divulgue e venda ingressos com facilidade</h2>
              <p className="text-neutral-400">Tenha controlo total sobre as suas vendas, lotes, relatórios de público e check-in num só lugar.</p>
            </div>
            <Link 
              href="/admin"
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